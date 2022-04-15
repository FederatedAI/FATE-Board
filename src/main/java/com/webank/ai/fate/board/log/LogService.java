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
import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Preconditions;
import com.webank.ai.fate.board.global.ErrorCode;
import com.webank.ai.fate.board.global.ResponseResult;
import com.webank.ai.fate.board.pojo.JobDO;
import com.webank.ai.fate.board.pojo.SshInfo;
import com.webank.ai.fate.board.services.JobManagerService;
import com.webank.ai.fate.board.ssh.SshService;
import com.webank.ai.fate.board.global.Dict;
import com.webank.ai.fate.board.utils.HttpClientPool;
import lombok.SneakyThrows;
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
    private HttpClientPool httpClientPool;
    private JobManagerService jobManagerService;
    private boolean queryJob;

    public LogService(String jobId, String role, String partyId, String componentId, Session session, HttpClientPool httpClientPool, JobManagerService jobManagerService, boolean queryJob) {
        this.jobId = jobId;
        this.role = role;
        this.partyId = partyId;
        this.componentId = componentId;
        this.session = session;
        this.httpClientPool = httpClientPool;
        this.jobManagerService = jobManagerService;
        this.queryJob = queryJob;
    }

    @SneakyThrows
    @Override
    public void run() {
        HashMap<String, String> typeMap = new HashMap<>();
        if (Dict.DEFAULT.equals(componentId)) {
            Set<String> logTypes = Dict.logTypeMap.keySet();
            for (String type : logTypes) {
                if (!"componentInfo".equals(type)) {
                    typeMap.put(type, Dict.logTypeMap.get(type));
                }
            }
        } else {
            typeMap.put("componentInfo", Dict.logTypeMap.get("componentInfo"));
        }


        //get size of logs
        while (session.isOpen()) {
            HashMap<String, Integer> logSizeMap = new HashMap<>();
            Set<Map.Entry<String, String>> entries = typeMap.entrySet();
            for (Map.Entry<String, String> entry : entries) {
                String logType = entry.getKey();
                String flowLogType = entry.getValue();
                Map<String, Object> reqMap = new HashMap<>();
                reqMap.put("job_id", jobId);
                reqMap.put("log_type", flowLogType);
                reqMap.put("role", role);
                reqMap.put("party_id", Integer.valueOf(partyId));
                reqMap.put("component_name", componentId);
                String result = null;
                try {
                    result = httpClientPool.postToFlowApi(Dict.URL_LOG_SIZE, JSON.toJSONString(reqMap));
                } catch (Exception e) {
                    logger.error("connect fateflow error:", e);
//                    return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
                }
                JSONObject data = JSON.parseObject(result).getJSONObject(Dict.DATA);
                Integer size = data.getInteger("size");
                logSizeMap.put(logType, size);
            }
            if (queryJob) {
                //get job information
                JobDO job = jobManagerService.queryJobByConditions(jobId, role, String.valueOf(partyId));
                if (job != null) {
                    //get status
                    String status = job.getfStatus();
                    if (status.equals(Dict.TIMEOUT)) {
                        status = Dict.FAILED;
                    }
                    if (Dict.JOB_FINISHED_STATUS.contains(status)) {
                        queryJob = false;
                    }
                }
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
                if (!queryJob){
                    Thread.sleep(30000);
                }
            } catch (InterruptedException e) {
                logger.error("thread sleep error", e);
            }
        }
    }
}
