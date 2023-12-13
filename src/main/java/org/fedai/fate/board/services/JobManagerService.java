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
package org.fedai.fate.board.services;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.TypeReference;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;
import org.fedai.fate.board.exceptions.LogicException;
import org.fedai.fate.board.global.Dict;
import org.fedai.fate.board.global.ErrorCode;
import org.fedai.fate.board.global.ResponseResult;
import org.fedai.fate.board.log.LogFileService;
import org.fedai.fate.board.utils.PageBean;
import org.fedai.fate.board.utils.ThreadPoolTaskExecutorUtil;
import lombok.extern.slf4j.Slf4j;
import org.fedai.fate.board.pojo.*;
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

    @Autowired
    FlowFeign flowFeign;
    @Value("${fateflow.url}")
    String fateUrl;
    @Autowired
    ThreadPoolTaskExecutor asyncServiceExecutor;


    public List<JobDO> queryJobStatus() {
        Map<String, Object> param = new HashMap<>();
        List<String> statusList = new ArrayList<>();
        statusList.add(Dict.STATUS_JOB_WAITING);
        statusList.add(Dict.STATUS_JOB_RUNNING);
        param.put("status", statusList);
        Map<String, Object> jobMap = getJobMap(param);
        if (jobMap != null) {
            return (List<JobDO>) jobMap.get("list");
        }
        return null;
    }


    private Map<String, Object> getJobMap(Map<String, Object> params) {
        String result = null;
        try {
            result = flowFeign.get(Dict.URL_JOB_QUERY_LIST, params);
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            LogicException.throwError(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }
        if (result != null) {
            JSONObject resultObject = JSON.parseObject(result);
            Integer retCode = resultObject.getInteger(Dict.CODE);
            if (400 == retCode || 401 == retCode || 425 == retCode || 403 == retCode) {
                LogicException.throwError(retCode, resultObject.getString(Dict.RETMSG));
            }
            JSONObject dataObject = resultObject.getJSONObject(Dict.DATA);
            Integer count = dataObject.getInteger(Dict.COUNT);
            JSONArray jobs = dataObject.getJSONArray(Dict.DATA);

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
                jobDO.setPartners(flowJobDO.getPartners());
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

        Map<String, Object> reqMap = new HashMap<>();
        reqMap.put(Dict.JOBID, jobId);
        reqMap.put(Dict.ROLE, role);
        reqMap.put(Dict.PARTY_ID, partyId);
        Map<String, Object> jobMap = getJobMap(reqMap);
        if (jobMap != null && jobMap.get("list") != null) {
            return ((List<JobDO>) jobMap.get("list")).get(0);
        }

        return null;
    }


    public PageBean<Map<String, Object>> queryPagedJobs(PagedJobQO pagedJobQO) {
        Map<String, Object> reqMap = new HashMap<>();
        String jobId = pagedJobQO.getJobId();
        FlowJobQO flowJobQO = new FlowJobQO();
        if (jobId != null && 0 != jobId.trim().length()) {
            Preconditions.checkArgument(LogFileService.checkPathParameters(jobId));
            reqMap.put(Dict.JOBID, pagedJobQO.getJobId());
        }
        String partyId = pagedJobQO.getPartyId();
        if (partyId != null && 0 != partyId.trim().length()) {
            Preconditions.checkArgument(LogFileService.checkPathParameters(partyId));
            reqMap.put(Dict.PARTY_ID, pagedJobQO.getPartyId());
        }
        String partner = pagedJobQO.getPartner();
        if (partner != null && partner.trim().length() != 0) {
            Preconditions.checkArgument(LogFileService.checkPathParameters(partner));
            reqMap.put(Dict.PARTNER, partner);
        }

        String fDescription = pagedJobQO.getFDescription();
        if (fDescription != null && 0 != fDescription.trim().length()) {
            Preconditions.checkArgument(LogFileService.checkParameters("^[0-9a-zA-Z,.。\\-_\\u4e00-\\u9fa5\\s]+$", fDescription));
            reqMap.put(Dict.DESCRIPTION, pagedJobQO.getFDescription());
        }

        if (pagedJobQO.getRole() != null && pagedJobQO.getRole().size() > 0) {
            reqMap.put(Dict.ROLE, pagedJobQO.getRole());

        }
        if (pagedJobQO.getStatus() != null && pagedJobQO.getStatus().size() > 0) {
            reqMap.put(Dict.STATUS, pagedJobQO.getStatus());
        }

        if (org.apache.commons.lang3.StringUtils.isNotBlank(pagedJobQO.getOrderField())) {
            reqMap.put(Dict.ORDER_BY, pagedJobQO.getOrderField().replaceFirst("f_", ""));
        }

        reqMap.put(Dict.LIMIT, pagedJobQO.getPageSize().intValue());
        reqMap.put(Dict.PAGE, pagedJobQO.getPageNum().intValue());
        reqMap.put(Dict.ORDER, pagedJobQO.getOrderRule());

        Map<String, Object> jobMap = getJobMap(reqMap);
        List<JobDO> jobWithBLOBs = new ArrayList<>();
        long count = 0;
        if (jobMap != null) {
            jobWithBLOBs = (List<JobDO>) jobMap.get("list");
            count = ((Integer) jobMap.get("count"));
        }
        PageBean<Map<String, Object>> listPageBean = new PageBean<>(pagedJobQO.getPageNum(), pagedJobQO.getPageSize(), count);

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
                HashMap<String, Object> jobParams = Maps.newHashMap();
                jobParams.put(Dict.JOBID, jobId1);
                jobParams.put((Dict.ROLE), role1);
                jobParams.put(Dict.PARTY_ID, partyId1);
                String result = flowFeign.get(Dict.URL_JOB_QUERY, jobParams);

                JSONObject resultObject = JSON.parseObject(result);
                Integer retCode = resultObject.getInteger(Dict.CODE);
                if (400 == retCode || 401 == retCode || 425 == retCode || 403 == retCode) {
                    logger.error(resultObject.getString(Dict.RETMSG));
                    LogicException.throwError(retCode, resultObject.getString(Dict.RETMSG));
                }
                JSONObject data = (JSONObject)resultObject.getJSONArray(Dict.DATA).get(0);
                return data;
            }, new int[]{500, 1000}, new int[]{3, 3});
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


    public Map<String, List<String>> queryFields() {
        return Dict.fieldMap;
    }

    public int reRun(ReRunDTO reRunDTO) {

        String result;
        try {
            result = flowFeign.post(Dict.URL_JOB_RERUN, JSON.toJSONString(reRunDTO));
            if (result != null) {
                JSONObject jsonObject = JSON.parseObject(result);
                if (0 == jsonObject.getInteger(Dict.CODE)) {
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

        String jobId = downloadQO.getJobId();
        String role = downloadQO.getRole();
        String partyId = downloadQO.getPartyId();

        HashMap<String, Object> jobParams = Maps.newHashMap();
        jobParams.put(Dict.JOBID, jobId);
        jobParams.put((Dict.ROLE), role);
        jobParams.put(Dict.PARTY_ID, partyId);
        String result = null;
        try {
            result = flowFeign.get(Dict.URL_JOB_QUERY, jobParams);
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }

        if ((result == null) || (0 == result.trim().length())) {
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_NULL_RESULT);
        }

        JSONObject resultObject = JSON.parseObject(result);
        Integer retcode = resultObject.getInteger(Dict.CODE);
        if (retcode == null) {
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_WRONG_RESULT);
        }
        JSONObject dagInfo;
        if (retcode == 0) {
            JSONArray jsonArray = resultObject.getJSONArray(Dict.DATA);
            JSONObject data = jsonArray == null ? null : (JSONObject)jsonArray.get(0);
            dagInfo = data.getJSONObject("dag");
        } else {
            return new ResponseResult<>(retcode, resultObject.getString(Dict.RETMSG));
        }

        String fileOutputName = jobId + ".yaml";
        response.setBufferSize(1024 * 1000);
        response.setContentType("application/force-download");
        response.setHeader("Content-Disposition", "attachment;fileName=" + fileOutputName);
        try {
            OutputStream os = response.getOutputStream();
            os.write(JSON.toJSONBytes(dagInfo, SerializerFeature.PrettyFormat, SerializerFeature.WriteMapNullValue, SerializerFeature.WriteDateUseDateFormat));
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


    public Map<String, Object> generateURLParamJobQueryDTO(JobQueryDTO jobQueryDTO) {
        Map<String, Object> reqMap = new HashMap<>();
        if (!StringUtils.hasText(jobQueryDTO.getJob_id())) {
            reqMap.put(Dict.JOBID, jobQueryDTO.getJob_id());
        }
        if (!StringUtils.hasText(jobQueryDTO.getParty_id())) {
            reqMap.put(Dict.PARTY_ID, jobQueryDTO.getParty_id());
        }
        if (!StringUtils.hasText(jobQueryDTO.getRole())) {
            reqMap.put(Dict.ROLE, jobQueryDTO.getRole());
        }
        return reqMap;
    }
}