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

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.webank.ai.fate.board.global.ErrorCode;
import com.webank.ai.fate.board.global.ResponseResult;
import com.webank.ai.fate.board.log.LogFileService;
import com.webank.ai.fate.board.pojo.FuzzyLogQO;
import com.webank.ai.fate.board.pojo.SshInfo;
import com.webank.ai.fate.board.ssh.SshService;
import com.webank.ai.fate.board.utils.GetSystemInfo;
import com.webank.ai.fate.board.utils.LogHandle;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.xml.ws.Response;
import java.io.*;
import java.util.List;
import java.util.Map;


@Controller
public class LogController {
    private final Logger logger = LoggerFactory.getLogger(LogController.class);
    @Autowired
    LogFileService logFileService;
    @Autowired
    SshService sshService;

//    @Autowired
//    LogHandle logHandle;

    @RequestMapping(value = "/queryLogWithSizeSSH/{jobId}/{role}/{partyId}/{componentId}/{type}/{begin}/{end}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseResult queryLogWithSizeSSH(@PathVariable String componentId,
                                              @PathVariable String jobId,
                                              @PathVariable Integer begin,
                                              @PathVariable String role,
                                              @PathVariable String partyId,
                                              @PathVariable String type,
                                              @PathVariable Integer end) throws Exception {
        logger.info("parameters for " + "componentId:" + componentId + ", jobId:" + jobId + ", begin;" + begin + ", end:" + end + "type");

        String filePath = logFileService.buildFilePath(jobId, componentId, type, role, partyId);

        Preconditions.checkArgument(filePath != null && !filePath.equals(""));

        String ip = logFileService.getJobTaskInfo(jobId, componentId, role, partyId).ip;

        Preconditions.checkArgument(ip != null && !ip.equals(""));

        List<Map> logs = logFileService.getRemoteLogWithFixSize(jobId, componentId, type, role, partyId, begin, end - begin + 1);

        ResponseResult result = new ResponseResult();

        result.setData(logs);

        return result;

    }

    @RequestMapping(value = "/queryLogSize/{jobId}/{role}/{partyId}/{componentId}/{type}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseResult queryLogSize(@PathVariable String componentId,
                                       @PathVariable String jobId,
                                       @PathVariable String type,
                                       @PathVariable String role,
                                       @PathVariable String partyId
    ) {

        ResponseResult responseResult = new ResponseResult(ErrorCode.SUCCESS);

        try {
            String filePath = logFileService.buildFilePath(jobId, componentId, type, role, partyId);
            Preconditions.checkArgument(StringUtils.isNotEmpty(filePath));
            if (LogFileService.checkFileIsExist(filePath)) {
                Integer count = LogFileService.getLocalFileLineCount(new File(filePath));
                responseResult.setData(count);

            } else {
                String ip = logFileService.getJobTaskInfo(jobId, componentId, role, partyId).ip;
                String localIp = GetSystemInfo.getLocalIp();
//                if (logger.isDebugEnabled()) {
//                    logger.debug("local ip {} remote ip {}", localIp, ip);
//                }
                if (localIp.equals(ip) || "0.0.0.0".equals(ip) || "127.0.0.1".equals(ip)) {
                    responseResult.setData(0);
                    return responseResult;
                }
                logFileService.checkSshInfo(ip);
                SshInfo sshInfo = this.sshService.getSSHInfo(ip);

                Integer count = logFileService.getRemoteFileLineCount(sshInfo, filePath);
                responseResult.setData(count);

            }
        } catch (Exception e) {
            logger.error("query log size error", e);
            responseResult.setData(0);
        }

        return responseResult;
    }

    public long getLineNumber(File file) {
        if (file.exists()) {
            try {
                FileReader fileReader = new FileReader(file);
                LineNumberReader lineNumberReader = new LineNumberReader(fileReader);
                lineNumberReader.skip(Long.MAX_VALUE);
                long lines = lineNumberReader.getLineNumber() + 1;
                fileReader.close();
                lineNumberReader.close();
                return lines;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return 0;
    }

    List<Map> queryLog(String componentId, String jobId, String type, String role, String partyId,
                       Integer begin,
                       Integer end) throws Exception {
        String filePath = logFileService.buildFilePath(jobId, componentId, type, role, partyId);
        Preconditions.checkArgument(filePath != null && !filePath.equals(""));
        if (LogFileService.checkFileIsExist(filePath)) {
            RandomAccessFile file = null;
            List<Map> result = Lists.newArrayList();
            if (begin > end || begin <= 0) {
                throw new Exception();
            }
            String[] cmd = {"sh", "-c", "tail -n +" + begin + " " + filePath + " | head -n " + (end - begin + 1)};
            Process process = Runtime.getRuntime().exec(cmd);
            InputStream inputStream = process.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            try {
                String content = null;
                int index = 0;
                do {
                    content = reader.readLine();
                    if (content != null) {
                        result.add(LogFileService.toLogMap(content, begin + index));
                    }
                    index++;
                } while (content != null);
                if (logger.isDebugEnabled()) {
                    logger.debug("execute  cmd {} return count {}", cmd, index);
                }
            } finally {
                try {
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                try {
                    inputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                try {
                    process.destroyForcibly();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            List<Map> maps = LogHandle.handleLog(result);
            return maps;
        } else {
            String ip = logFileService.getJobTaskInfo(jobId, componentId, role, partyId).ip;
            logFileService.checkSshInfo(ip);
            if (StringUtils.isEmpty(ip)) {
                return null;
            }
            List<Map> logs = logFileService.getRemoteLogWithFixSize(jobId, componentId, type, role, partyId, begin, end - begin + 1);
            List<Map> maps = LogHandle.handleLog(logs);
            return maps;

        }

    }

    private List<Map> queryFuzzyLog(String componentId, String jobId, String type, String role, String partyId, String condition, Integer begin, Integer end) throws Exception {
        String filePath = logFileService.buildFilePath(jobId, componentId, type, role, partyId);
//        Preconditions.checkArgument(filePath != null && 0!=filePath.trim().length());
        Preconditions.checkArgument(StringUtils.isNoneEmpty(condition, filePath));
        Preconditions.checkArgument(begin != null && end != null);
        Preconditions.checkArgument(end > begin && begin > 0);

        if (LogFileService.checkFileIsExist(filePath)) {
            List<Map> result = Lists.newArrayList();

            String[] cmd = {"sh", "-c", "grep -n " + condition + " " + filePath + " | tail -n +" + begin + " | head -n " + (end - begin + 1)};
            Process process = Runtime.getRuntime().exec(cmd);
            InputStream inputStream = process.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            try {
                String content = null;
                do {
                    content = reader.readLine();
                    if (content != null) {
                        int i = content.indexOf(":");
                        String lineNumber = content.substring(0, i);
                        String lineContent = content.substring(i + 1);
                        result.add(LogFileService.toLogMap(lineContent, Long.parseLong(lineNumber)));
                    }
                } while (content != null);
                logger.info("execute  cmd : {} ", (Object) cmd);
            } finally {
                try {
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                try {
                    inputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                try {
                    process.destroyForcibly();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            return result;
        } else {
            String ip = logFileService.getJobTaskInfo(jobId, componentId, role, partyId).ip;
            if (StringUtils.isEmpty(ip)) {
                return null;
            }
            logFileService.checkSshInfo(ip);
            List<Map> remoteFuzzyLog = logFileService.getRemoteFuzzyLog(filePath, ip, condition, begin, end);
            return remoteFuzzyLog;

        }

    }

    @RequestMapping(value = "/queryLogWithSize/{jobId}/{role}/{partyId}/{componentId}/{type}/{begin}/{end}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseResult queryLogWithSize(@PathVariable String componentId,
                                           @PathVariable String jobId,
                                           @PathVariable String type,
                                           @PathVariable String role,
                                           @PathVariable String partyId,
                                           @PathVariable Integer begin,
                                           @PathVariable Integer end) throws Exception {

        logger.info("parameters for " + "componentId:" + componentId + ", jobId:" + jobId + ", begin;" + begin + ", end:" + end);

        List<Map> result = this.queryLog(componentId, jobId, type, role, partyId, begin, end);

        return new ResponseResult<>(ErrorCode.SUCCESS, result);
    }

    @RequestMapping(value = "/queryFuzzyLog", method = RequestMethod.POST)
    @ResponseBody
    public ResponseResult queryFuzzyLog(@RequestBody FuzzyLogQO fuzzyLogQO) throws Exception {
        logger.info("RequestBody: queryFuzzyLog  {}", fuzzyLogQO);
        List<Map> result = this.queryFuzzyLog(fuzzyLogQO.getComponentId(), fuzzyLogQO.getJobId(), fuzzyLogQO.getType(), fuzzyLogQO.getRole(), fuzzyLogQO.getPartyId(), fuzzyLogQO.getCondition(), fuzzyLogQO.getBegin(), fuzzyLogQO.getEnd());
        return new ResponseResult<>(ErrorCode.SUCCESS, result);
    }

    @RequestMapping(value = "/queryFuzzyLogSize", method = RequestMethod.POST)
    @ResponseBody
    public ResponseResult queryFuzzyLogSize(@RequestBody FuzzyLogQO fuzzyLogQO) throws Exception {
        logger.info("RequestBody: queryFuzzyLogSize {}", fuzzyLogQO);
        long size = logFileService.queryFuzzyLogSize(fuzzyLogQO.getComponentId(), fuzzyLogQO.getJobId(), fuzzyLogQO.getType(), fuzzyLogQO.getRole(), fuzzyLogQO.getPartyId(), fuzzyLogQO.getCondition());
        return new ResponseResult<>(ErrorCode.SUCCESS, size);
    }

}
