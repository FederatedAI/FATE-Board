package com.webank.ai.fate.board.services;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.webank.ai.fate.board.global.Dict;
import com.webank.ai.fate.board.global.ResponseResult;
import com.webank.ai.fate.board.pojo.BatchMetricDTO;
import com.webank.ai.fate.board.utils.HttpClientPool;
import com.webank.ai.fate.board.utils.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.util.concurrent.ListenableFuture;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;


@Service
public class JobDetailService {
    private static Logger logger = LoggerFactory.getLogger(JobDetailService.class);

    @Autowired
    HttpClientPool httpClientPool;
    @Autowired
    ThreadPoolTaskExecutor asyncServiceExecutor;

    @Value("${fateflow.url}")
    String fateUrl;

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
            dataObject.put(metricNameSpace,stringMapHashMap);
            for (String metric : metricNames) {
                JSONObject metricObject = new JSONObject();
                metricObject.put(Dict.JOBID, jobId);
                metricObject.put(Dict.ROLE, role);
                metricObject.put(Dict.PARTY_ID, new Integer(partyId));
                metricObject.put(Dict.COMPONENT_NAME, componentName);
                metricObject.put(Dict.METRIC_NAMESPACE, metricNameSpace);
                metricObject.put(Dict.METRIC_NAME, metric);
                ListenableFuture<String> responseResultListenableFuture = asyncServiceExecutor.submitListenable(
                        () -> httpClientPool.post(fateUrl + Dict.URL_COPONENT_METRIC_DATA, metricObject.toJSONString())
                );


                try {
                    String result = responseResultListenableFuture.get();
                    if (result != null && result.trim().length() != 0) {
                        JSONObject resultObject = JSON.parseObject(result);
                        Integer retCode = resultObject.getInteger(Dict.RETCODE);
                        if (retCode == 0) {
                            stringMapHashMap.put(metric,resultObject);
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
