package com.webank.ai.fate.board.conf;

import feign.Logger;
import feign.Request;
import feign.Response;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.cloud.openfeign.FeignClientsConfiguration;
import org.springframework.cloud.openfeign.clientconfig.HttpClientFeignConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@AutoConfigureAfter({HttpClientFeignConfiguration.class})
@AutoConfigureBefore({FeignClientsConfiguration.class})
public class FeignConfig {

    @Value("${feign.log.level:HEADERS}")
    private String logLevel;

    @Value("${feign.log.none.url-regex:/log/size;/job/list/job}")
    private String noneUrlList;

    @Value("${feign.log.basic.url-regex:}")
    private String basicUrlList;

    @Value("${feign.log.headers.url-regex:}")
    private String headersUrlList;

    @Value("${feign.log.full.url-regex:}")
    private String fullUrlList;

    @Bean
    Logger.Level feignLoggerLevel() {
        switch (logLevel) {
            case "NONE":
                return Logger.Level.NONE;
            case "BASIC":
                return Logger.Level.BASIC;
            case "HEADERS":
                return Logger.Level.HEADERS;
            case "FULL":
                return Logger.Level.FULL;
        }
        return Logger.Level.FULL;
    }

    /**
     * +用Spring定义的日志系统代理feign日志系统
     *
     * @return 代理日志系统
     */
    @Bean
    @Primary
    public Logger logger() {
        Map<Logger.Level, List<String>> logLeveMap = new HashMap<>();
        logLeveMap.put(Logger.Level.NONE, getRegex(noneUrlList));
        logLeveMap.put(Logger.Level.BASIC, getRegex(basicUrlList));
        logLeveMap.put(Logger.Level.HEADERS, getRegex(headersUrlList));
        logLeveMap.put(Logger.Level.FULL, getRegex(fullUrlList));
        return new FeignLog(this.getClass(), logLeveMap);
    }

    private List<String> getRegex(String urlListString) {
        List<String> regexList = new ArrayList<>();
        if (!urlListString.trim().isEmpty()) {
            String[] urlList = urlListString.trim().split(";");
            for (String regex : urlList) {
                if (!regex.contains("http")) {
                    regexList.add("http[s]?://.*" + regex);
                }
            }
        }
        return regexList;
    }

    @Bean
    public RouteTargeter getRouteTargeter(Environment environment) {
        return new RouteTargeter(environment);
    }

    /**
     * Springboot的代理log
     */
    final class FeignLog extends Logger {
        private final org.slf4j.Logger logger;
        private final Map<Level, List<String>> logLevelMap;
        private final ThreadLocal<Level> localLogLevel = new ThreadLocal<>();

        public FeignLog(Class<?> clazz, Map<Level, List<String>> logLevelMap) {
            logger = LoggerFactory.getLogger(clazz);
            this.logLevelMap = logLevelMap;
        }

        @Override
        protected void log(String configKey, String format, Object... args) {
            logger.debug(String.format(methodTag(configKey) + format, args));
        }

        @Override
        protected void logRequest(String configKey, Level logLevel, Request request) {
            for (Map.Entry<Level, List<String>> entry : logLevelMap.entrySet()) {
                for (String regex : entry.getValue()) {
                    if (request.url().matches(regex)) {
                        localLogLevel.set(entry.getKey());
                    }
                }
            }
            if (localLogLevel.get() != null) {
                logLevel = localLogLevel.get();
            }
            if (logLevel == Level.NONE) {
                return;
            }
            super.logRequest(configKey, logLevel, request);
        }

        @Override
        protected Response logAndRebufferResponse(String configKey, Level logLevel, Response response, long elapsedTime) throws IOException {
            if (localLogLevel.get() != null) {
                logLevel = localLogLevel.get();
                localLogLevel.remove();
            }
            if (logLevel == Level.NONE) {
                return response;
            }
            return super.logAndRebufferResponse(configKey, logLevel, response, elapsedTime);
        }
    }

    public static String methodTag(Class targetType, Method method) {
        StringBuilder builder = new StringBuilder();
        builder.append(targetType.getSimpleName());
        builder.append('#').append(method.getName());
        return builder.toString();
    }

}