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
package com.webank.ai.fate.board.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.google.common.base.Preconditions;
import com.webank.ai.fate.board.global.ErrorCode;
import com.webank.ai.fate.board.global.ResponseResult;
import com.webank.ai.fate.board.log.LogFileService;
import com.webank.ai.fate.board.pojo.*;
import com.webank.ai.fate.board.services.JobDetailService;
import com.webank.ai.fate.board.services.TaskManagerService;
import com.webank.ai.fate.board.global.Dict;
import com.webank.ai.fate.board.utils.HttpClientPool;
import com.webank.ai.fate.board.utils.ResponseUtil;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;


@Controller
@RequestMapping(value = "/v1")
public class JobDetailController {

    private final Logger logger = LoggerFactory.getLogger(JobDetailController.class);

    @Autowired
    HttpClientPool httpClientPool;

    @Autowired
    TaskManagerService taskManagerService;
    @Autowired
    JobDetailService jobDetailService;

    @Value("${fateflow.url}")
    String fateUrl;

    @ResponseBody
    @RequestMapping(value = "/tracking/component/metrics", method = RequestMethod.POST)
    public ResponseResult getMetaInfo(@Valid @RequestBody ComponentQueryDTO componentQueryDTO, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            FieldError errors = bindingResult.getFieldError();
            return new ResponseResult<>(ErrorCode.ERROR_PARAMETER, errors.getDefaultMessage());
        }
        Preconditions.checkArgument(LogFileService.checkPathParameters(componentQueryDTO.getJob_id(), componentQueryDTO.getRole(), componentQueryDTO.getParty_id(), componentQueryDTO.getComponent_name()));


        String result;
        try {
            result = httpClientPool.post(fateUrl + Dict.URL_COPONENT_METRIC, JSON.toJSONString(componentQueryDTO));
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }
        return ResponseUtil.buildResponse(result, Dict.DATA);
    }

    @RequestMapping(value = "/tracking/component/metric_data", method = RequestMethod.POST)
    @ResponseBody
    public ResponseResult getMetricInfo(@Valid @RequestBody MetricDTO metricDTO, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            FieldError errors = bindingResult.getFieldError();
            return new ResponseResult<>(ErrorCode.ERROR_PARAMETER, errors.getDefaultMessage());
        }
        Preconditions.checkArgument(LogFileService.checkPathParameters(metricDTO.getJob_id(), metricDTO.getRole(), metricDTO.getParty_id(), metricDTO.getComponent_name(), metricDTO.getMetric_name(), metricDTO.getMetric_namespace()));

        String result;
        try {
            result = httpClientPool.post(fateUrl + Dict.URL_COPONENT_METRIC_DATA, JSON.toJSONString(metricDTO));
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }
        return ResponseUtil.buildResponse(result, null);
    }


    @RequestMapping(value = "/tracking/component/parameters", method = RequestMethod.POST)
    @ResponseBody
    public ResponseResult getDetailInfo(@Valid @RequestBody ComponentQueryDTO componentQueryDTO, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            FieldError errors = bindingResult.getFieldError();
            return new ResponseResult<>(ErrorCode.ERROR_PARAMETER, errors.getDefaultMessage());
        }
        Preconditions.checkArgument(LogFileService.checkPathParameters(componentQueryDTO.getJob_id(), componentQueryDTO.getRole(), componentQueryDTO.getParty_id(), componentQueryDTO.getComponent_name()));

        String result;
        try {
            result = httpClientPool.post(fateUrl + Dict.URL_COPONENT_PARAMETERS, JSON.toJSONString(componentQueryDTO));
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }
        if (StringUtils.isEmpty(result)) {
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_NULL_RESULT);

        }
        JSONObject resultObject = JSON.parseObject(result);
        Integer retcode = resultObject.getInteger(Dict.RETCODE);
        String msg = resultObject.getString(Dict.REMOTE_RETURN_MSG);
        JSONObject data = resultObject.getJSONObject(Dict.DATA);
        String dataWithNull = JSON.toJSONString(data, SerializerFeature.WriteMapNullValue);

        return new ResponseResult<>(retcode, msg, dataWithNull);

    }


    @RequestMapping(value = "/pipeline/dag/dependencies", method = RequestMethod.POST)
    @ResponseBody
    public ResponseResult getDagDependencies(@Valid @RequestBody JobQueryDTO jobQueryDTO, BindingResult bindingResult) {
        //check and get parameters

        if (bindingResult.hasErrors()) {
            FieldError errors = bindingResult.getFieldError();
            return new ResponseResult<>(ErrorCode.ERROR_PARAMETER, errors.getDefaultMessage());
        }
        Preconditions.checkArgument(LogFileService.checkPathParameters(jobQueryDTO.getJob_id(), jobQueryDTO.getRole(), jobQueryDTO.getParty_id()));


        String result;
        try {
            result = httpClientPool.post(fateUrl + Dict.URL_DAG_DEPENDENCY, JSON.toJSONString(jobQueryDTO));
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }

        if ((result == null) || 0 == result.trim().length()) {
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_NULL_RESULT);
        }

        JSONObject resultObject = JSON.parseObject(result);
        Integer retCode = resultObject.getInteger(Dict.RETCODE);
        if (retCode == null) {
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_WRONG_RESULT);
        }

        if (retCode == 0) {
            JSONObject data = resultObject.getJSONObject(Dict.DATA);
            JSONArray components_list = data.getJSONArray(Dict.COMPONENT_LIST);
            ArrayList<Map<String, Object>> componentList = new ArrayList<>();

            for (Object o : components_list) {
                HashMap<String, Object> component = new HashMap<>();
                component.put(Dict.COMPONENT_NAME, o);
                TaskDO task = taskManagerService.findTask(jobQueryDTO.getJob_id(), jobQueryDTO.getRole(),jobQueryDTO.getParty_id(), (String) o);
                String taskStatus = null;
                Long createTime = null;
                if (task != null) {
                    taskStatus = task.getfStatus();
                    createTime = task.getfCreateTime();
                }

                component.put(Dict.STATUS, taskStatus);
                component.put(Dict.TIME, createTime);
                componentList.add(component);
            }

            data.put(Dict.COMPONENT_LIST, componentList);
            return new ResponseResult<>(ErrorCode.SUCCESS, data);

        } else {
            return new ResponseResult<>(retCode, resultObject.getString(Dict.RETMSG));
        }
    }

    public ResponseResult getDagDependencies(String param) {
        //check and get parameters
        JSONObject jsonObject = JSON.parseObject(param);
        String jobId = jsonObject.getString(Dict.JOBID);
        String role = jsonObject.getString(Dict.ROLE);
        String partyId = jsonObject.getString(Dict.PARTY_ID);

        String result;
        try {
            result = httpClientPool.post(fateUrl + Dict.URL_DAG_DEPENDENCY, JSON.toJSONString(jsonObject));
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }

        if ((result == null) || 0 == result.trim().length()) {
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_NULL_RESULT);
        }

        JSONObject resultObject = JSON.parseObject(result);
        Integer retCode = resultObject.getInteger(Dict.RETCODE);
        if (retCode == null) {
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_WRONG_RESULT);
        }

        if (retCode == 0) {
            JSONObject data = resultObject.getJSONObject(Dict.DATA);
            JSONArray components_list = data.getJSONArray(Dict.COMPONENT_LIST);
            ArrayList<Map<String, Object>> componentList = new ArrayList<>();

            for (Object o : components_list) {
                HashMap<String, Object> component = new HashMap<>();
                component.put(Dict.COMPONENT_NAME, o);
                TaskDO task = taskManagerService.findTask(jobId, role,partyId, (String) o);
                String taskStatus = null;
                Long createTime = null;
                if (task != null) {
                    taskStatus = task.getfStatus();
                    createTime = task.getfStartTime();
                }

                component.put(Dict.STATUS, taskStatus);
                component.put(Dict.TIME, createTime);
                componentList.add(component);
            }

            data.put(Dict.COMPONENT_LIST, componentList);
            return new ResponseResult<>(ErrorCode.SUCCESS, data);

        } else {
            return new ResponseResult<>(retCode, resultObject.getString(Dict.RETMSG));
        }
    }

    @RequestMapping(value = "/tracking/component/output/model", method = RequestMethod.POST)
    @ResponseBody
    public ResponseResult getModel(@Valid @RequestBody ComponentQueryDTO componentQueryDTO, BindingResult bindingResult) {


        if (bindingResult.hasErrors()) {
            FieldError errors = bindingResult.getFieldError();
            return new ResponseResult<>(ErrorCode.ERROR_PARAMETER, errors.getDefaultMessage());
        }
        Preconditions.checkArgument(LogFileService.checkPathParameters(componentQueryDTO.getJob_id(), componentQueryDTO.getRole(), componentQueryDTO.getParty_id(), componentQueryDTO.getComponent_name()));

        String result;
        try {
            result = httpClientPool.post(fateUrl + Dict.URL_OUTPUT_MODEL, JSON.toJSONString(componentQueryDTO));
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }

        return ResponseUtil.buildResponse(result, null);
    }

    @RequestMapping(value = "/tracking/component/output/data", method = RequestMethod.POST)
    @ResponseBody
    public ResponseResult getData(@Valid @RequestBody ComponentQueryDTO componentQueryDTO, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            FieldError errors = bindingResult.getFieldError();
            return new ResponseResult<>(ErrorCode.ERROR_PARAMETER, errors.getDefaultMessage());
        }
        Preconditions.checkArgument(LogFileService.checkPathParameters(componentQueryDTO.getJob_id(), componentQueryDTO.getRole(), componentQueryDTO.getParty_id(), componentQueryDTO.getComponent_name()));

        String result;
        try {
            result = httpClientPool.post(fateUrl + Dict.URL_OUTPUT_DATA, JSON.toJSONString(componentQueryDTO));
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }

        return ResponseUtil.buildResponse(result, null);
    }

    @RequestMapping(value = "/tracking/component/metric_data/batch", method = RequestMethod.POST)
    @ResponseBody
    public ResponseResult getBatchMetricInfo(@Valid @RequestBody BatchMetricDTO batchMetricDTO, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            FieldError errors = bindingResult.getFieldError();
            return new ResponseResult(ErrorCode.ERROR_PARAMETER, errors.getDefaultMessage());
        }
        Map<String, String[]> metrics = batchMetricDTO.getMetrics();
        Set<Map.Entry<String, String[]>> entries = metrics.entrySet();
        for (Map.Entry<String, String[]> entry : entries) {
            String key = entry.getKey();
            Preconditions.checkArgument(LogFileService.checkPathParameters(key));
            String[] values = entry.getValue();
            for (String value : values) {
                Preconditions.checkArgument(LogFileService.checkPathParameters(value));
            }
        }

        JSONObject batchMetricInfo = jobDetailService.getBatchMetricInfo(batchMetricDTO);
        if (batchMetricInfo == null) {
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }
        return new ResponseResult<>(ErrorCode.SUCCESS, batchMetricInfo);
    }

}
