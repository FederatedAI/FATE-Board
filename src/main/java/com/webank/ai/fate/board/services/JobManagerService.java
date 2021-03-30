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
import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;
import com.webank.ai.fate.board.dao.JobMapper;
import com.webank.ai.fate.board.global.ErrorCode;
import com.webank.ai.fate.board.global.ResponseResult;
import com.webank.ai.fate.board.log.LogFileService;
import com.webank.ai.fate.board.pojo.*;
import com.webank.ai.fate.board.global.Dict;
import com.webank.ai.fate.board.utils.HttpClientPool;
import com.webank.ai.fate.board.utils.PageBean;
import com.webank.ai.fate.board.utils.ThreadPoolTaskExecutorUtil;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.util.concurrent.ListenableFuture;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.constraints.NotNull;
import java.io.*;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;


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
    JobMapper jobMapper;
    @Autowired
    HttpClientPool httpClientPool;
    @Value("${fateflow.url}")
    String fateUrl;
    @Autowired
    ThreadPoolTaskExecutor asyncServiceExecutor;


    public List<JobDO> queryJobStatus() {

        List<JobDO> jobDOS = jobMapper.queryJobStatus();
        return jobDOS;

    }

    public JobDO queryJobByConditions(String jobId, String role, String partyId) {

        JobDO jobDO = jobMapper.queryJobByConditions(jobId, role, partyId);
        return jobDO;
    }


    public PageBean<Map<String, Object>> queryPagedJobs(PagedJobQO pagedJobQO) {
        String jobId = pagedJobQO.getJobId();
        if (jobId != null && 0 != jobId.trim().length()) {
            Preconditions.checkArgument(LogFileService.checkPathParameters(jobId));
            pagedJobQO.setJobId("%" + jobId + "%");
        }
        String partyId = pagedJobQO.getPartyId();
        if (partyId != null && 0 != partyId.trim().length()) {
            Preconditions.checkArgument(LogFileService.checkPathParameters(partyId));
            pagedJobQO.setPartyId("%" + partyId + "%");
        }
        String partner = pagedJobQO.getPartner();
        if (partner != null && partner.trim().length() != 0) {
            Preconditions.checkArgument(LogFileService.checkPathParameters(partner));
            pagedJobQO.setPartner("%" + partner + "%");
        }
        String fDescription = pagedJobQO.getFDescription();
        if (fDescription != null && 0 != fDescription.trim().length()) {
            Preconditions.checkArgument(LogFileService.checkParameters("^[0-9a-zA-Z\\-_\\u4e00-\\u9fa5\\s]+$", fDescription));
//            Preconditions.checkArgument(LogFileService.checkPathParameters(pagedJobQO.getfDescription()));
            pagedJobQO.setFDescription("%" + fDescription + "%");
        }

        long jobSum = this.countJob(pagedJobQO);
        PageBean<Map<String, Object>> listPageBean = new PageBean<>(pagedJobQO.getPageNum(), pagedJobQO.getPageSize(), jobSum);
        long startIndex = listPageBean.getStartIndex();
        List<JobDO> jobWithBLOBs = jobMapper.queryPagedJobs(pagedJobQO, startIndex);
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

    public long countJob(PagedJobQO pagedJobQO) {
        return jobMapper.countJob(pagedJobQO);
    }

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

        //get fate path
        String webPath = System.getProperty("user.dir");
        int i1 = webPath.lastIndexOf("/");
        String fatePath = webPath.substring(0, i1);

        //build file path
        String fileName = "";
        String realPath = "";
        String fileOutputName = "";

        if ("dsl".equals(type)) {
            fileName = "job_dsl.json";
            realPath = fatePath + "/jobs/" + jobId + "/";
            fileOutputName = "job_dsl_" + jobId + ".json";
        } else {
            if ("guest".equals(role) || "local".equals(role)) {
                fileName = "job_runtime_conf.json";
                realPath = fatePath + "/jobs/" + jobId + "/";
                fileOutputName = "runtime_config_" + jobId + ".json";

            } else if ("host".equals(role)) {
                fileName = "job_runtime_on_party_conf.json";
                realPath = fatePath + "/jobs/" + jobId + "/" + role + "/";
                fileOutputName = "runtime_config_" + jobId + ".json";
            } else {
                log.error("download error: role:{} doesn't support", role);
                return new ResponseResult(ErrorCode.ERROR_PARAMETER);
            }

        }


        // download
        File file = new File(realPath, fileName);
        if (file.exists()) {
            response.setBufferSize(1024*1000);
            byte[] buffer = new byte[1024];
            FileInputStream fis = null;
            BufferedInputStream bis = null;
            try {
                fis = new FileInputStream(file);
                bis = new BufferedInputStream(fis);
                OutputStream os = response.getOutputStream();
                int i = bis.read(buffer);
                while (i != -1) {
                    os.write(buffer, 0, i);
                    i = bis.read(buffer);
                }
                log.info("download success,file :{}", realPath + fileName);
            } catch (Exception e) {
                log.error("download failed", e);
                return new ResponseResult(ErrorCode.DOWNLOAD_ERROR);
            } finally {
                if (bis != null) {
                    try {
                        bis.close();
                    } catch (IOException e) {
                        log.error("download io close failed", e);
                    }
                }
                if (fis != null) {
                    try {
                        fis.close();
                    } catch (IOException e) {
                        log.error("download io close failed", e);
                    }
                }
            }
            response.setContentType("application/force-download");
            response.setHeader("Content-Disposition", "attachment;fileName=" + fileOutputName);
            return null;
        } else {
            return new ResponseResult(ErrorCode.FILE_ERROR);
        }

    }

}