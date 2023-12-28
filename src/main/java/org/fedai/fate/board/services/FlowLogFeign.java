package org.fedai.fate.board.services;

import org.fedai.fate.board.conf.RouteTargeter;
import org.fedai.fate.board.intercept.FeignRequestInterceptor;
import org.fedai.fate.board.pojo.flow.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.cloud.openfeign.SpringQueryMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;
import java.util.Map;

@FeignClient(url = RouteTargeter.URL_PLACE_HOLDER + "/v2/log", name = "flowLogFeign", configuration = FeignRequestInterceptor.class)
public interface FlowLogFeign {

    @RequestMapping(value = "/query", method = RequestMethod.GET)
    String logCat( @SpringQueryMap(encoded = true) Map<String, Object> paramMap);

    @RequestMapping(value = "/count", method = RequestMethod.GET)
    String logSize( @SpringQueryMap(encoded = true) Map<String, Object> paramMap);

}
