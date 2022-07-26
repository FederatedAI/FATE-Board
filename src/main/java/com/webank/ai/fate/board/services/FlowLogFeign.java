package com.webank.ai.fate.board.services;

import com.webank.ai.fate.board.conf.RouteTargeter;
import com.webank.ai.fate.board.intercept.FeignRequestInterceptor;
import com.webank.ai.fate.board.pojo.flow.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

@FeignClient(url = RouteTargeter.URL_PLACE_HOLDER + "/v1/log", name = "flowLogFeign", configuration = FeignRequestInterceptor.class)
public interface FlowLogFeign {

    @RequestMapping(value = "/cat", method = RequestMethod.POST)
    FlowResponse<List<FlowLogCatResp>> logCat(FlowLogCatReq request);

    @RequestMapping(value = "/size", method = RequestMethod.POST)
    FlowResponse<FlowLogSizeResp> logSize(FlowLogSizeReq request);

}
