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
import com.alibaba.fastjson.TypeReference;
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
import com.webank.ai.fate.board.utils.HttpClientPool;
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
    private static ApplicationContext applicationContext;
    private static HttpClientPool httpClientPool;
    private static JobManagerService jobManagerService;
    @Override
    public void afterPropertiesSet() {
        LogWebSocketController.httpClientPool = (HttpClientPool) applicationContext.getBean("httpClientPool");
        LogWebSocketController.jobManagerService = (JobManagerService) applicationContext.getBean("jobManagerService");

    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        LogWebSocketController.applicationContext = applicationContext;
    }



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
        LogService logService = new LogService(jobId, role, partyId, componentId, session,httpClientPool,jobManagerService,true);

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

            Map<String, Object> reqMap = new HashMap<>();
            reqMap.put("job_id", jobId);
            reqMap.put("log_type", Dict.logTypeMap.get(type));
            reqMap.put("role", role);
            reqMap.put("party_id", Integer.valueOf(partyId));
            reqMap.put("component_name", componentId);
            reqMap.put("begin", begin);
            reqMap.put("end", end);

            String resultFlow = null;
            try {
                resultFlow = httpClientPool.postToFlowApi(Dict.URL_LOG_CAT, JSON.toJSONString(reqMap));
            } catch (Exception e) {
                logger.error("connect fateflow error:", e);
//                    return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
            }

            String s1 = JSON.toJSONString(JSON.parseObject(resultFlow).getJSONArray(Dict.DATA)).replaceAll("line_num", "lineNum");
            List<Map<String, Object>> logResults = JSON.parseObject(s1, new TypeReference<List<Map<String, Object>>>() {});
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



}
