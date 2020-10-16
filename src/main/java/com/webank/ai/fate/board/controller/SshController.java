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
package com.webank.ai.fate.board.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;
import com.jcraft.jsch.Session;
import com.webank.ai.fate.board.global.ErrorCode;
import com.webank.ai.fate.board.global.ResponseResult;
import com.webank.ai.fate.board.pojo.SshDTO;
import com.webank.ai.fate.board.pojo.SshInfo;
import com.webank.ai.fate.board.ssh.SshService;
import com.webank.ai.fate.board.global.Dict;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

@Controller
//@RequestMapping(value = "/ssh")

public class SshController {
    private final static Logger logger = LoggerFactory.getLogger(SshController.class);

    @Autowired
    SshService sshService;

    @RequestMapping(value = "/all", method = RequestMethod.GET)
    public ResponseResult findAll() throws InterruptedException {

        Map<String, SshInfo> data = sshService.getAllsshInfo();

        CountDownLatch countDownLatch = new CountDownLatch(data.size());

        data.forEach((k, v) -> {
            new Thread(() -> {
                Session session;
                try {
                    session = sshService.connect(v, 1000);
                    if (session != null) {
                        v.setStatus("1");
                    } else {
                        v.setStatus("0");
                    }
                } catch (Exception e) {
                    v.setStatus("0");
                } finally {
                    countDownLatch.countDown();
                }
            }).start();
        });

        countDownLatch.await(8, TimeUnit.SECONDS);
        return new ResponseResult<>(ErrorCode.SUCCESS, data);
    }



    private String checkStatus(String ip) {
        String status = null;
        SshInfo sshInfo = sshService.getSSHInfo(ip);
        if (sshInfo == null) {
            return "0";
        }
        Session session = null;
        try {
            session = sshService.connect(sshInfo, 1000);
        } catch (Exception e) {
            e.printStackTrace();
            status = "0";
        }
        if (session != null) {
            status = "1";
        }
        return status;
    }


//    @RequestMapping(value = "/ssh", method = RequestMethod.GET)
    public ResponseResult readValue(@RequestBody String params) throws Exception {
        JSONObject jsonObject = JSON.parseObject(params);
        String ip = jsonObject.getString(Dict.SSH_IP);
        Preconditions.checkArgument(StringUtils.isNoneEmpty(ip));
        HashMap<Object, List> data = Maps.newHashMap();
        List<String> sshInformation = new LinkedList<>();

        return new ResponseResult<>(ErrorCode.SUCCESS, data);
    }

//    @RequestMapping(value = "/ssh", method = RequestMethod.DELETE)
    public ResponseResult removeValue(@RequestBody SshDTO sshDTO) throws IOException {
        Preconditions.checkArgument(StringUtils.isNoneEmpty(sshDTO.getIp()));
        sshService.getAllsshInfo().remove(sshDTO.getIp());
        sshService.flushToFile();
        return new ResponseResult(ErrorCode.SUCCESS);
    }



//    @RequestMapping(value = "/ssh", method = RequestMethod.POST)
    public ResponseResult addProperties(@RequestBody SshDTO sshDTO) {
        String ip = sshDTO.getIp();
        String port = sshDTO.getPort();
        String user = sshDTO.getUser();
        String password = sshDTO.getPassword();
        Preconditions.checkArgument(StringUtils.isNoneEmpty(ip, port, user, password));
        SshInfo sshInfo = new SshInfo();
        sshInfo.setIp(ip);
        sshInfo.setPort(new Integer(port));
        sshInfo.setUser(user);
        sshInfo.setPassword(password);
        sshService.addSShInfo(sshInfo);
        sshService.flushToFile();
        return new ResponseResult<>(ErrorCode.SUCCESS);
    }
}
