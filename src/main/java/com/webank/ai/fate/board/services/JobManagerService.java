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
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.TypeReference;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;
import com.webank.ai.fate.board.global.ErrorCode;
import com.webank.ai.fate.board.global.ResponseResult;
import com.webank.ai.fate.board.log.LogFileService;
import com.webank.ai.fate.board.pojo.*;
import com.webank.ai.fate.board.global.Dict;
import com.webank.ai.fate.board.utils.HttpClientPool;
import com.webank.ai.fate.board.utils.PageBean;
import com.webank.ai.fate.board.utils.ThreadPoolTaskExecutorUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.jni.OS;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.util.concurrent.ListenableFuture;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.stream.Collectors;


@Service
@Slf4j
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
    //    @Autowired
//    JobMapper jobMapper;
    @Autowired
    HttpClientPool httpClientPool;
    @Value("${fateflow.url}")
    String fateUrl;
    @Autowired
    ThreadPoolTaskExecutor asyncServiceExecutor;


    public List<JobDO> queryJobStatus() {

//        List<JobDO> jobDOS = jobMapper.queryJobStatus();
//        return jobDOS;

        List<String> list = new ArrayList<>();
        list.add("waiting");
        list.add("running");

        FlowJobQO flowJobQO = new FlowJobQO();
        flowJobQO.setStatus(list);
        Map<String, Object> jobMap = getJobMap(flowJobQO);
        if (jobMap != null) {
            return (List<JobDO>) jobMap.get("list");
        }
        return null;
    }


    private Map<String, Object> getJobMap(Object query) {
        String result = null;
        try {
            result = httpClientPool.post(fateUrl + Dict.URL_JOB_QUERY, JSON.toJSONString(query));
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            //todo

//            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }
        if (result != null) {
            JSONObject dataObject = JSON.parseObject(result).getJSONObject(Dict.DATA);
            Integer count = dataObject.getInteger("count");
            JSONArray jobs = dataObject.getJSONArray("jobs");

            List<FlowJobDO> flowJobDOList = JSON.parseObject(JSON.toJSONString(jobs), new TypeReference<List<FlowJobDO>>() {
            });

            List<JobDO> jobDOList = flowJobDOList.stream().map(flowJobDO -> {
                JobDO jobDO = new JobDO();
                jobDO.setfJobId(flowJobDO.getJob_id());
                jobDO.setfRole(flowJobDO.getRole());
                jobDO.setfPartyId(flowJobDO.getParty_id());
                jobDO.setfName(flowJobDO.getName());
                jobDO.setfDescription(flowJobDO.getDescription());
                jobDO.setfTag(flowJobDO.getTag());
                jobDO.setfDsl(flowJobDO.getDsl());
                jobDO.setfRuntimeConf(flowJobDO.getRuntime_conf());
                jobDO.setfTrainRuntimeConf(flowJobDO.getTrain_runtime_conf());
                jobDO.setfRoles(flowJobDO.getRoles());
                jobDO.setfWorkMode(flowJobDO.getWork_mode());
                jobDO.setfInitiatorRole(flowJobDO.getInitiator_role());
                jobDO.setfInitiatorPartyId(flowJobDO.getInitiator_party_id());
                jobDO.setfStatus(flowJobDO.getStatus());
                jobDO.setfIsInitiator(flowJobDO.getIs_initiator());
                jobDO.setfProgress(flowJobDO.getProgress());
                jobDO.setfCreateTime(flowJobDO.getCreate_time());
                jobDO.setfUpdateTime(flowJobDO.getUpdate_time());
                jobDO.setfStartTime(flowJobDO.getStart_time());
                jobDO.setfEndTime(flowJobDO.getEnd_time());
                jobDO.setfElapsed(flowJobDO.getElapsed());
                return jobDO;
            }).collect(Collectors.toList());
            Map<String, Object> map = new HashMap();
            map.put("list", jobDOList);
            map.put("count", count);
            return map;

        }
        return null;
    }

    public JobDO queryJobByConditions(String jobId, String role, String partyId) {

//        JobDO jobDO = jobMapper.queryJobByConditions(jobId, role, partyId);
//        return jobDO;
        FlowJobDO flowJobQO = new FlowJobDO();
        flowJobQO.setJob_id(jobId);
        flowJobQO.setRole(role);
        flowJobQO.setParty_id(partyId);
        Map<String, Object> jobMap = getJobMap(flowJobQO);
        if (jobMap != null && jobMap.get("list") != null) {
            return ((List<JobDO>) jobMap.get("list")).get(0);
        }

        return null;
    }


    public PageBean<Map<String, Object>> queryPagedJobs(PagedJobQO pagedJobQO) {
        String jobId = pagedJobQO.getJobId();
        FlowJobQO flowJobQO = new FlowJobQO();
        if (jobId != null && 0 != jobId.trim().length()) {
            Preconditions.checkArgument(LogFileService.checkPathParameters(jobId));
//            pagedJobQO.setJobId("%" + jobId + "%");
            flowJobQO.setJob_id(pagedJobQO.getJobId());
        }
        String partyId = pagedJobQO.getPartyId();
        if (partyId != null && 0 != partyId.trim().length()) {
            Preconditions.checkArgument(LogFileService.checkPathParameters(partyId));
//            pagedJobQO.setPartyId("%" + partyId + "%");
            flowJobQO.setParty_id(pagedJobQO.getPartyId());
        }
        String partner = pagedJobQO.getPartner();
        if (partner != null && partner.trim().length() != 0) {
            Preconditions.checkArgument(LogFileService.checkPathParameters(partner));
//            pagedJobQO.setPartner("%" + partner + "%");
        }
        String fDescription = pagedJobQO.getFDescription();
        if (fDescription != null && 0 != fDescription.trim().length()) {
            Preconditions.checkArgument(LogFileService.checkParameters("^[0-9a-zA-Z\\-_\\u4e00-\\u9fa5\\s]+$", fDescription));
//            Preconditions.checkArgument(LogFileService.checkPathParameters(pagedJobQO.getfDescription()));
//            pagedJobQO.setFDescription("%" + fDescription + "%");
            flowJobQO.setDescription(pagedJobQO.getFDescription());
        }


        flowJobQO.setLimit(pagedJobQO.getPageSize().intValue());
        flowJobQO.setPage(pagedJobQO.getPageNum().intValue());
        if (pagedJobQO.getRole().size() > 0) {
            flowJobQO.setRole(pagedJobQO.getRole());
        }
        if (pagedJobQO.getStatus().size() > 0) {
            flowJobQO.setStatus(pagedJobQO.getStatus());
        }


        if (org.apache.commons.lang3.StringUtils.isNotBlank(pagedJobQO.getOrderField()) && !"f_job_id".equals(pagedJobQO.getOrderField())) {
//          todo
//            flowJobQO.setOrder_by(pagedJobQO.getOrderField().replaceFirst("f_","")); cannot be job_id
            flowJobQO.setOrder_by(pagedJobQO.getOrderField().replaceFirst("f_", ""));
        }
        //jobid partyid 不支持模糊查询

        flowJobQO.setOrder(pagedJobQO.getOrderRule());

//todo
//        flowJobQO.setPartner(pagedJobQO.getPartner());
        Map<String, Object> jobMap = getJobMap(flowJobQO);
        List<JobDO> jobWithBLOBs = new ArrayList<>();
        long count = 0;
        if (jobMap != null) {
            jobWithBLOBs = (List<JobDO>) jobMap.get("list");
            count = ((Integer) jobMap.get("count"));
        }


//        long jobSum = this.countJob(pagedJobQO);
        PageBean<Map<String, Object>> listPageBean = new PageBean<>(pagedJobQO.getPageNum(), pagedJobQO.getPageSize(), count);
//        long startIndex = listPageBean.getStartIndex();
//        List<JobDO> jobWithBLOBs = jobMapper.queryPagedJobs(pagedJobQO, startIndex);
        LinkedList<Map<String, Object>> jobList = new LinkedList<>();
        Map<JobDO, Future> jobDataMap = new LinkedHashMap<>();
        for (JobDO jobWithBLOB : jobWithBLOBs) {
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
//                JSONObject data=null;
                return data;
            }, new int[]{500, 1000}, new int[]{3, 3});
//            jobWithBLOB.setfRunIp(null);
            jobWithBLOB.setfDsl(null);
            jobWithBLOB.setfRuntimeConf(null);

            //set partners
            String role = jobWithBLOB.getfRole();
            if ("local".equals(role) || "arbiter".equals(role)) {
                jobWithBLOB.setPartners(null);
            }
            HashSet<String> partners = new HashSet<>();
            String roles = jobWithBLOB.getfRoles();
            JSONObject jsonObject = JSON.parseObject(roles);
            if ("guest".equals(role)) {

                JSONArray hosts = jsonObject.getJSONArray("host");
                if (hosts != null) {
                    for (int i = 0; i < hosts.size(); i++) {
                        Object o = hosts.get(i);
                        partners.add(String.valueOf(o));

                    }
                }

                JSONArray arbiters = jsonObject.getJSONArray("arbiter");
                if (arbiters != null) {
                    for (int i = 0; i < arbiters.size(); i++) {
                        Object o = arbiters.get(i);
                        partners.add(String.valueOf(o));
                    }
                }

            }

            if ("host".equals(role)) {
                JSONArray guests = jsonObject.getJSONArray("guest");
                if (guests != null) {
                    for (int i = 0; i < guests.size(); i++) {
                        Object o = guests.get(i);
                        partners.add(String.valueOf(o));
                    }
                }

            }
            jobWithBLOB.setPartners(partners);

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

//    public long countJob(PagedJobQO pagedJobQO) {
//        return jobMapper.countJob(pagedJobQO);
//    }

    public Map<String, List<String>> queryFields() {
        return Dict.fieldMap;
    }

    public int reRun(ReRunDTO reRunDTO) {

        String result;
        try {
            result = httpClientPool.post(fateUrl + Dict.URL_JOB_RERUN, JSON.toJSONString(reRunDTO));
            if (result != null) {
                JSONObject jsonObject = JSON.parseObject(result);
                if (0 == jsonObject.getInteger(Dict.RETCODE)) {
                    return 0;
                }
            }
        } catch (Exception e) {
            logger.error("connect fate flow error:", e);
        }
        return 1;

    }

    public String getComponentCommand(ComponentQueryDTO componentQueryDTO) {
        StringBuffer command = new StringBuffer().append("flow component output-data -j ").append(componentQueryDTO.getJob_id()).append(" -r ").append(componentQueryDTO.getRole()).append(" -p ").append(componentQueryDTO.getParty_id()).append(" -cpn ").append(componentQueryDTO.getComponent_name()).append(" --output-path ").append("./");
        return command.toString();
    }


    public ResponseResult download(DownloadQO downloadQO, HttpServletResponse response) {

        //check input parameters
        String jobId = downloadQO.getJobId();
        String role = downloadQO.getRole();
        String type = downloadQO.getType();
        String partyId = downloadQO.getPartyId();

        if (StringUtils.isEmpty(jobId)) {
            log.error("parameter null:jobId");
            return new ResponseResult(ErrorCode.ERROR_PARAMETER);
        }
        if (StringUtils.isEmpty(role)) {
            log.error("parameter null:role");
            return new ResponseResult(ErrorCode.ERROR_PARAMETER);
        }
        if (StringUtils.isEmpty(type)) {
            log.error("parameter null:type");
            return new ResponseResult(ErrorCode.ERROR_PARAMETER);
        }

        if (!LogFileService.checkParameters("^[0-9a-zA-Z\\-_]+$", jobId, role, type)) {
            log.error("parameter error: illegal characters in role or jobId or type");
            return new ResponseResult(ErrorCode.ERROR_PARAMETER);
        }
        if (StringUtils.isEmpty(partyId)) {
            log.error("parameter null:partyId");
            return new ResponseResult(ErrorCode.ERROR_PARAMETER);
        }


        Map<String, Object> query = new HashMap<>();
        query.put("job_id", jobId);
        String result = null;
        try {
            result = httpClientPool.post(fateUrl + Dict.URL_CONFIG_CAT, JSON.toJSONString(query));
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            //todo
//            throw new Exception(ErrorCode.FATEFLOW_ERROR_CONNECTION.getMsg());
//            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }
        JSONObject resultObject = JSON.parseObject(result);
        JSONObject dataObject = resultObject.getJSONObject(Dict.DATA);
        JSONObject dslObject = dataObject.getJSONObject("dsl");
        JSONObject runtime_confObject = dataObject.getJSONObject("runtime_conf");
        JSONObject responseObject;


        String fileOutputName = "";

        if ("dsl".equals(type)) {
            fileOutputName = "job_dsl_" + jobId + ".json";
            responseObject = dslObject;
        } else {
            if ("guest".equals(role) || "local".equals(role)) {
                fileOutputName = "runtime_config_" + jobId + ".json";
                responseObject = runtime_confObject;
            } else if ("host".equals(role)) {
                fileOutputName = "runtime_config_" + jobId + ".json";
                responseObject = getHostConfig(runtime_confObject);
            } else {
                log.error("download error: role:{} doesn't support", role);
                return new ResponseResult(ErrorCode.ERROR_PARAMETER);
            }

        }



        response.setBufferSize(1024 * 1000);
        response.setContentType("application/force-download");
        response.setHeader("Content-Disposition", "attachment;fileName=" + fileOutputName);
        try {
            OutputStream os = response.getOutputStream();
            os.write(JSON.toJSONBytes(responseObject, SerializerFeature.PrettyFormat, SerializerFeature.WriteMapNullValue, SerializerFeature.WriteDateUseDateFormat));
//            os.flush();
//            os.close();
               log.info("download success,file :{}", fileOutputName);
        } catch (Exception e) {
            log.error("download failed", e);
            return new ResponseResult(ErrorCode.DOWNLOAD_ERROR);
        }
        return null;
    }

    //host端需过滤掉其他方信息
    private JSONObject getHostConfig(JSONObject runtime_confObject) {
        if (runtime_confObject != null) {
            runtime_confObject.remove("initiator");
            JSONObject role = runtime_confObject.getJSONObject("role");
            if (role != null) {
                role.remove("guest");
                role.remove("arbiter");
            }
            JSONObject component_parameters = runtime_confObject.getJSONObject("component_parameters");
            if (component_parameters != null) {
                JSONObject role1 = component_parameters.getJSONObject("role");
                if (role1 != null) {
                    role1.remove("guest");
                }
            }
            JSONObject role_parameters = runtime_confObject.getJSONObject("role_parameters");
            if (role_parameters != null) {
                role_parameters.remove("guest");
            }
            return runtime_confObject;
        }
        return null;

    }

    private ResponseResult getHostConfig(HttpServletResponse response, String fileName, String realPath, String
            fileOutputName) {
        File file = new File(realPath, fileName);
        if (file.exists()) {
            BufferedReader br = null;
            BufferedWriter bw = null;
            try {
                br = new BufferedReader(new FileReader(file));
                response.setContentType("application/force-download");
                response.setHeader("Content-Disposition", "attachment;fileName=" + fileOutputName);
                bw = new BufferedWriter(response.getWriter());
                String s = null;
                String ws = null;
                StringBuilder ss = new StringBuilder();
                while ((s = br.readLine()) != null) {
                    ss.append(s);
                }
                JSONObject dataJson = JSON.parseObject(ss.toString());
                if (dataJson != null) {
                    dataJson.remove("initiator");
                    JSONObject role = dataJson.getJSONObject("role");
                    if (role != null) {
                        role.remove("guest");
                        role.remove("arbiter");
                    }
                    JSONObject component_parameters = dataJson.getJSONObject("component_parameters");
                    if (component_parameters != null) {
                        JSONObject role1 = component_parameters.getJSONObject("role");
                        if (role1 != null) {
                            role1.remove("guest");
                        }
                    }
                    JSONObject role_parameters = dataJson.getJSONObject("role_parameters");
                    if (role_parameters != null) {
                        role_parameters.remove("guest");
                    }
                    ws = JSON.toJSONString(dataJson, SerializerFeature.PrettyFormat, SerializerFeature.WriteMapNullValue, SerializerFeature.WriteDateUseDateFormat);
                    bw.write(ws);
                    bw.flush();
                    log.info("download success,file :{}", realPath + fileName);
                }
            } catch (Exception e) {
                log.error("download failed", e);
                return new ResponseResult(ErrorCode.DOWNLOAD_ERROR);
            } finally {
                if (br != null) {
                    try {
                        br.close();
                    } catch (IOException e) {
                        log.error("download io close failed", e);
                    }
                }
                if (bw != null) {
                    try {
                        bw.close();
                    } catch (IOException e) {
                        log.error("download io close failed", e);
                    }
                }
            }

            return null;
        } else {
            return new ResponseResult(ErrorCode.FILE_ERROR);
        }
    }

}