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
package org.fedai.fate.board.controller;


import org.fedai.fate.board.global.ErrorCode;
import org.fedai.fate.board.global.ResponseResult;
import org.fedai.fate.board.pojo.UserDTO;
import org.fedai.fate.board.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;


@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    UserService userService;

    @RequestMapping(value = "/getKey", method = RequestMethod.POST)
    public ResponseResult<String> getPublicKey() {
        try {
            return new ResponseResult<>(userService.getCurrentPublicKey());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error(ErrorCode.SYSTEM_ERROR.getCode(), "generate key failed");
        }
    }

    @RequestMapping(value = "/login", method = RequestMethod.POST)
    public ResponseResult login(@RequestBody @Valid UserDTO userDTO, BindingResult bindingResult, HttpServletRequest httpServletRequest) {
        if (bindingResult.hasErrors()) {
            FieldError errors = bindingResult.getFieldError();
            return new ResponseResult(ErrorCode.ERROR_PARAMETER, errors.getDefaultMessage());
        }

        boolean result = userService.login(userDTO, httpServletRequest);

        if (result) {
            return new ResponseResult(ErrorCode.SUCCESS,true);
        } else {
            return new ResponseResult(ErrorCode.SUCCESS,false);
        }
    }

    @RequestMapping(value = "/logout", method = RequestMethod.POST)
    public ResponseResult logout(HttpServletRequest httpServletRequest) {
        userService.logout(httpServletRequest);
        return new ResponseResult(ErrorCode.SUCCESS);
    }
}
