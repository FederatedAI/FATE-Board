package org.fedai.fate.board.services;

import org.fedai.fate.board.conf.RouteTargeter;
import org.fedai.fate.board.intercept.FeignRequestInterceptor;
import org.fedai.fate.board.pojo.flow.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

@FeignClient(url = RouteTargeter.URL_PLACE_HOLDER + "/v2/log", name = "flowLogFeign", configuration = FeignRequestInterceptor.class)
public interface FlowLogFeign {

    @RequestMapping(value = "/query", method = RequestMethod.GET)
    FlowResponse<List<FlowLogCatResp>> logCat(FlowLogCatReq request);

    @RequestMapping(value = "/count", method = RequestMethod.GET)
    FlowResponse<FlowLogSizeResp> logSize(FlowLogSizeReq request);

}
