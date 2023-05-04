package com.webank.ai.fate.board.conf;

import com.alibaba.fastjson.JSON;
import com.webank.ai.fate.board.global.ErrorCode;
import com.webank.ai.fate.board.global.ResponseResult;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.core.annotation.Order;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.websocket.server.HandshakeRequest;
import java.io.IOException;

@Slf4j
@Order(1)
@WebFilter(filterName = "websocketFilter", urlPatterns = {"/websocket/progress/*","/log/new/*"})
public class WebsocketFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse resp = (HttpServletResponse) response;
        HttpServletRequest req = (HttpServletRequest) request;

        HttpSession session = req.getSession(false);
        if (session == null) {
            resp.getWriter().write(JSON.toJSONString(new ResponseResult<>(ErrorCode.LOGIN_ERROR)));
            return ;
        }
        Object user = session.getAttribute("USER");
        if (user == null) {
            resp.getWriter().write(JSON.toJSONString(new ResponseResult<>(ErrorCode.LOGIN_ERROR)));
            return ;
        }

        chain.doFilter(request, response);
    }

}