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
import org.fedai.fate.board.global.Dict;
import org.fedai.fate.board.pojo.FlowTaskDO;
import org.fedai.fate.board.pojo.TaskDO;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TaskManagerService {
    private final Logger logger = LoggerFactory.getLogger(TaskManagerService.class);
    //    @Autowired
//    TaskMapper taskMapper;
    @Value("${fateflow.url}")
    String fateUrl;
    @Autowired
    FlowFeign flowFeign;


    public Map<String,Object> findTaskDetail(String jobId, String role, String partyId, String componentName) {

        Map<String,Object> resultMap = new HashMap<>();

        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put(Dict.JOBID, jobId);
        paramMap.put(Dict.ROLE, role);
        paramMap.put(Dict.PARTY_ID, partyId);
        paramMap.put(Dict.TASK_NAME, componentName);

        String result = null;
        try {
            result = flowFeign.get(Dict.URL_TASK_DATAVIEW, paramMap);
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            return null;
        }

        if (StringUtils.isNotBlank(result)) {
            JSONArray tasks = JSON.parseObject(result).getJSONArray(Dict.DATA);
            if (tasks != null || tasks.size() > 0) {
                JSONObject taskDetail = (JSONObject)tasks.get(0);
                resultMap.put("status",taskDetail.getString("status"));
                resultMap.put("time",taskDetail.get("end_time"));
            }
            return resultMap;
        }
        return null;
    }

    public TaskDO findTask(String jobId, String role, String partyId, String componentName) {

//        List<TaskDO> tasks = taskMapper.findTask(jobId, role,partyId, componentName);
//
//        if (tasks.size() != 0) {
//            return tasks.get(0);
//        }
//        return null;

        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put(Dict.PAGE, 1);
        paramMap.put(Dict.LIMIT, 1);
        paramMap.put(Dict.JOBID, jobId);
        paramMap.put(Dict.ROLE, role);
        paramMap.put(Dict.PARTY_ID, partyId);
        paramMap.put(Dict.TASK_NAME, componentName);
//        paramMap.put(Dict.ORDER_BY, "task_version");
//        paramMap.put(Dict.ORDER, "desc");

//        FateFlowResponse fateFlowResponse = fateFlowApiService.sendPost(Integer.valueOf(partyId), BoardDict.URL_TASK_QUERY, JSON.toJSONString(flowTaskQO), null);
//        if (com.webank.ai.studio.common.enums.Dict.SUCCESS_CODE != fateFlowResponse.getRetcode()) {
//            throw new ParamErrorException(fateFlowResponse.getRetmsg());
//        }

        String result = null;
        try {
            result = flowFeign.get(Dict.URL_TASK_DATAVIEW, paramMap);
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            //todo

//            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        }
//        return ResponseUtil.buildResponse(result, Dict.DATA);
        if (StringUtils.isNotBlank(result)) {
            JSONArray tasks = JSON.parseObject(result).getJSONArray(Dict.DATA);
            List<FlowTaskDO> flowTaskDOS = JSON.parseObject(JSON.toJSONString(tasks), new TypeReference<List<FlowTaskDO>>() {
            });
            List<FlowTaskDO> flowTaskDOS2 = flowTaskDOS.stream().filter(flowTaskDO -> componentName.equals(flowTaskDO.getComponent_name())).collect(Collectors.toList());
            if (flowTaskDOS2.size() != 0) {
                FlowTaskDO flowTaskDO = flowTaskDOS2.get(0);
                TaskDO taskDO = new TaskDO();
                taskDO.setfJobId(flowTaskDO.getJob_id());
                taskDO.setfRole(flowTaskDO.getRole());
                taskDO.setfPartyId(flowTaskDO.getParty_id());
                taskDO.setfTaskId(flowTaskDO.getTask_id());
                taskDO.setfTaskVersion(flowTaskDO.getTask_version());
                taskDO.setfTaskSetId(flowTaskDO.getTask_set_id());
                taskDO.setfComponentName(flowTaskDO.getComponent_name());
                taskDO.setfInitiatorRole(flowTaskDO.getInitiator_role());
                taskDO.setfInitiatorPartyId(flowTaskDO.getInitiator_party_id());
                taskDO.setfStatus(flowTaskDO.getStatus());
                taskDO.setfStatusLevel(flowTaskDO.getStatus_level());
                taskDO.setfRunIp(flowTaskDO.getRun_ip());
                taskDO.setfRunPid(flowTaskDO.getRun_pid());
                taskDO.setfPartyStatus(flowTaskDO.getParty_status());
                taskDO.setfCreateTime(flowTaskDO.getCreate_time());
                taskDO.setfUpdateTime(flowTaskDO.getUpdate_time());
                taskDO.setfStartTime(flowTaskDO.getStart_time());
                taskDO.setfEndTime(flowTaskDO.getEnd_time());
                taskDO.setfElapsed(flowTaskDO.getElapsed());

                return taskDO;
            }

        }
        return null;

    }


}
