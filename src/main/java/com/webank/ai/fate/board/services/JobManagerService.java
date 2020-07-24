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
package com.webank.ai.fate.board.services;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;
import com.webank.ai.fate.board.dao.JobMapper;
import com.webank.ai.fate.board.log.LogFileService;
import com.webank.ai.fate.board.pojo.*;
import com.webank.ai.fate.board.global.Dict;
import com.webank.ai.fate.board.utils.HttpClientPool;
import com.webank.ai.fate.board.utils.PageBean;
import com.webank.ai.fate.board.utils.ThreadPoolTaskExecutorUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.util.concurrent.ListenableFuture;

import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;


@Service

public class JobManagerService {
    public static Set<String> jobFinishStatus = new HashSet<String>() {
        {
            add("success");
            add("failed");
            add("timeout");
            add("canceled");
        }
    };
    private final Logger logger = LoggerFactory.getLogger(JobManagerService.class);
    @Autowired
    JobMapper jobMapper;
    @Autowired
    HttpClientPool httpClientPool;
    @Value("${fateflow.url}")
    String fateUrl;
    @Autowired
    ThreadPoolTaskExecutor asyncServiceExecutor;

    public long count() {

        JobExample jobExample = new JobExample();
        return jobMapper.countByExample(jobExample);
    }

    public List<JobWithBLOBs> queryJobByPage(long startIndex, long pageSize) {
        List<JobWithBLOBs> jobWithBLOBs = jobMapper.selectByPage(startIndex, pageSize);
        return jobWithBLOBs;
    }


    public List<Job> queryJobStatus() {

        JobExample jobExample = new JobExample();

        JobExample.Criteria criteria = jobExample.createCriteria();

        ArrayList<String> stringArrayList = new ArrayList<String>();

        stringArrayList.add("waiting");

        stringArrayList.add("running");

        criteria.andFStatusIn(stringArrayList);

        jobExample.setOrderByClause("f_status, f_start_time desc");
        List<Job> jobs = jobMapper.selectByExample(jobExample);
        for (Job job : jobs) {
            job.setfRunIp(null);
        }
        return jobs;

    }


    public List<JobWithBLOBs> queryJob() {

        JobExample jobExample = new JobExample();

        jobExample.setOrderByClause("f_start_time desc");

        List<JobWithBLOBs> jobWithBLOBsList = jobMapper.selectByExampleWithBLOBs(jobExample);

        return jobWithBLOBsList;

    }


    public JobWithBLOBs queryJobByConditions(String jobId, String role, String partyId) {

        JobExample jobExample = new JobExample();

        JobExample.Criteria criteria = jobExample.createCriteria();

        criteria.andFJobIdEqualTo(jobId);

        criteria.andFRoleEqualTo(role);

        criteria.andFPartyIdEqualTo(partyId);

        List<JobWithBLOBs> jobWithBLOBsList = jobMapper.selectByExampleWithBLOBs(jobExample);

        if (jobWithBLOBsList.size() != 0) {
            JobWithBLOBs jobWithBLOBs = jobWithBLOBsList.get(0);
//            jobWithBLOBs.setfRunIp(null);
            return jobWithBLOBs;
        } else {
            return null;
        }
    }


    public List<JobWithBLOBs> queryPagedJobsByCondition(long startIndex, long pageSize, Object orderField, String orderType, String jobId) {
        String order = orderField + " " + orderType;
        String limit = startIndex + "," + pageSize;

        JobExample jobExample = new JobExample();
        jobExample.setOrderByClause(order);
        jobExample.setLimitClause(limit);
        if (jobId != null) {
            JobExample.Criteria criteria = jobExample.createCriteria();
            jobId = "%" + jobId + "%";
            criteria.andFJobIdLike(jobId);

        }
        List<JobWithBLOBs> jobWithBLOBs = jobMapper.selectByExampleWithBLOBs(jobExample);

        return jobWithBLOBs;
    }

    public List<JobWithBLOBs> queryPageByCondition(String jobId,
                                                   List<String> roles,
                                                   String partyId,
                                                   List<String> jobStatus,
                                                   String startTime,
                                                   String endTime,
                                                   long startIndex,
                                                   long pageSize) {
        JobExample jobExample = new JobExample();
        JobExample.Criteria criteria = jobExample.createCriteria();
        logger.info("start create criteria");

        if (!(jobId == null || jobId.equals(""))) {
            jobId = "%" + jobId + "%";
            criteria.andFJobIdLike(jobId);
            logger.info("add jobid " + jobId);
        }
        if (!(partyId == null || partyId.equals(""))) {

            partyId = "%" + partyId + "%";
            criteria.andFPartyIdLike(partyId);
            logger.info("add partyid " + partyId);
        }
        if (!(roles == null || roles.size() == 0)) {

            criteria.andFRoleIn(roles);
            logger.info("add roles " + roles);
        }

        if (!(jobStatus == null || jobStatus.size() == 0)) {

            criteria.andFStatusIn(jobStatus);
            logger.info("add status" + jobStatus);
        }

        if (!(startTime == null || startTime.equals(""))) {
            String order = Dict.FIELD_START_TIME + " " + startTime;
            jobExample.setOrderByClause(order);
            logger.info("add start" + order);
        }

        if (!(endTime == null || endTime.equals(""))) {
            String order = Dict.FILED_END_TIME + " " + endTime;
            jobExample.setOrderByClause(order);
            logger.warn("add end" + order);
        }
        String limit = startIndex + "," + pageSize;
        jobExample.setLimitClause(limit);
        List<JobWithBLOBs> jobWithBLOBs = jobMapper.selectByExampleWithBLOBs(jobExample);
//        for (JobWithBLOBs jobWithBLOB : jobWithBLOBs) {
//            jobWithBLOB.setfRunIp(null);
//        }

        return jobWithBLOBs;

    }

    public long totalCount(String jobId,
                           List<String> roles,
                           String partyId,
                           List<String> jobStatus
    ) {

        JobExample jobExample = new JobExample();
        JobExample.Criteria criteria = jobExample.createCriteria();

        if (!(jobId == null || jobId.equals(""))) {
            jobId = "%" + jobId + "%";
            criteria.andFJobIdLike(jobId);
            logger.info("jobid ok");
        }

        if (!(partyId == null || partyId.equals(""))) {
            partyId = "%" + partyId + "%";
            criteria.andFPartyIdLike(partyId);
            logger.info("partyid ok");
        }

        if (!(roles == null || roles.size() == 0)) {
            criteria.andFRoleIn(roles);
            logger.info("role ok");
        }
        if (!(jobStatus == null || jobStatus.size() == 0)) {
            criteria.andFStatusIn(jobStatus);
            logger.info("status ok");
        }

        return jobMapper.countByExample(jobExample);
    }

    public PageBean<Map<String, Object>> queryPagedJobs(PagedJobQO pagedJobQO) {
        if (pagedJobQO.getJobId() != null && 0 != pagedJobQO.getJobId().trim().length()) {
            Preconditions.checkArgument(LogFileService.checkPathParameters(pagedJobQO.getJobId()));
            pagedJobQO.setJobId("%" + pagedJobQO.getJobId() + "%");
        }
        if (pagedJobQO.getPartyId() != null && 0 != pagedJobQO.getPartyId().trim().length()) {
            Preconditions.checkArgument(LogFileService.checkPathParameters(pagedJobQO.getPartyId()));
            pagedJobQO.setPartyId("%" + pagedJobQO.getPartyId() + "%");
        }
        if (pagedJobQO.getfDescription() != null && 0 != pagedJobQO.getfDescription().trim().length()) {
            Preconditions.checkArgument(LogFileService.checkPathParameters(pagedJobQO.getfDescription()));
            pagedJobQO.setfDescription("%" + pagedJobQO.getfDescription() + "%");
        }
        long jobSum = this.countJob(pagedJobQO);
        PageBean<Map<String, Object>> listPageBean = new PageBean<>(pagedJobQO.getPageNum(), pagedJobQO.getPageSize(), jobSum);
        long startIndex = listPageBean.getStartIndex();
        List<JobWithBLOBs> jobWithBLOBs = jobMapper.queryPagedJobs(pagedJobQO, startIndex);
        LinkedList<Map<String, Object>> jobList = new LinkedList<>();
        Map<JobWithBLOBs, Future> jobDataMap = new LinkedHashMap<>();
        for (JobWithBLOBs jobWithBLOB : jobWithBLOBs) {
            ListenableFuture<?> future = ThreadPoolTaskExecutorUtil.submitListenable(this.asyncServiceExecutor, (Callable<JSONObject>) () -> {
                String jobId1 = jobWithBLOB.getfJobId();
                String role1 = jobWithBLOB.getfRole();
                String partyId1 = jobWithBLOB.getfPartyId();
                if (jobWithBLOB.getfStatus().equals(Dict.TIMEOUT)) {
                    jobWithBLOB.setfStatus(Dict.FAILED);
                }
                HashMap<String, String> jobParams = Maps.newHashMap();
                jobParams.put(Dict.JOBID, jobId1);
                jobParams.put((Dict.ROLE), role1);
                jobParams.put(Dict.PARTY_ID, partyId1);
                String result = httpClientPool.post(fateUrl + Dict.URL_JOB_DATAVIEW, JSON.toJSONString(jobParams));
                JSONObject data = JSON.parseObject(result).getJSONObject(Dict.DATA);

                return data;
            }, new int[]{500, 1000}, new int[]{3, 3});
            jobWithBLOB.setfRunIp(null);
            jobWithBLOB.setfDsl(null);
            jobWithBLOB.setfRuntimeConf(null);
            jobDataMap.put(jobWithBLOB, future);
        }
        jobDataMap.forEach((k, v) -> {
            HashMap<String, Object> stringObjectHashMap = new HashMap<>();
            stringObjectHashMap.put(Dict.JOB, k);
            try {
                stringObjectHashMap.put(Dict.DATASET, v.get());
            } catch (InterruptedException | ExecutionException e) {
                e.printStackTrace();

            }
            jobList.add(stringObjectHashMap);
        });
        listPageBean.setList(jobList);
        return listPageBean;
    }

    public long countJob(PagedJobQO pagedJobQO) {
        return jobMapper.countJob(pagedJobQO);
    }

    public Map<String, List<String>> queryFields() {
        return Dict.fieldMap;
    }

    public int restartJob(ComponentQueryDTO componentQueryDTO) {
        HashMap<String, String> stringStringHashMap = new HashMap<>();
        stringStringHashMap.put("taskId", componentQueryDTO.getJob_id() + "_" + componentQueryDTO.getComponent_name());

        String result;
        try {
            result = httpClientPool.post(fateUrl + Dict.URL_JOB_RESTART, JSON.toJSONString(stringStringHashMap));
            if (result != null) {
                JSONObject jsonObject = JSON.parseObject(result);
                if (0 == jsonObject.getInteger(Dict.RETCODE)) {
                    return 0;
                }
            }
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            return 1;
        }
        return 1;

    }

    public String getComponentCommand(ComponentQueryDTO componentQueryDTO) {
        StringBuffer command = new StringBuffer().append("python fate_flow_client.py -f component_output_data -j ").append(componentQueryDTO.getJob_id()).append(" -r ").append(componentQueryDTO.getRole()).append(" -p ").append(componentQueryDTO.getParty_id()).append(" -cpn ").append(componentQueryDTO.getComponent_name()).append(" -o ").append("./");
        return command.toString();
    }
}