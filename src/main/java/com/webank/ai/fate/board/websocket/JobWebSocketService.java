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
import com.google.common.collect.Maps;
import com.webank.ai.fate.board.conf.Configurator;
import com.webank.ai.fate.board.controller.JobDetailController;
import com.webank.ai.fate.board.controller.JobManagerController;
import com.webank.ai.fate.board.global.ResponseResult;
import com.webank.ai.fate.board.log.LogFileService;
import com.webank.ai.fate.board.pojo.Job;
import com.webank.ai.fate.board.services.JobManagerService;
import com.webank.ai.fate.board.utils.Dict;
import com.webank.ai.fate.board.utils.HttpClientPool;
import com.webank.ai.fate.board.utils.ThreadPoolTaskExecutorUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.lang.NonNullApi;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;
import org.springframework.util.concurrent.ListenableFuture;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.sql.Time;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.*;

@ServerEndpoint(value = "/websocket/progress/{jobId}/{role}/{partyId}", configurator = Configurator.class)
@Component
public class JobWebSocketService implements InitializingBean, ApplicationContextAware {
    private static Logger logger = LoggerFactory.getLogger(JobWebSocketService.class);

    private static JobManagerService jobManagerService;

    private static ApplicationContext applicationContext;

    private static JobDetailController jobDetailController;

    private static ConcurrentHashMap<Session, String> jobSessionMap = new ConcurrentHashMap<>();

    private static ConcurrentHashMap<Session, Boolean> sessionPushMap = new ConcurrentHashMap<>();

    private static ThreadPoolTaskExecutor asyncServiceExecutor;

    private static ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();

    static {
        executorService.scheduleAtFixedRate(JobWebSocketService::schedule, 1000, 1000, TimeUnit.MILLISECONDS);
    }

    /**
     * call method when building connection
     **/
    @OnOpen
    public void onOpen(Session session, @PathParam("jobId") String jobId, @PathParam("role") String role, @PathParam("partyId") Integer partyId) {
        //check parameters
        if (LogFileService.checkPathParameters(jobId, role, String.valueOf(partyId))) {
            String jobKey = jobId + ":" + role + ":" + partyId;
            JobWebSocketService.jobSessionMap.put(session, jobKey);
            logger.info("websocket job id {} open ,session {},session size{}", jobKey, session, jobSessionMap.size());
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
        jobSessionMap.remove(session);
        sessionPushMap.remove(session);
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
        try {
            session.close();
        } catch (IOException e) {
            e.printStackTrace();
            logger.error("session {} close error~", session);
        } finally {
            jobSessionMap.remove(session);
            sessionPushMap.remove(session);
        }
    }


    private static void schedule() {
        logger.info("job schedule start");
        logger.debug("job process schedule start,session map size {}", jobSessionMap.size());

        //get job map to push
        Map<String, Set<Session>> jobMaps = Maps.newHashMap();
        JobWebSocketService.jobSessionMap.forEach((k, v) -> {
            Set<Session> sessions = jobMaps.get(v);
            if (sessions == null) {
                sessions = new HashSet<>();
                sessions.add(k);
                jobMaps.put(v, sessions);
            }
            sessions.add(k);
        });

        //if job map exist data, then push
        if (jobMaps.size() > 0) {
            logger.info("job websocket job size {}", jobMaps.size());
            jobMaps.forEach((k, v) -> {
                        String[] args = k.split(":");
                        Preconditions.checkArgument(3 == args.length);
                        String jobId = args[0];
                        String role = args[1];
                        Integer partyId = new Integer(args[2]);
                        Job job = jobManagerService.queryJobByConditions(args[0], args[1], args[2]);
                        if (job != null) {
                            HashMap<String, Object> flushToWebData = new HashMap<>(16);
                            //get process
                            Integer process = job.getfProgress();

                            //get duration
                            long now = System.currentTimeMillis();
                            Long startTime = job.getfStartTime();
                            Long endTime = job.getfEndTime();
                            long duration;
                            if (endTime != null) {
                                duration = endTime - startTime;

                            } else {
                                duration = now - startTime;
                            }
                            logger.info("time now:{} start:{} end:{} duration:{}", now, startTime, endTime, duration);

                            //get status
                            String status = job.getfStatus();
                            if (status.equals(Dict.TIMEOUT)) {
                                status = Dict.FAILED;
                            }

                            flushToWebData.put(Dict.JOB_PROCESS, process);
                            flushToWebData.put(Dict.JOB_DURATION, duration);
                            flushToWebData.put(Dict.JOB_STATUS, status);

                            //get dependency information
                            Map<String, Object> param = Maps.newHashMap();
                            param.put(Dict.JOBID, jobId);
                            param.put(Dict.ROLE, role);
                            param.put(Dict.PARTY_ID, partyId);
//                            Future<?> dependencyFuture = ThreadPoolTaskExecutorUtil.submitListenable(asyncServiceExecutor, () -> jobDetailController.getDagDependencies(JSON.toJSONString(param)), new int[]{500}, new int[]{3});
                            ListenableFuture<ResponseResult> dependencyFuture = asyncServiceExecutor.submitListenable(() -> jobDetailController.getDagDependencies(JSON.toJSONString(param)));
                            ResponseResult responseResult;
                            try {
                                responseResult = dependencyFuture.get();
                                if (0 == responseResult.getCode()) {
                                    flushToWebData.put(Dict.DATA, responseResult.getData());
                                } else {
                                    flushToWebData.put(Dict.DATA, null);
                                }
                            } catch (InterruptedException | ExecutionException e) {
                                e.printStackTrace();
                                logger.error("GET DEPENDENCY_DATA ERROR", e);
                                flushToWebData.put(Dict.DATA, null);
                            }

//                            try {
//                                flushToWebData.put(Dict.DEPENDENCY_DATA, dependencyFuture.get());
//                            } catch (Exception e) {
//                                logger.error("GET DEPENDENCY_DATA ERROR", e);
//                                flushToWebData.put(Dict.DEPENDENCY_DATA, null);
//                            }

                            //send job information to sessions
                            v.forEach(session -> {
                                if (session.isOpen()) {
                                    try {
                                        if (sessionPushMap.get(session) != null && flushToWebData.get(Dict.DATA) != null) {
                                            JSONObject dataObject = (JSONObject) flushToWebData.get(Dict.DATA);
                                            dataObject.remove("component_module");
                                            dataObject.remove("component_need_run");
                                            dataObject.remove("dependencies");
                                        }
                                        session.getBasicRemote().sendText(JSON.toJSONString(flushToWebData));
                                        logger.info("data to push:{}", JSON.toJSONString(flushToWebData));

                                        if (flushToWebData.get(Dict.DATA) != null && sessionPushMap.get(session) == null) {
                                            sessionPushMap.put(session, true);
                                        }
                                    } catch (IOException e) {
                                        e.printStackTrace();
                                        logger.error("websocket send IOException", e);
                                    }
                                } else {
//                                    v.remove(session);
                                    jobSessionMap.remove(session);
                                    sessionPushMap.remove(session);
                                }
                            });

                            if (JobManagerService.jobFinishStatus.contains(status)) {
                                v.forEach(session -> {
//                                    try {
//                                        session.close();
//                                    } catch (IOException e) {
//                                        e.printStackTrace();
//                                        logger.error("session {} close error~", session);
//                                    } finally {
                                    jobSessionMap.remove(session);
                                    sessionPushMap.remove(session);
//                                    v.remove(session);
//                                    }
                                });
                            }

                        } else {
                            logger.error("job {} is not exist", k);
                        }
                    }
            );
        }

    }

    @Override
    public void afterPropertiesSet() {
        JobWebSocketService.jobManagerService = (JobManagerService) applicationContext.getBean("jobManagerService");
//        JobWebSocketService.httpClientPool = (HttpClientPool) applicationContext.getBean("httpClientPool");
        JobWebSocketService.jobDetailController = (JobDetailController) applicationContext.getBean("jobDetailController");
        JobWebSocketService.asyncServiceExecutor = (ThreadPoolTaskExecutor) applicationContext.getBean("asyncServiceExecutor");
//        JobWebSocketService.jobManagerController = (JobManagerController) applicationContext.getBean("jobManagerController");
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        JobWebSocketService.applicationContext = applicationContext;
    }
}

