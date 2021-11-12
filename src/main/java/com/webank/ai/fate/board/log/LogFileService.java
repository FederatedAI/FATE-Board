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
package com.webank.ai.fate.board.log;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.jcraft.jsch.Channel;
import com.jcraft.jsch.Session;
import com.webank.ai.fate.board.dao.TaskMapper;
import com.webank.ai.fate.board.pojo.*;
import com.webank.ai.fate.board.services.JobManagerService;
import com.webank.ai.fate.board.ssh.SshService;
import com.webank.ai.fate.board.global.Dict;
import com.webank.ai.fate.board.utils.HttpClientPool;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.List;
import java.util.Map;


@Service
public class LogFileService {

    final static String DEFAULT_COMPONENT_ID = "default";

    @Autowired
    SshService sshService;
    Logger logger = LoggerFactory.getLogger(LogFileService.class);
    @Autowired
    JobManagerService jobManagerService;

    @Value("${fateflow.url}")
    String fateUrl;
    @Autowired
    HttpClientPool httpClientPool;

    public static String toJsonString(String content,
                                      long bytesize,
                                      long lineNum
    ) {
        Map logInfo = Maps.newHashMap();
        logInfo.put(Dict.LOG_CONTENT, content);
        logInfo.put(Dict.LOG_LINE_NUM, lineNum);
        return JSON.toJSONString(logInfo);
    }


    public static Map<String, Object> toLogMap(String content, long lineNum) {
        Map logInfo = Maps.newHashMap();
        logInfo.put(Dict.LOG_CONTENT, content);
        logInfo.put(Dict.LOG_LINE_NUM, lineNum);
        return logInfo;
    }


    public static int getLocalFileLineCount(File file) throws IOException {
        LineNumberReader lnr = new LineNumberReader(new FileReader(file));
        lnr.skip(Long.MAX_VALUE);
        int lineNo = lnr.getLineNumber();
        lnr.close();
        return lineNo;
    }

    public static boolean checkFileIsExist(String filePath) {

        File file = new File(filePath);
        return file.exists();
    }

    public String getJobDir(String jobId) throws Exception {
        return getLogPath(jobId) + "/";
    }

    public static boolean checkPathParameters(String... parameters) {

        String regex = "^[\\.0-9a-zA-Z\\-_]+$";
        for (String parameter : parameters) {
            if ("".equals(parameter)) {
                continue;
            }
            if (!parameter.matches(regex)) {
                return false;
            }
        }
        return true;
    }

    public static boolean checkParameters(String regex, String... parameters) {
        for (String parameter : parameters) {
            if ("".equals(parameter)) {
                continue;
            }
            if (!parameter.matches(regex)) {
                return false;
            }
        }
        return true;
    }

    public boolean checkPathParameters2(String... parameters) {
        String regex = "^[\\.0-9a-zA-Z_-\\u4e00-\\u9fa5]+$";
        for (String parameter : parameters) {
            if (!parameter.matches(regex)) {
                return false;
            }
        }
        return true;
    }


    public String buildFilePath(String jobId, String componentId, String type, String role, String partyId)
    throws Exception {

        Preconditions.checkArgument(StringUtils.isNoneEmpty(jobId, componentId, type, role, partyId));
        Preconditions.checkArgument(checkPathParameters(jobId, componentId, type, role, partyId));

        String filePath = "";
        if (DEFAULT_COMPONENT_ID.equals(componentId)) {

            filePath = jobId + "/" + role + "/" + partyId + "/" + type.toUpperCase();

        } else if ("fateFlow".equals(componentId)) {
            if ("error".equals(type)) {
                filePath = jobId + "/" + "fate_flow_schedule_error";
            } else {
                filePath = jobId + "/" + "fate_flow_schedule";
            }
        } else {
            filePath = jobId + "/" + role + "/" + partyId + "/" + componentId + "/" + "INFO";
        }

        String result = getLogPath(jobId) + filePath + ".log";
        logger.info("build filePath result {}", result);
        return result;
    }

    public String getLogPath(String jobId) throws Exception {
        String logPath = "";

        Map<String, Object> params = Maps.newHashMap();
        params.put(Dict.JOBID, jobId);
        String result;
        try {
            result = httpClientPool.post(fateUrl + Dict.URL_JOB_LOG_PATH, JSON.toJSONString(params));
        } catch (Exception e) {
            logger.error("connect fateflow error:", e);
            throw new Exception(e);
        }

        if (result != null && result.length() > 0) {
            JSONObject jsonObject = null;
            try {
                jsonObject = JSON.parseObject(result);
            } catch (Exception e) {
                e.printStackTrace();
            }
            if (jsonObject != null && !jsonObject.isEmpty()) {
                Integer retcode = jsonObject.getInteger(Dict.RETCODE);
                String retmsg = jsonObject.getString(Dict.RETMSG);
                if (retcode == 0) {
                    JSONObject data = jsonObject.getJSONObject(Dict.DATA);
                    logPath = data.getString("logs_directory");
                } else {
                    logger.error("fateflow error:", retmsg);
                }
            }
        }

        return logPath;
    }

    public String buildLogPath(String jobId, String role, String partyId, String componentId, String type)
    throws Exception {
        Preconditions.checkArgument(StringUtils.isNoneEmpty(jobId, role, partyId, componentId, type));
        Preconditions.checkArgument(checkPathParameters(jobId, role, partyId, componentId, type));

        String logRelativePath;
        switch (type) {
            case "jobSchedule":
            case "jobError":
                logRelativePath = "/";
                break;
            case "partyError":
            case "partyWarning":
            case "partyInfo":
            case "partyDebug":
                logRelativePath = "/" + role + "/" + partyId + "/";
                break;
            default:
                logRelativePath = "/" + role + "/" + partyId + "/" + componentId + "/";
        }

        String logPath = getLogPath(jobId) + logRelativePath + Dict.logMap.get(type);
        return logPath;
    }

    public Integer getRemoteFileLineCount(SshInfo sshInfo, String logFilePath) throws Exception {

        Preconditions.checkArgument(sshInfo != null && logFilePath != null && !"".equals(logFilePath));
        Channel wcChannel = null;
        BufferedReader reader = null;
        String lineString = null;
        Session session = sshService.connect(sshInfo);
        wcChannel = sshService.executeCmd(session, "wc -l " + logFilePath + "| awk '{print $1}'");
        try {
            InputStream in = wcChannel.getInputStream();
            reader = new BufferedReader(new InputStreamReader(in));
            lineString = reader.readLine();
        } finally {
            if (wcChannel != null) {
                wcChannel.disconnect();
            }
            if (reader != null) {
                reader.close();
            }
        }
        Preconditions.checkArgument(lineString != null, "file " + logFilePath + "is not exist in " + sshInfo.getIp());

        return new Integer(lineString);

    }

    public void checkSshInfo(String ip) throws Exception {
        SshInfo sshInfo = this.sshService.getSSHInfo(ip);
        if (sshInfo == null) {
            String sshConfigFilePath = System.getProperty(Dict.SSH_CONFIG_FILE);
            throw new Exception("ip " + ip + "ssh info is wrong, the path of ssh config file is" + sshConfigFilePath);
        }
    }


    public List<Map> getRemoteFuzzyLog(String filePath, String ip, String condition, Integer begin, Integer end) throws Exception {
        List<Map> results = Lists.newArrayList();
        SshInfo sshInfo = this.sshService.getSSHInfo(ip);
        Session session = this.sshService.connect(sshInfo);
        String cmd = "grep -n " + condition + " " + filePath + " | tail -n +" + begin + " | head -n " + (end - begin + 1);
        Channel channel = this.sshService.executeCmd(session, cmd);
        logger.info("cmd:{}", cmd);
        InputStream inputStream = channel.getInputStream();
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        try {
            String content = null;
            do {
                content = reader.readLine();
                if (content != null) {
                    int i = content.indexOf(":");
                    String lineNumber = content.substring(0, i);
                    String lineContent = content.substring(i + 1);
                    results.add(LogFileService.toLogMap(lineContent, Long.parseLong(lineNumber)));
                }
            } while (content != null);
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
                channel.disconnect();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return results;
    }


    public Channel getRemoteLogStream(SshInfo sshInfo, String cmd) throws Exception {
        Preconditions.checkArgument(sshInfo != null, "remote ssh info is null");
        Preconditions.checkArgument(cmd != null);
        Session session = this.sshService.connect(sshInfo);
        Channel channel = this.sshService.executeCmd(session, cmd);
        return channel;
    }


    public String buildCommand(int endNum, String filePath) {
        Preconditions.checkArgument(filePath != null && !filePath.equals(""));
        String command = "tail " + " -n +" + (endNum + 1) + "  " + filePath;
        return command;
    }


    public String getJobIp(String jobId, String role, String partyId) {
        JobDO jobWithBLOBs = jobManagerService.queryJobByConditions(jobId, role, partyId);
        Preconditions.checkArgument(jobWithBLOBs != null, "job " + jobId + "-" + role + "-" + partyId + "  does not exist");

        //todo
//        String ips = jobWithBLOBs.getfRunIp();
        String ips = "127.0.0.1";

        Preconditions.checkArgument(StringUtils.isNoneEmpty(ips));
        String[] splits = ips.split(":");
        return splits[0];
    }

    public String getJobStatus(String jobId, String role, String partyId) {
        JobDO jobWithBLOBs = jobManagerService.queryJobByConditions(jobId, role, partyId);
        Preconditions.checkArgument(jobWithBLOBs != null, "job " + jobId + "-" + role + "-" + partyId + "  does not exist");
        return jobWithBLOBs.getfStatus();
    }


    private long getRemoteFuzzyLogSize(String filePath, String ip, String condition) throws Exception {
        SshInfo sshInfo = this.sshService.getSSHInfo(ip);
        Session session = this.sshService.connect(sshInfo);
        String cmd = "grep -c " + condition + " " + filePath;
        Channel channel = this.sshService.executeCmd(session, cmd);
        logger.info("cmd:{}", cmd);
        InputStream inputStream = channel.getInputStream();
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        long size;
        try {
            String content = reader.readLine();
            size = Long.parseLong(content);
            logger.info("execute  cmd : {} ----result : {}", (Object) cmd, content);
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
                channel.disconnect();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return size;
    }

    public static class JobTaskInfo {
        public String jobStatus;
        public String taskStatus;
        public String ip;
        public String jobId;
        public String componentId;
    }
}
