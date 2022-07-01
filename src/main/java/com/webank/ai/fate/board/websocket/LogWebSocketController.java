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
import com.google.common.base.Preconditions;
import com.webank.ai.fate.board.conf.Configurator;
import com.webank.ai.fate.board.global.Dict;
import com.webank.ai.fate.board.log.LogFileService;
import com.webank.ai.fate.board.pojo.flow.*;
import com.webank.ai.fate.board.pojo.websocket.LogContentResponse;
import com.webank.ai.fate.board.pojo.websocket.LogQuery;
import com.webank.ai.fate.board.pojo.websocket.LogSizeResponse;
import com.webank.ai.fate.board.services.FlowLogFeign;
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
import java.util.List;
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
            FlowLogSizeReq logSizeReq = new FlowLogSizeReq();
            logSizeReq.setJob_id(jobId);
            logSizeReq.setLog_type(logTypeEnum.getFlowValue());
            logSizeReq.setRole(role);
            logSizeReq.setParty_id(partyId);
            logSizeReq.setComponent_name(componentId);
            logSizeReq.setInstance_id(logQuery.getInstanceId());
            FlowResponse<FlowLogSizeResp> resp = flowLogFeign.logSize(logSizeReq);
            switch (logTypeEnum) {
                case JOB_SCHEDULE:
                    logSizeResponse.setJobSchedule(resp.getData().getSize());
                    break;
                case JOB_ERROR:
                    logSizeResponse.setJobError(resp.getData().getSize());
                    break;
                case PARTY_ERROR:
                    logSizeResponse.setPartyError(resp.getData().getSize());
                    break;
                case PARTY_WARNING:
                    logSizeResponse.setPartyWarning(resp.getData().getSize());
                    break;
                case PARTY_INFO:
                    logSizeResponse.setPartyInfo(resp.getData().getSize());
                    break;
                case PARTY_DEBUG:
                    logSizeResponse.setPartyDebug(resp.getData().getSize());
                    break;
                case COMPONENT_INFO:
                    logSizeResponse.setComponentInfo(resp.getData().getSize());
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

        FlowLogCatReq flowLogCatReq = new FlowLogCatReq();
        flowLogCatReq.setJob_id(jobId);
        flowLogCatReq.setLog_type(Dict.logTypeMap.get(logQuery.getType()));
        flowLogCatReq.setRole(role);
        flowLogCatReq.setParty_id(Integer.valueOf(partyId));
        flowLogCatReq.setComponent_name(componentId);
        flowLogCatReq.setInstance_id(logQuery.getInstanceId());
        flowLogCatReq.setBegin(logQuery.getBegin());
        flowLogCatReq.setEnd(logQuery.getEnd());

        FlowResponse<List<FlowLogCatResp>> resultFlow = flowLogFeign.logCat(flowLogCatReq);

        LogContentResponse logContentResponse = new LogContentResponse();
        logContentResponse.setType(logQuery.getType());
        logContentResponse.setData(resultFlow.getData().stream()
                .map(LogContentResponse.LogContent::fromFlowContent)
                .collect(Collectors.toList()));
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
        JOB_SCHEDULE("jobSchedule", "jobSchedule"),
        JOB_ERROR("jobError", "jobScheduleError"),
        PARTY_ERROR("partyError", "partyError"),
        PARTY_WARNING("partyWarning", "partyWarning"),
        PARTY_INFO("partyInfo", "partyInfo"),
        PARTY_DEBUG("partyDebug", "partyDebug"),
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
