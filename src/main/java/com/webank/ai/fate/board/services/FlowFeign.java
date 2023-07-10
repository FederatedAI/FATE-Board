package com.webank.ai.fate.board.services;

import com.webank.ai.fate.board.conf.RouteTargeter;
import com.webank.ai.fate.board.intercept.FeignRequestInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.cloud.openfeign.SpringQueryMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.Map;

@FeignClient(url = RouteTargeter.URL_PLACE_HOLDER, name = "flowFeign", configuration = FeignRequestInterceptor.class)
public interface FlowFeign {

    @RequestMapping(value = "{url}", method = RequestMethod.POST)
    String post(@PathVariable(value = "url") String url, String body);

    @RequestMapping(value = "{url}", method = RequestMethod.GET)
    String get(@PathVariable(value = "url") String url, @SpringQueryMap(encoded = true) Map<String, Object> paramMap);

}
