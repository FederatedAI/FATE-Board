package com.webank.ai.fate.board.conf;

import org.apache.tomcat.util.descriptor.web.SecurityCollection;
import org.apache.tomcat.util.descriptor.web.SecurityConstraint;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TomcatConfig {
    @Bean
    public TomcatServletWebServerFactory servletContainer() {
        TomcatServletWebServerFactory tomcatServletContainerFactory = new TomcatServletWebServerFactory();
        tomcatServletContainerFactory.addContextCustomizers(context -> {
            SecurityConstraint constraint = new SecurityConstraint();
            SecurityCollection collection = new SecurityCollection();
            collection.addMethod("OPTIONS");
            collection.addMethod("TRACE");
            collection.addPattern("/*");
            constraint.addCollection(collection);
            constraint.setAuthConstraint(true);
            context.addConstraint(constraint);
            context.setUseHttpOnly(true);
        });
        return tomcatServletContainerFactory;
    }
}