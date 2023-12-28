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
import com.alibaba.fastjson.JSONObject;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.fedai.fate.board.global.Dict;
import org.fedai.fate.board.pojo.BatchMetricDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.util.concurrent.ListenableFuture;
import org.yaml.snakeyaml.Yaml;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.*;


@Service
public class JobDetailService {
    private static Logger logger = LoggerFactory.getLogger(JobDetailService.class);

    @Autowired
    FlowFeign flowFeign;
    @Autowired
    ThreadPoolTaskExecutor asyncServiceExecutor;

    @Value("${fateflow.url}")
    String fateUrl;

    public String getComponentStaticInfo(String componentName) throws Exception {
        String projectDir = System.getProperty("user.dir");
        String jsonData = "";
        List<String> whiteList = getWhiteList(projectDir);
        String fileName = componentName + ".yaml";
        int index = whiteList.indexOf(fileName);
        if (index > -1) {
            String yamlFilePath = projectDir + File.separator + "dag" + File.separator +componentName + ".yaml";
            Yaml yaml = new Yaml();
            ObjectMapper objectMapper = new ObjectMapper();
            InputStream inputStream = new FileInputStream(yamlFilePath);
            Map<String, Object> yamlData = yaml.load(inputStream);
            jsonData = objectMapper.writeValueAsString(yamlData);
        }
        return jsonData;
    }

    private  List<String> getWhiteList(String projectDir) {
        String dirPath =  projectDir + File.separator + "dag";
        File dir = new File(dirPath);
        File[] files = dir.listFiles();
        List<String> whiteList = new ArrayList<>();
        if (files != null && files.length > 0) {
            for (File file : files) {
                if (file.isFile()) {
                    whiteList.add(file.getName());
                }
            }
        }
        return whiteList;
    }

    public JSONObject getBatchMetricInfo(BatchMetricDTO batchMetricDTO) {

        String jobId = batchMetricDTO.getJob_id();
        String role = batchMetricDTO.getRole();
        String partyId = batchMetricDTO.getParty_id();
        String componentName = batchMetricDTO.getComponent_name();
        Map<String, String[]> metrics = batchMetricDTO.getMetrics();
        Set<Map.Entry<String, String[]>> entries = metrics.entrySet();

        JSONObject dataObject = new JSONObject();
        for (Map.Entry<String, String[]> entry : entries) {
            String metricNameSpace = entry.getKey();
            String[] metricNames = entry.getValue();
            HashMap<String, JSONObject> stringMapHashMap = new HashMap<>();
            dataObject.put(metricNameSpace, stringMapHashMap);
            for (String metric : metricNames) {
                Map<String, Object> reqMap = new HashMap<>();
                reqMap.put(Dict.JOBID, jobId);
                reqMap.put(Dict.ROLE, role);
                reqMap.put(Dict.PARTY_ID, new Integer(partyId));
                reqMap.put(Dict.COMPONENT_NAME, componentName);
                reqMap.put(Dict.METRIC_NAMESPACE, metricNameSpace);
                reqMap.put(Dict.METRIC_NAME, metric);
                ListenableFuture<String> responseResultListenableFuture = asyncServiceExecutor.submitListenable(
                        () -> flowFeign.get(Dict.URL_COPONENT_METRIC_DATA, reqMap)
                );

                try {
                    String result = responseResultListenableFuture.get();
                    if (result != null && result.trim().length() != 0) {
                        JSONObject resultObject = JSON.parseObject(result);
                        Integer retCode = resultObject.getInteger(Dict.CODE);
                        if (retCode == 0) {
                            stringMapHashMap.put(metric, resultObject);
                            continue;
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    logger.error("get metric data error", e);
                }
                return null;
            }
        }
        return dataObject;
    }
}
