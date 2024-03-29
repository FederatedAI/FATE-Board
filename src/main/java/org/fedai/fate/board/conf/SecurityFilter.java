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
package org.fedai.fate.board.conf;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@WebFilter(urlPatterns={"/**"}, filterName="ClickHijackingFilter")
public class SecurityFilter implements Filter {
    @Value("${fateboard.front_end.cors}")
    private Boolean allowCORS;
    @Value("${fateboard.front_end.url}")
    private String frontEndUrl;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

        HttpServletResponse rep = (HttpServletResponse) servletResponse;
        rep.addHeader("X-Frame-Options", "DENY");

        if (allowCORS) {
            rep.addHeader("Access-Control-Allow-Origin", frontEndUrl);
            rep.addHeader("Access-Control-Allow-Credentials", "true");
            rep.addHeader("Access-Control-Allow-Headers", "Content-Type");
            rep.addHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, DELETE, CONNECT, PATCH");
        }

        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}