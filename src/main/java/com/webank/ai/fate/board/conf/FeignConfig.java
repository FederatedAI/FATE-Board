package com.webank.ai.fate.board.conf;

import feign.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.cloud.openfeign.FeignClientsConfiguration;
import org.springframework.cloud.openfeign.clientconfig.HttpClientFeignConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
@AutoConfigureAfter({HttpClientFeignConfiguration.class})
@AutoConfigureBefore({FeignClientsConfiguration.class})
public class FeignConfig {

    @Bean
    Logger.Level feignLoggerLevel() {
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
        return new FeignLog(this.getClass());
    }

    /**
     * Springboot的代理log
     */
    final class FeignLog extends Logger {
        private org.slf4j.Logger logger;

        public FeignLog(Class<?> clazz) {
            logger = LoggerFactory.getLogger(clazz);
        }

        @Override
        protected void log(String configKey, String format, Object... args) {
            logger.info(String.format(methodTag(configKey) + format, args));
        }
    }

}