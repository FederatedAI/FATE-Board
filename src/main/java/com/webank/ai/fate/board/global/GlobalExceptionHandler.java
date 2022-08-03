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
package com.webank.ai.fate.board.global;


import com.webank.ai.fate.board.exceptions.LogicException;
import feign.FeignException;
import org.apache.http.client.ClientProtocolException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import java.net.ConnectException;
import java.net.SocketException;
import java.sql.SQLIntegrityConstraintViolationException;


@RestControllerAdvice
public class GlobalExceptionHandler {
    Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Throwable.class)
    public ResponseResult defaultErrorHandler(HttpServletRequest req, Exception e) {

        logger.error("error ", e);
        if (e instanceof ServletException) {
            return new ResponseResult<>(ErrorCode.SERVLET_ERROR);
        } else if (e instanceof SQLIntegrityConstraintViolationException) {
            return new ResponseResult<>(ErrorCode.DATABASE_ERROR_CONNECTION);
        } else if (e instanceof SocketException || e instanceof ClientProtocolException) {
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
        } else {
            return new ResponseResult<>(ErrorCode.SYSTEM_ERROR);
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseResult handleParameters(HttpServletRequest req, IllegalArgumentException e) {
        logger.error("error ", e);
        return new ResponseResult<>(ErrorCode.ERROR_PARAMETER);
    }

    @ExceptionHandler(FeignException.class)
    public ResponseResult feignException(FeignException e) {
        logger.error("error ", e);
        return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
    }

    @ExceptionHandler(ConnectException.class)
    public ResponseResult connectException(ConnectException e) {
        logger.error("error ", e);
        return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_CONNECTION);
    }

    @ExceptionHandler(LogicException.class)
    public ResponseResult connectException(LogicException e) {
        logger.error("error ", e);
        return new ResponseResult<>(e.getCode(), e.getMessage());
    }
}