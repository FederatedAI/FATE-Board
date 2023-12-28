package org.fedai.fate.board.conf;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;


@Configuration
public class CaffeineCacheConfig {

    @Bean
    public Cache<String, Map<String,String>> caffeineCache() {
        return Caffeine.newBuilder()
                .build();
    }
}
