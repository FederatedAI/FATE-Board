/*
 * Copyright 2019 The FATE Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.webank.ai.fate.board.websocket;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.jcraft.jsch.Channel;
import com.webank.ai.fate.board.conf.Configurator;
import com.webank.ai.fate.board.disruptor.LogFileTransferEventProducer;
import com.webank.ai.fate.board.global.Dict;
import com.webank.ai.fate.board.log.LogFileService;
import com.webank.ai.fate.board.log.LogService;
import com.webank.ai.fate.board.pojo.SshInfo;
import com.webank.ai.fate.board.services.JobManagerService;
import com.webank.ai.fate.board.ssh.SshService;
import com.webank.ai.fate.board.utils.GetSystemInfo;
import com.webank.ai.fate.board.utils.LogHandle;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ServerEndpoint(value = "/log/new/{jobId}/{role}/{partyId}/{componentId}", configurator = Configurator.class)
@Component
public class LogWebSocketController implements InitializingBean, ApplicationContextAware {
    private static final Logger logger = LoggerFactory.getLogger(LogWebSocketController.class);

    /**
     * call method when connection build
     */
    @OnOpen
    public synchronized void onOpen(Session session, @PathParam("jobId") String jobId,
                                    @PathParam("role") String role,
                                    @PathParam("partyId") String partyId,
                                    @PathParam("componentId") String componentId
    ) throws Exception {
        Preconditions.checkArgument(StringUtils.isNoneEmpty(jobId, role, partyId, componentId));
        logger.info("input: {},{},{},{}", jobId, role, partyId, componentId);
        LogService logService = new LogService(jobId, role, partyId, componentId, session, logFileService, sshService);

        new Thread(logService).start();
    }


    /**
     * call method when connection close
     */
    @OnClose
    public void onClose(Session session) {

        logger.info("websocket session {} closed", session);

    }


    /**
     * call method when receive message from client
     *
     * @param message message from client
     */
    @OnMessage
    public void onMessage(String message,
                          Session session,
                          @PathParam("jobId") String jobId,
                          @PathParam("role") String role,
                          @PathParam("partyId") String partyId,
                          @PathParam("componentId") String componentId) throws Exception {
        synchronized (session) {
            //check input parameters
            logger.info("receive websocket parameter:{} {} {} {} {}", jobId, role, partyId, componentId, message);

            Preconditions.checkArgument(StringUtils.isNoneEmpty(jobId, role, partyId, componentId, message));
            JSONObject messageObject = JSON.parseObject(message);
            String type = messageObject.getString("type");
            Integer begin = messageObject.getInteger("begin");
            Integer end = messageObject.getInteger("end");

            Preconditions.checkArgument(StringUtils.isNoneEmpty(type, String.valueOf(begin), String.valueOf(end)));
            if (begin > end) {
                return;
            }

            Preconditions.checkArgument(LogFileService.checkPathParameters(jobId, role, partyId, componentId, type));


            //build log path
            String logPath = logFileService.buildLogPath(jobId, role, partyId, componentId, type);
            Preconditions.checkArgument(StringUtils.isNoneEmpty(logPath));

            List<Map<String, Object>> logResults = Lists.newArrayList();

            //judge log location and get logs
            File file = new File(logPath);
            if (file.exists()) {

                String[] cmd = {"sh", "-c", "tail -n +" + begin + " " + logPath + " | head -n " + (end - begin + 1)};

                Process process = Runtime.getRuntime().exec(cmd);
                InputStream inputStream = process.getInputStream();
                BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
                try {
                    String content = null;
                    int lineNumber = begin;
                    do {
                        content = reader.readLine();
                        if (content != null) {

                            //replace sensitive information
                            String finalLog = LogHandle.handleLog(content);
                            logResults.add(LogFileService.toLogMap(finalLog, lineNumber));
                            lineNumber++;
                        }
                    } while (content != null);
                    logger.info("execute  cmd : {} ", (Object) cmd);
                } finally {
                    try {
                        reader.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    try {
                        inputStream.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    try {
                        process.destroyForcibly();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            } else {
                //get remote ip
                String jobIp = logFileService.getJobIp(jobId, role, partyId);
                if (StringUtils.isEmpty(jobIp)) {
                    logger.error("remote ip {} doesn't exist", jobIp);
                } else {
                    SshInfo sshInfo = sshService.getSSHInfo(jobIp);
                    if (sshInfo != null) {
                        com.jcraft.jsch.Session jschSession = sshService.connect(sshInfo);

                        String cmd = "tail -n +" + begin + " " + logPath + " | head -n " + (end - begin + 1);
                        Channel channel = sshService.executeCmd(jschSession, cmd);

                        InputStream inputStream = channel.getInputStream();
                        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
                        try {
                            String content;
                            int lineNumber = begin;
                            do {
                                content = reader.readLine();
                                if (content != null) {
                                    //replace sensitive information
                                    String finalLog = LogHandle.handleLog(content);
                                    logResults.add(LogFileService.toLogMap(finalLog, lineNumber));
                                    lineNumber++;
                                }
                            } while (content != null);
                        } finally {
                            try {
                                reader.close();
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                            try {
                                inputStream.close();
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                            try {
                                channel.disconnect();
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }

                        //pull logs to local
                        String jobStatus = logFileService.getJobStatus(jobId, role, partyId);
                        if (Dict.JOB_FINISHED_STATUS.contains(jobStatus)) {
                            String jobDir = logFileService.getJobDir(jobId);
                            logFileTransferEventProducer.onData(sshInfo, jobDir, jobDir);
                        }
                    }
                }
            }
            //format result to push
            HashMap<String, Object> result = new HashMap<>();
            result.put("type", type);
            result.put("data", logResults);
            try {
                session.getBasicRemote().sendText(JSON.toJSONString(result));
            } catch (IOException e) {
                e.printStackTrace();
                logger.error("websocket send error: {}", result);
            }
        }

    }


    /**
     * call method when error occurs
     *
     * @param session
     * @param error
     */
    @OnError
    public void onError(Session session, Throwable error) {
        logger.error("log web socket error", error);

        try {
            session.close();
        } catch (IOException e) {
            e.printStackTrace();
            logger.error("session: {} close error", session);
        }
    }

    @Override
    public void afterPropertiesSet() {
        LogWebSocketController.logFileService = (LogFileService) applicationContext.getBean("logFileService");
        LogWebSocketController.sshService = (SshService) applicationContext.getBean("sshService");
        LogWebSocketController.logFileTransferEventProducer = (LogFileTransferEventProducer) applicationContext.getBean("logFileTransferEventProducer");

    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        LogWebSocketController.applicationContext = applicationContext;
    }

    private static ApplicationContext applicationContext;
    private static SshService sshService;
    private static LogFileService logFileService;
    private static LogFileTransferEventProducer logFileTransferEventProducer;

}
