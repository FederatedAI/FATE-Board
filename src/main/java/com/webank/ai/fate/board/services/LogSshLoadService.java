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
package com.webank.ai.fate.board.services;

import com.google.common.base.Preconditions;
import com.webank.ai.fate.board.dao.JobMapper;
import com.webank.ai.fate.board.disruptor.LogFileTransferEventProducer;
import com.webank.ai.fate.board.log.LogFileService;
import com.webank.ai.fate.board.pojo.JobDO;
import com.webank.ai.fate.board.pojo.JobExample;
import com.webank.ai.fate.board.pojo.JobWithBLOBs;
import com.webank.ai.fate.board.pojo.SshInfo;
import com.webank.ai.fate.board.ssh.SshService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.List;

//@Service
public class LogSshLoadService {

//    @Autowired
//    JobMapper jobMapper;
//
//    @Autowired
//    LogFileService logFileService;
//
//    @Autowired
//    SshService sshService;
//
//    @Autowired
//    LogFileTransferEventProducer logFileTransferEventProducer;
//
//
//    private List<JobDO> queryJobSuccessToday() {
//        long timeStampNow = System.currentTimeMillis();
//        long timeTodayStart = timeStampNow / (24 * 60 * 60 * 1000) * (24 * 60 * 60 * 1000) - 8 * 60 * 60 * 1000;
//
//
//        return jobMapper.queryTodayCompletedJobs(timeTodayStart,timeStampNow);
//    }


}
