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
package com.webank.ai.fate.board.log;


import com.alibaba.fastjson.JSON;
import com.google.common.base.Preconditions;
import com.webank.ai.fate.board.pojo.SshInfo;
import com.webank.ai.fate.board.ssh.SshService;
import com.webank.ai.fate.board.global.Dict;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.Session;
import java.io.File;
import java.io.IOException;
import java.util.*;

public class LogService implements Runnable {

    private static final Logger logger = LoggerFactory.getLogger(LogService.class);

    private String jobId;
    private String role;
    private String partyId;
    private String componentId;
    private Session session;
    private LogFileService logFileService;
    private SshService sshService;

    public LogService(String jobId, String role, String partyId, String componentId, Session session, LogFileService logFileService, SshService sshService) {
        this.jobId = jobId;
        this.role = role;
        this.partyId = partyId;
        this.componentId = componentId;
        this.session = session;
        this.logFileService = logFileService;
        this.sshService = sshService;
    }

    @Override
    public void run() {
        HashMap<String, String> logPathMap = new HashMap<>();
        if(Dict.DEFAULT.equals(componentId)){
            Set<String> logTypes = Dict.logMap.keySet();
            for (String type : logTypes) {
                if (!"componentInfo".equals(type)){
                    String logPath = logFileService.buildLogPath(jobId, role, partyId, componentId, type);
                    logPathMap.put(type,logPath);
                }
            }
        }else {
            String logPath = logFileService.buildLogPath(jobId, role, partyId, componentId, "componentInfo");
            logPathMap.put("componentInfo",logPath);
        }

        //get remote ip
        String jobIp = logFileService.getJobIp(jobId, role, partyId);
        Preconditions.checkArgument(StringUtils.isNoneEmpty(jobIp));

        //get size of logs
        while (session.isOpen()) {
            HashMap<String, Integer> logSizeMap = new HashMap<>();
            Set<Map.Entry<String, String>> entries = logPathMap.entrySet();
            for (Map.Entry<String, String> entry : entries) {
                String logType = entry.getKey();
                String logPath = entry.getValue();
                File file = new File(logPath);
                Integer lineSum = 0;

                //judge the location of log and get log size
                if (file.exists()) {
                    try {
                        lineSum = LogFileService.getLocalFileLineCount(file);
                    } catch (IOException e) {
                        e.printStackTrace();
                        logger.error("read local log error : path {}", logPath);
                    }
                } else {
                    logger.info("local file path {} is not exist,try to find remote file", file);
                    SshInfo sshInfo = sshService.getSSHInfo(jobIp);
                    if (sshInfo == null) {
                        logger.info("remote {} connection info doesn't exist,file {} doesn't exist", jobIp,file);
                    } else {
                        try {
                            lineSum = logFileService.getRemoteFileLineCount(sshInfo, logPath);
                        } catch (Exception e) {
                            e.printStackTrace();
                            logger.error("read remote log error: ip {}, path {}", jobIp, logPath);
                        }
                    }
                }

                logSizeMap.put(logType, lineSum);
            }

            HashMap<String, Object> result = new HashMap<>();
            result.put("type", "logSize");
            result.put("data", logSizeMap);
            try {
                session.getBasicRemote().sendText(JSON.toJSONString(result));
            } catch (IOException e) {
                e.printStackTrace();
                logger.error("websocket send error: {}", result);
            }
            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                logger.error("thread sleep error",e);
            }
        }
    }
}
