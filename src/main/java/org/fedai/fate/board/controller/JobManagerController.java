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
package org.fedai.fate.board.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;
import org.fedai.fate.board.global.Dict;
import org.fedai.fate.board.global.ErrorCode;
import org.fedai.fate.board.global.ResponseResult;
import org.fedai.fate.board.log.LogFileService;
import org.fedai.fate.board.services.FlowFeign;
import org.fedai.fate.board.services.JobManagerService;
import org.fedai.fate.board.utils.PageBean;
import org.fedai.fate.board.utils.ResponseUtil;
import org.fedai.fate.board.pojo.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping(value = "/job")
public class JobManagerController {
    private final Logger logger = LoggerFactory.getLogger(JobManagerController.class);

    @Autowired
    JobManagerService jobManagerService;

    @Autowired
    FlowFeign flowFeign;

    @Value("${fateflow.url}")
    String fateUrl;


    @RequestMapping(value = "/query/status", method = RequestMethod.GET)
    public ResponseResult queryJobStatus() {
        List<JobDO> jobs = jobManagerService.queryJobStatus();
        return new ResponseResult<>(ErrorCode.SUCCESS, jobs);
    }

    @RequestMapping(value = "/v1/pipeline/job/stop", method = RequestMethod.POST)
    public ResponseResult stopJob(@Valid @RequestBody JobStopDTO jobStopDTO, BindingResult bindingResult) {


        if (bindingResult.hasErrors()) {
            FieldError errors = bindingResult.getFieldError();
            return new ResponseResult<>(ErrorCode.ERROR_PARAMETER, errors.getDefaultMessage());
        }

        Preconditions.checkArgument(LogFileService.checkPathParameters(jobStopDTO.getJob_id()));

        String result;
        try {
            result = flowFeign.post(Dict.URL_JOB_STOP, JSON.toJSONString(jobStopDTO));
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }

        return ResponseUtil.buildResponse(result, null);

    }

    @RequestMapping(value = "/tracking/job/data_view", method = RequestMethod.POST)
    public ResponseResult queryJobDataset(@Valid @RequestBody JobQueryDTO jobQueryDTO, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            FieldError errors = bindingResult.getFieldError();
            return new ResponseResult<>(ErrorCode.ERROR_PARAMETER, errors.getDefaultMessage());
        }

        Preconditions.checkArgument(LogFileService.checkPathParameters(jobQueryDTO.getJob_id(), jobQueryDTO.getRole(), jobQueryDTO.getParty_id()));

        String result;
        try {
            result = flowFeign.get(Dict.URL_JOB_QUERY, jobManagerService.generateURLParamJobQueryDTO(jobQueryDTO));
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }

        return ResponseUtil.buildResponse(result, Dict.DATA);
    }


    @RequestMapping(value = "/query/{jobId}/{role}/{partyId}", method = RequestMethod.GET)
    public ResponseResult queryJobById(@PathVariable("jobId") String jobId,
                                       @PathVariable("role") String role,
                                       @PathVariable("partyId") String partyId
    ) {
        Preconditions.checkArgument(LogFileService.checkPathParameters(jobId, role, partyId));

        HashMap<String, Object> resultMap = new HashMap<>();
        JobDO jobWithBLOBs = jobManagerService.queryJobByConditions(jobId, role, partyId);

        if (jobWithBLOBs == null) {
            return new ResponseResult<>(ErrorCode.DATABASE_ERROR_RESULT_NULL);
        }

        jobWithBLOBs.setfDsl(null);
        jobWithBLOBs.setfRuntimeConf(null);
        if (jobWithBLOBs.getfStatus().equals(Dict.TIMEOUT)) {
            jobWithBLOBs.setfStatus(Dict.FAILED);
        }

        Map<String, Object> paramMap = Maps.newHashMap();
        paramMap.put(Dict.JOBID, jobId);
        paramMap.put(Dict.ROLE, role);
        paramMap.put(Dict.PARTY_ID, new Integer(partyId));

        String result;
        try {
            result = flowFeign.get(Dict.URL_JOB_QUERY, paramMap);
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

        if (retcode == 0) {
            JSONArray jsonArray = resultObject.getJSONArray(Dict.DATA);
            JSONObject data = jsonArray == null ? null : (JSONObject) jsonArray.get(0);
            if(data != null) {
                String dataViewResult;
                try {
                    dataViewResult = flowFeign.get(Dict.URL_JOB_DATA_VIEW, paramMap);
                    JSONObject dataViewResultObj = JSON.parseObject(dataViewResult);
                    JSONObject dataObject = dataViewResultObj.getJSONObject(Dict.DATA);
                    JSONObject dataViewObject = dataObject.getJSONObject(Dict.DATA_VIEW);
                    data.put(Dict.DATA_SET,dataViewObject);
                } catch (Exception e) {
                    logger.error("add data view error:", e);
                }
            }
            resultMap.put(Dict.JOB, jobWithBLOBs);
            resultMap.put(Dict.DATASET, data);
            return new ResponseResult<>(ErrorCode.SUCCESS, resultMap);
        } else {
            return new ResponseResult<>(retcode, resultObject.getString(Dict.RETMSG));
        }
    }


    @RequestMapping(value = "/query/page/new", method = RequestMethod.POST)
    public ResponseResult<PageBean<Map<String, Object>>> queryPagedJob(@RequestBody PagedJobQO pagedJobQO) {
        List<String> roles = pagedJobQO.getRole();
        List<String> status = pagedJobQO.getStatus();
        if (roles != null) {
            for (String role : roles) {
                Preconditions.checkArgument(LogFileService.checkPathParameters(role));
            }
        }
        if (status != null) {
            for (String s : status) {
                Preconditions.checkArgument(LogFileService.checkPathParameters(s));
            }
        }

        boolean result = checkOrderRule(pagedJobQO);
        if (!result) {
            return new ResponseResult<>(ErrorCode.REQUEST_PARAMETER_ERROR);
        }


        PageBean<Map<String, Object>> listPageBean = jobManagerService.queryPagedJobs(pagedJobQO);
        return new ResponseResult<>(ErrorCode.SUCCESS, listPageBean);
    }

    private boolean checkOrderRule(PagedJobQO pagedJobQO) {
        String orderField = pagedJobQO.getOrderField();
        String orderRule = pagedJobQO.getOrderRule();
        return Dict.ORDER_FIELDS.contains(orderField) && Dict.ORDER_RULES.contains(orderRule);
    }


    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public ResponseResult updateJobById(@Valid @RequestBody UpdateNotesDTO updateNotesDTO, BindingResult bindingResult) {


        if (bindingResult.hasErrors()) {
            FieldError errors = bindingResult.getFieldError();
            return new ResponseResult<>(ErrorCode.ERROR_PARAMETER, errors.getDefaultMessage());
        }

        Preconditions.checkArgument(LogFileService.checkPathParameters(updateNotesDTO.getJob_id(), updateNotesDTO.getRole(), updateNotesDTO.getParty_id()));
        Preconditions.checkArgument(LogFileService.checkParameters("^[0-9a-zA-Z,.。\\-_\\u4e00-\\u9fa5\\s]+$", updateNotesDTO.getNotes()));

        String result;
        try {
            result = flowFeign.post(Dict.URL_JOB_UPDATE, JSON.toJSONString(updateNotesDTO));
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }
        if ((result == null) || (0 == result.trim().length())) {
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_NULL_RESULT);
        }
        return ResponseUtil.buildResponse(result, null);

    }


    @RequestMapping(value = "/query/fields", method = RequestMethod.POST)
    public ResponseResult<Map<String, List<String>>> queryFields() {
        Map<String, List<String>> fieldsMap = jobManagerService.queryFields();
        return new ResponseResult<>(ErrorCode.SUCCESS, fieldsMap);
    }

    @RequestMapping(value = "/v1/rerun", method = RequestMethod.POST)
    public ResponseResult reRun(@Valid @RequestBody ReRunDTO reRunDTO, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            FieldError errors = bindingResult.getFieldError();
            return new ResponseResult<>(ErrorCode.ERROR_PARAMETER, errors.getDefaultMessage());
        }
        Preconditions.checkArgument(LogFileService.checkPathParameters(reRunDTO.getJob_id(), reRunDTO.getComponent_name()));

        int i = jobManagerService.reRun(reRunDTO);
        if (i == 0) {
            return new ResponseResult<>(ErrorCode.SUCCESS);
        } else {
            return new ResponseResult<>(ErrorCode.RERUN_ERROR);
        }
    }

    @RequestMapping(value = "/componentCommand", method = RequestMethod.POST)
    public ResponseResult<String> getComponentCommand(@Valid @RequestBody ComponentQueryDTO componentQueryDTO, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            FieldError errors = bindingResult.getFieldError();
            return new ResponseResult<>(ErrorCode.ERROR_PARAMETER, errors.getDefaultMessage());
        }
        Preconditions.checkArgument(LogFileService.checkPathParameters(componentQueryDTO.getJob_id(), componentQueryDTO.getRole(), componentQueryDTO.getParty_id(), componentQueryDTO.getComponent_name()));

        String componentCommand = jobManagerService.getComponentCommand(componentQueryDTO);
        return new ResponseResult<>(ErrorCode.SUCCESS, componentCommand);
    }


    /*
     * download dsl and runtime conf
     *
     */
    @RequestMapping(value = "/download", method = RequestMethod.POST)
    public ResponseResult download(@RequestBody DownloadQO downloadQO, HttpServletResponse response) {
        return jobManagerService.download(downloadQO, response);

    }

}
