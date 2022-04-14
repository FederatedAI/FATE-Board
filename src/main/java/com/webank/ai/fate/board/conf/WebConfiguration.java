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
package com.webank.ai.fate.board.conf;

import com.alibaba.fastjson.support.spring.FastJsonHttpMessageConverter;
import com.webank.ai.fate.board.intercept.UserInterceptor;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

import javax.sql.DataSource;
import java.util.List;
import java.util.concurrent.ThreadPoolExecutor;

import org.springframework.boot.autoconfigure.http.HttpMessageConverters;



@Configuration
//@MapperScan(basePackages = "com.webank.ai.fate.board.dao", sqlSessionFactoryRef = "fateboardSqlSessionFactory")
public class WebConfiguration implements WebMvcConfigurer {

//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        registry.addMapping("/**").allowedMethods("*").allowedOrigins("*").allowCredentials(true);
//    }

//    @Bean("fateboardDataSource")
//    @ConfigurationProperties(prefix = "fateboard.datasource")
//    public DataSource fateboardDataSource() {
//        return DataSourceBuilder.create().build();
//    }
//
//    @Bean("fateboardSqlSessionFactory")
//    public SqlSessionFactory sqlSessionFactory(@Qualifier("fateboardDataSource") DataSource dataSource) throws Exception {
//        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
//        sessionFactory.setDataSource(dataSource);
//        //sessionFactory.setTypeAliasesPackage(env.getProperty("mybatis.typeAliasesPackage"));
//        sessionFactory.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("fate/fateboard/mapping/*"));
//        return sessionFactory.getObject();
//    }


    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }

    @Bean(name = "asyncServiceExecutor")
    public ThreadPoolTaskExecutor asyncServiceExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(200);
        executor.setMaxPoolSize(200);
        executor.setQueueCapacity(10);
        executor.setThreadNamePrefix("asyncServiceExecutor");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    @Bean
    public UserInterceptor getUserInterceptor() {
        return new UserInterceptor();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(getUserInterceptor())
                .addPathPatterns("/job/**")
                .addPathPatterns("/v1/**");
//                .addPathPatterns("/**").excludePathPatterns("/static/*").excludePathPatterns("user/login","/user/logout");
    }

}
