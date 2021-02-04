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
package com.webank.ai.fate.board.utils;

import com.webank.ai.fate.board.global.Dict;
import org.springframework.boot.system.ApplicationHome;

import java.io.File;
import java.util.List;
import java.util.Map;

public class LogHandle {

    public static List<Map> handleLog(List<Map> result) {
        ApplicationHome h = new ApplicationHome(LogHandle.class);
        File jarF = h.getSource();
        String boardPath = jarF.getParentFile().toString();
        int fateboard = boardPath.lastIndexOf("fateboard");
        String fateRule = boardPath.substring(0, fateboard);
        String tmpRule= "/tmp/";
        String ipRule = "(127\\.0)|(10\\.\\d{1,3})|(172\\.((1[6-9])|(2\\d)|(3[01])))|(192\\.168)";

        for (Map stringObjectMap : result) {
            Object o = stringObjectMap.get(Dict.LOG_CONTENT);
            String log = (String) o;
            String fatePath = log.replaceAll(fateRule, "./fate/");
            String tmpPath = fatePath.replaceAll(tmpRule, "./");

            String finalLog = tmpPath.replaceAll(ipRule, "xxx.xxx");
            stringObjectMap.put(Dict.LOG_CONTENT, finalLog);

        }
        return result;
    }

    //replace ip and address in logs for security
    public static String handleLog(String log) {
        ApplicationHome h = new ApplicationHome(LogHandle.class);
        File jarF = h.getSource();
        String boardPath = jarF.getParentFile().toString();
        int fateboard = boardPath.lastIndexOf("fateboard");
        String fateRule = boardPath.substring(0, fateboard);
        String tmpRule= "/tmp/";
//        String ipRule = "(127\\.0)|(10\\.\\d{1,3})|(172\\.((1[6-9])|(2\\d)|(3[01])))|(192\\.168)";
        String ipRule = "(10\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})|(172\\.((1[6-9])|(2\\d)|(3[01]))\\.\\d{1,3}\\.\\d{1,3})|(192\\.168\\.\\d{1,3}\\.\\d{1,3})";

        String fatePath = log.replaceAll(fateRule, "./fate/");
        String tempPath = fatePath.replaceAll(tmpRule, "./");

        String finalLog = tempPath.replaceAll(ipRule, "xxx.xxx");

        return finalLog;
    }
}
