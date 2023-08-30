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
package org.fedai.fate.board.websocket;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Preconditions;
import org.fedai.fate.board.conf.Configurator;
import org.fedai.fate.board.global.Dict;
import org.fedai.fate.board.log.LogFileService;
import org.fedai.fate.board.pojo.flow.*;
import org.fedai.fate.board.pojo.websocket.LogContentResponse;
import org.fedai.fate.board.pojo.websocket.LogQuery;
import org.fedai.fate.board.pojo.websocket.LogSizeResponse;
import org.fedai.fate.board.services.FlowLogFeign;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ServerEndpoint(value = "/log/new/{jobId}/{role}/{partyId}/{componentId}", configurator = Configurator.class)
@Component
public class LogWebSocketController implements InitializingBean, ApplicationContextAware {
    private static final Logger logger = LoggerFactory.getLogger(LogWebSocketController.class);
    private static ApplicationContext applicationContext;
    private static FlowLogFeign flowLogFeign;

    @Override
    public void afterPropertiesSet() {
        LogWebSocketController.flowLogFeign = applicationContext.getBean(FlowLogFeign.class);
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

            LogQuery logQuery = JSON.parseObject(message, LogQuery.class);
            Preconditions.checkArgument(StringUtils.isNoneEmpty(jobId, role, partyId, componentId,
                    message, logQuery.getType()));
            if (logQuery.getType().equals(LogTypeEnum.LOG_SIZE.boardValue)) {
                logSize(session, jobId, role, partyId, componentId, logQuery);
            } else {
                logCat(session, jobId, role, partyId, componentId, logQuery);
            }
        }

    }

    private void logSize(Session session, String jobId, String role, String partyId, String componentId, LogQuery logQuery) {
        List<LogTypeEnum> logTypes;
        if (Dict.DEFAULT.equals(componentId)) {
            logTypes = LogTypeEnum.getDefaultTypeList();
        } else {
            logTypes = new ArrayList<>();
            logTypes.add(LogTypeEnum.COMPONENT_INFO);
        }

        LogSizeResponse logSizeResponse = new LogSizeResponse();
        for (LogTypeEnum logTypeEnum : logTypes) {
            Map<String, Object> reqMap = new HashMap<>();
            reqMap.put(Dict.JOBID, jobId);
            reqMap.put(Dict.LOG_TYPE, logTypeEnum.getFlowValue());
            reqMap.put(Dict.ROLE, role);
            reqMap.put(Dict.PARTY_ID, partyId);
            reqMap.put(Dict.TASK_NAME, componentId);
            if (logQuery != null &&  StringUtils.isNotBlank(logQuery.getInstanceId())) {
                reqMap.put(Dict.INSTANCE_ID,logQuery.getInstanceId());
            }
            String resp = flowLogFeign.logSize(reqMap);

            JSONObject jsonData = JSON.parseObject(resp);
            Integer logCount = 0;
            if (jsonData != null) {
                logCount = (Integer) jsonData.get(Dict.DATA);
            }
            switch (logTypeEnum) {
                case JOB_SCHEDULE:
                    logSizeResponse.setJobSchedule(logCount);
                    break;
                case JOB_ERROR:
                    logSizeResponse.setJobError(logCount);
                    break;
                case PARTY_ERROR:
                    logSizeResponse.setPartyError(logCount);
                    break;
                case PARTY_WARNING:
                    logSizeResponse.setPartyWarning(logCount);
                    break;
                case PARTY_INFO:
                    logSizeResponse.setPartyInfo(logCount);
                    break;
                case PARTY_DEBUG:
                    logSizeResponse.setPartyDebug(logCount);
                    break;
                case COMPONENT_INFO:
                    logSizeResponse.setComponentInfo(logCount);
                    break;
            }
        }

        try {
            session.getBasicRemote().sendText(JSON.toJSONString(logSizeResponse));
        } catch (IOException e) {
            e.printStackTrace();
            logger.error("websocket send error: {}", logSizeResponse);
        }
    }

    private void logCat(Session session, String jobId, String role, String partyId, String componentId, LogQuery logQuery) {
        Preconditions.checkArgument(StringUtils.isNoneEmpty(logQuery.getType(),
                String.valueOf(logQuery.getBegin()), String.valueOf(logQuery.getEnd())));
        if (logQuery.getBegin() > logQuery.getEnd()) {
            return;
        }

        Preconditions.checkArgument(LogFileService.checkPathParameters(jobId, role, partyId, componentId, logQuery.getType()));

        Map<String, Object> reqMap = new HashMap<>();
        reqMap.put(Dict.JOBID, jobId);
        reqMap.put(Dict.LOG_TYPE, Dict.logTypeMap.get(logQuery.getType()));
        reqMap.put(Dict.ROLE, role);
        reqMap.put(Dict.PARTY_ID, Integer.valueOf(partyId));
        reqMap.put(Dict.TASK_NAME, componentId);
        reqMap.put(Dict.BEGIN, logQuery.getBegin());
        reqMap.put(Dict.END, logQuery.getEnd());
        if (logQuery != null &&  StringUtils.isNotBlank(logQuery.getInstanceId())) {
            reqMap.put(Dict.INSTANCE_ID,logQuery.getInstanceId());
        }
        String resultFlow = flowLogFeign.logCat(reqMap);
        JSONObject object = JSONObject.parseObject(resultFlow);
        JSONArray jsonArray = object.getJSONArray(Dict.DATA);

        List<LogContentResponse.LogContent> contentData = new ArrayList<>();

        for (int i = 0; i < jsonArray.size(); i++) {
            JSONObject logData = (JSONObject) jsonArray.get(i);
            String content = logData.get(Dict.LOG_CONTENT) == null ? "" : (String) logData.get(Dict.LOG_CONTENT);
            String lineNum = logData.get(Dict.LOG_CONTENT) == null ? "" : (String) logData.get(Dict.LOG_CONTENT);
            LogContentResponse.LogContent logContent = new LogContentResponse.LogContent();
            logContent.setContent(content);
            logContent.setLineNum(lineNum);
            contentData.add(logContent);
        }
        LogContentResponse logContentResponse = new LogContentResponse();
        logContentResponse.setType(logQuery.getType());
        logContentResponse.setData(contentData);
        try {
            session.getBasicRemote().sendText(JSON.toJSONString(logContentResponse));
        } catch (IOException e) {
            e.printStackTrace();
            logger.error("websocket send error: {}", logContentResponse);
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

    public enum LogTypeEnum {
        //"schedule_info", "schedule_error"，"task_error", "task_info", "task_warning", "task_debug"
        JOB_SCHEDULE("jobSchedule", "schedule_info"),
        JOB_ERROR("jobError", "schedule_error"),
        PARTY_ERROR("partyError", "task_error"),
        PARTY_WARNING("partyWarning", "task_warning"),
        PARTY_INFO("partyInfo", "task_info"),
        PARTY_DEBUG("partyDebug", "task_debug"),
        COMPONENT_INFO("componentInfo", "componentInfo"),
        LOG_SIZE("logSize", null),
        ;
        private final String boardValue;
        @Nullable
        private final String flowValue;

        LogTypeEnum(String boardValue, @Nullable String flowValue) {
            this.boardValue = boardValue;
            this.flowValue = flowValue;
        }

        public String getBoardValue() {
            return boardValue;
        }

        @Nullable
        public String getFlowValue() {
            return flowValue;
        }

        public static List<LogTypeEnum> getDefaultTypeList() {
            List<LogTypeEnum> logTypeEnums = new ArrayList<>();
            logTypeEnums.add(JOB_SCHEDULE);
            logTypeEnums.add(JOB_ERROR);
            logTypeEnums.add(PARTY_ERROR);
            logTypeEnums.add(PARTY_WARNING);
            logTypeEnums.add(PARTY_INFO);
            logTypeEnums.add(PARTY_DEBUG);
            return logTypeEnums;
        }
    }
}
