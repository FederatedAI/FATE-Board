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

import org.fedai.fate.board.conf.Configurator;
import org.fedai.fate.board.controller.JobDetailController;
import org.fedai.fate.board.controller.JobManagerController;
import org.fedai.fate.board.log.LogFileService;
import org.fedai.fate.board.services.JobManagerService;
import org.fedai.fate.board.services.JobWebSocketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint(value = "/websocket/progress/{jobId}/{role}/{partyId}", configurator = Configurator.class)
@Component
public class JobWebSocketController implements InitializingBean, ApplicationContextAware {
    private static Logger logger = LoggerFactory.getLogger(JobWebSocketController.class);
    private static JobManagerService jobManagerService;
    private static ApplicationContext applicationContext;
    private static JobDetailController jobDetailController;
    private static JobManagerController jobManagerController;
    private static ThreadPoolTaskExecutor asyncServiceExecutor;
    @Override
    public void afterPropertiesSet() {
        JobWebSocketController.jobManagerService = (JobManagerService) applicationContext.getBean("jobManagerService");
        JobWebSocketController.jobDetailController = (JobDetailController) applicationContext.getBean("jobDetailController");
        JobWebSocketController.asyncServiceExecutor = (ThreadPoolTaskExecutor) applicationContext.getBean("asyncServiceExecutor");
        JobWebSocketController.jobManagerController = (JobManagerController) applicationContext.getBean("jobManagerController");
    }
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        JobWebSocketController.applicationContext = applicationContext;
    }

    /**
     * call method when building connection
     **/
    @OnOpen
    public void onOpen(Session session, @PathParam("jobId") String jobId, @PathParam("role") String role, @PathParam("partyId") Integer partyId) {
        //check parameters
        if (LogFileService.checkPathParameters(jobId, role, String.valueOf(partyId))) {
//            logger.info("websocket job id {} open ,session {},session size{}", jobKey, session, jobSessionMap.size());
            logger.warn("session to join:{}", session);

            JobWebSocketService jobWebSocketService = new JobWebSocketService(session, jobId, role, partyId, jobDetailController, jobManagerController, jobManagerService, asyncServiceExecutor, false);
            new Thread(jobWebSocketService).start();


        } else {
            logger.error("websocket input parameter error: jobId {},role {},partyId {}", jobId, role, partyId);
        }
    }

    /**
     * call method when closing connection
     */
    @OnClose
    public void onClose(Session session) {
        logger.info("websocket session {} closed", session);
    }

    /**
     * call method when receiving message from client
     *
     * @param message message from client
     */
    @OnMessage
    public void onMessage(String message, Session session) {
    }

    /**
     * @param session
     * @param error
     */
    @OnError
    public void onError(Session session, Throwable error) {
        logger.error("there is a error in websocket connection!", error);

    }




}

