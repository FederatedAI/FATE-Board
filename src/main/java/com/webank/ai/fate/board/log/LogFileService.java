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
import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.jcraft.jsch.Channel;
import com.jcraft.jsch.Session;
import com.webank.ai.fate.board.dao.TaskMapper;
import com.webank.ai.fate.board.pojo.JobWithBLOBs;
import com.webank.ai.fate.board.pojo.SshInfo;
import com.webank.ai.fate.board.pojo.Task;
import com.webank.ai.fate.board.pojo.TaskExample;
import com.webank.ai.fate.board.services.JobManagerService;
import com.webank.ai.fate.board.ssh.SshService;
import com.webank.ai.fate.board.utils.Dict;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.List;
import java.util.Map;


@Service
//public class LogFileService implements InitializingBean {
public class LogFileService {

    final static String TASK_LOG_PATH = "$job_id/$role/$party_id/$component_id/$file_name";
    final static String DEFAULT_FILE_NAME = "INFO.log";
    final static String DEFAULT_COMPONENT_ID = "default";
    final static String DEFAULT_LOG_TYPE = "default";
    String JOB_LOG_PATH = "$job_id/$role/$party_id/$file_name";
//    @Value("${FATE_DEPLOY_PREFIX:/data/projects/fate/python/logs/}")
    @Value("${FATE_DEPLOY_PREFIX:C:\\Users\\v_wbymxu\\Downloads\\}")
    String FATE_DEPLOY_PREFIX;

    @Autowired
    SshService sshService;
    Logger logger = LoggerFactory.getLogger(LogFileService.class);
    @Autowired
    private JobManagerService jobManagerService;
    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;
    @Autowired
    private TaskMapper taskMapper;

    public static String toJsonString(String content,
                                      long bytesize,
                                      long lineNum
    ) {
        Map logInfo = Maps.newHashMap();
        logInfo.put(Dict.LOG_CONTENT, content);
        logInfo.put(Dict.LOG_LINE_NUM, lineNum);
        return JSON.toJSONString(logInfo);
    }


    public static Map<String,Object> toLogMap(String content, long lineNum) {
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

    public String getJobDir(String jobId) {

        return FATE_DEPLOY_PREFIX + jobId + "/";

    }

    public boolean checkPathParameters(String... parameters) {
        String regex = "^\\w+$";
        for (String parameter : parameters) {
            if (!parameter.matches(regex)) {
                return false;
            }
        }
        return true;
    }

    public String buildFilePath(String jobId, String componentId, String type, String role, String partyId) {

        Preconditions.checkArgument(StringUtils.isNoneEmpty(jobId, componentId, type, role, partyId));
        Preconditions.checkArgument(checkPathParameters(jobId, componentId, type, role, partyId));
        String filePath = "";
        if (componentId == null || componentId.equals(DEFAULT_COMPONENT_ID)) {

            filePath = JOB_LOG_PATH.replace("$job_id", jobId).replace("$role", role).replace("$party_id", partyId);

        } else {
            filePath = TASK_LOG_PATH.replace("$job_id", jobId).replace("$component_id", componentId).replace("$role", role).replace("$party_id", partyId);
        }

        if (type.equals(DEFAULT_LOG_TYPE)) {
            filePath = filePath.replace("$file_name", DEFAULT_FILE_NAME);
        } else {

            switch (type) {
                case "error":
                    filePath = filePath.replace("$file_name", "ERROR.log");
                    break;
                case "debug":
                    filePath = filePath.replace("$file_name", "DEBUG.log");
                    break;
                case "info":
                    filePath = filePath.replace("$file_name", "INFO.log");
                    break;
                case "warning":
                    filePath = filePath.replace("$file_name", "WARNING.log");
                    break;
                default:
                    filePath = filePath.replace("$file_name", "INFO.log");
            }

        }
        if ("fateFlow".equals(role)) {
            if ("error".equals(type)) {
                filePath = jobId + "/" + "error.log";
            } else {
                filePath = jobId + "/" + "fate_flow_schedule.log";
            }
        }
        String result = FATE_DEPLOY_PREFIX + filePath;
        logger.info("build filePath result {}", result);
        return result;
    }

    public String buildLogPath(String jobId, String role, String partyId, String componentId, String type) {
        Preconditions.checkArgument(StringUtils.isNoneEmpty(jobId, role, partyId, componentId, type));
        Preconditions.checkArgument(checkPathParameters(jobId, role, partyId, componentId, type));
        String logRelativePath;
        if (Dict.DEFAULT.equals(role)) {
//            switch (type) {
//                case "error":
//                    logRelativePath = jobId + "/" + "error.log";
//                    break;
//                default:
//                    logRelativePath = jobId + "/" + "fate_flow_schedule.log";
//            }
            logRelativePath = jobId + "/" + type+".log";
        } else {
            if (Dict.DEFAULT.equals(componentId)) {
//                switch (type) {
//                    case "error":
//                        logRelativePath = jobId + "/" + role + "/" + partyId + "/" + "ERROR.log";
//                        break;
//                    case "warning":
//                        logRelativePath = jobId + "/" + role + "/" + partyId + "/" + "WARNING.log";
//                        break;
//                    case "info":
//                        logRelativePath = jobId + "/" + role + "/" + partyId + "/" + "INFO.log";
//                        break;
//                    default:
//                        logRelativePath = jobId + "/" + role + "/" + partyId + "/" + "DEBUG.log";
//                }
                logRelativePath = jobId + "/" + role + "/" + partyId + "/" + type+".log";
            } else {
                logRelativePath = jobId + "/" + role + "/" + partyId + "/" + componentId + type+".log";
            }
        }
        String logPath = FATE_DEPLOY_PREFIX + logRelativePath;
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


    public List<Map> getRemoteLogWithFixSize(String jobId, String componentId, String type, String role, String partyId, int begin, int count) throws Exception {
        List<Map> results = Lists.newArrayList();
        JobTaskInfo jobTaskInfo = this.getJobTaskInfo(jobId, componentId, role, partyId);
        SshInfo sshInfo = this.sshService.getSSHInfo(jobTaskInfo.ip);
        String filePath = this.buildFilePath(jobId, componentId, type, role, partyId);
        Session session = this.sshService.connect(sshInfo);
        Channel channel = this.sshService.executeCmd(session, "tail -n +" + begin + " " + filePath + " | head -n " + count);

        InputStream inputStream = channel.getInputStream();
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        try {

            String content = null;
            int index = 0;
            do {
                content = reader.readLine();
                if (content != null) {
                    results.add(LogFileService.toLogMap(content, begin + index));
                }
                index++;

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

    public List<Map> getRemoteFuzzyLog(String filePath, String ip, String condition, Integer begin, Integer end) throws Exception {
        List<Map> results = Lists.newArrayList();
//        JobTaskInfo jobTaskInfo = this.getJobTaskInfo(jobId, componentId, role, partyId);
        SshInfo sshInfo = this.sshService.getSSHInfo(ip);
//        String filePath = this.buildFilePath(jobId, componentId, type, role, partyId);
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

    public Channel getRemoteLogStream(String jobId, String componentId, String role, String partyId, String cmd) throws Exception {
        JobTaskInfo jobTaskInfo = this.getJobTaskInfo(jobId, componentId, role, partyId);
        Preconditions.checkArgument(StringUtils.isNotEmpty(jobTaskInfo.ip), "remote ip is null");
        SshInfo sshInfo = this.sshService.getSSHInfo(jobTaskInfo.ip);
        return getRemoteLogStream(sshInfo, cmd);
    }

    public Channel getRemoteLogStream(SshInfo sshInfo, String cmd) throws Exception {
        Preconditions.checkArgument(sshInfo != null, "remote ssh info is null");
        Preconditions.checkArgument(cmd != null);
        Session session = this.sshService.connect(sshInfo);
        Channel channel = this.sshService.executeCmd(session, cmd);
        return channel;
    }

    public Channel getRemoteLogStream(String jobId, String componentId, String type, String role, String partyId, int endNum) throws Exception {
        String filePath = this.buildFilePath(jobId, componentId, type, role, partyId);
        String cmd = this.buildCommand(endNum, filePath);
        Channel channel = getRemoteLogStream(jobId, componentId, role, partyId, cmd);
        return channel;
    }

    public String buildCommand(int endNum, String filePath) {
        Preconditions.checkArgument(filePath != null && !filePath.equals(""));
        String command = "tail " + " -n +" + (endNum + 1) + "  " + filePath;
        return command;
    }

    public JobTaskInfo getJobTaskInfo(String jobId, String componentId, String role, String partyId) {

        JobTaskInfo jobTaskInfo = new JobTaskInfo();

        jobTaskInfo.jobId = jobId;

        jobTaskInfo.componentId = componentId;

        JobWithBLOBs jobWithBLOBs = jobManagerService.queryJobByConditions(jobId, role, partyId);

        Preconditions.checkArgument(jobWithBLOBs != null, "job info " + jobId + " is not exist");

        String ip = jobWithBLOBs.getfRunIp();
        Preconditions.checkArgument(StringUtils.isNoneEmpty(ip));
        String[] splits = ip.split(":");
        ip = splits[0];

        jobTaskInfo.jobStatus = jobWithBLOBs.getfStatus();

        if (componentId != null && !componentId.equals(DEFAULT_COMPONENT_ID)) {

            TaskExample taskExample = new TaskExample();

            taskExample.createCriteria().andFJobIdEqualTo(jobId).andFComponentNameEqualTo(componentId).andFRoleEqualTo(role).andFPartyIdEqualTo(partyId);

            List<Task> tasks = taskMapper.selectByExample(taskExample);

            Preconditions.checkArgument(tasks != null && tasks.size() > 0, "task info " + jobId + "," + componentId + " is not exist");

            Task task = tasks.get(0);

            ip = task.getfRunIp();
            logger.info("task ip:{}", ip);

            jobTaskInfo.taskStatus = task.getfStatus();

        }
        logger.info("ssh ip:{}", ip);
        jobTaskInfo.ip = ip;
        return jobTaskInfo;
    }

    public String getJobIp(String jobId, String role, String partyId) {
        JobWithBLOBs jobWithBLOBs = jobManagerService.queryJobByConditions(jobId, role, partyId);
        Preconditions.checkArgument(jobWithBLOBs != null, "job " + jobId + "-" + role + "-" + partyId + "  does not exist");
        String ips = jobWithBLOBs.getfRunIp();
        Preconditions.checkArgument(StringUtils.isNoneEmpty(ips));
        String[] splits = ips.split(":");
        return splits[0];
    }

//    @Override
//    public void afterPropertiesSet() throws Exception {
//
//        String systemDeloyPrefix = System.getProperty("FATE_DEPLOY_PREFIX");
//
//        if (systemDeloyPrefix != null && systemDeloyPrefix.length() != 0) {
//            FATE_DEPLOY_PREFIX = System.getProperty("FATE_DEPLOY_PREFIX");
//        }
//    }

    public long queryFuzzyLogSize(String componentId, String jobId, String type, String role, String partyId, String condition) throws Exception {
        String filePath = this.buildFilePath(jobId, componentId, type, role, partyId);
        Preconditions.checkArgument(StringUtils.isNoneEmpty(condition, filePath));
        long size;
        if (LogFileService.checkFileIsExist(filePath)) {
            String[] cmd = {"sh", "-c", "grep -c " + condition + " " + filePath};
            Process process = Runtime.getRuntime().exec(cmd);
            InputStream inputStream = process.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
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
                    process.destroyForcibly();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            return size;
        } else {
            String ip = this.getJobTaskInfo(jobId, componentId, role, partyId).ip;
            if (StringUtils.isEmpty(ip)) {
                return 0;
            }
            this.checkSshInfo(ip);
            size = this.getRemoteFuzzyLogSize(filePath, ip, condition);
            return size;

        }
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
