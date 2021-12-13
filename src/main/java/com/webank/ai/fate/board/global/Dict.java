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


import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import java.util.ArrayList;
import java.util.List;

public class Dict {

    static public final String ID = "id";
    static public final String NAME = "name";
    static public final String JOBID = "job_id";
    static public final String RETCODE = "retcode";
    static public final String DATA = "data";
    static public final String JOB = "job";
    static public final String DATASET = "dataset";
    static public final String COMPONENT_NAME = "component_name";
    static public final String ROLE = "role";
    static public final String PARTY_ID = "party_id";
    static public final String RETMSG = "retmsg";
    static public final String NOTES = "notes";

    static public final String DEPENDENCY_DATA = "dependency_data";
    static public final String SUMMARY_DATA = "summary_date";

    static public final String METRIC_NAMESPACE = "metric_namespace";
    static public final String METRIC_NAME = "metric_name";
    static public final String STATUS = "status";
    static public final String COMPONENT_LIST = "component_list";

    static public final String SSH_CONFIG_FILE = "ssh_config_file";
    static public final String LOG_LINE_NUM = "lineNum";
    static public final String LOG_CONTENT = "content";
    static public final String JOB_PROCESS = "process";
    static public final String JOB_DURATION = "duration";
    static public final String JOB_STATUS = "status";

    static public final String URL_COPONENT_METRIC_DATA = "/v1/tracking/component/metric_data";
    static public final String URL_COPONENT_METRIC = "/v1/tracking/component/metrics";
    static public final String URL_COPONENT_PARAMETERS = "/v1/tracking/component/parameters";
    static public final String URL_DAG_DEPENDENCY = "/v1/pipeline/dag/dependency";
    static public final String URL_OUTPUT_MODEL = "/v1/tracking/component/output/model";
    static public final String URL_OUTPUT_DATA = "/v1/tracking/component/output/data";
    static public final String URL_JOB_DATAVIEW = "/v1/tracking/job/data_view";
    static public final String URL_JOB_STOP = "/v1/job/stop";
    static public final String REMOTE_RETURN_MSG = "retmsg";
    static public final String URL_JOB_UPDATE = "/v1/job/update";
    static public final String URL_JOB_RERUN = "/v1/job/rerun";
    static public final String URL_JOB_LOG_PATH = "/v1/job/log/path";

    static public final String URL_JOB_QUERY = "/v1/job/list/job";
    static public final String URL_TASK_QUERY = "/v1/job/list/task";
    static public final String URL_LOG_SIZE = "/v1/log/size";
    static public final String URL_LOG_CAT = "/v1/log/cat";
    static public final String URL_CONFIG_CAT = "/v1//job/config";

    static public final String SSH_IP = "ip";
    static public final String SSH_USER = "user";
    static public final String SSH_PASSWORD = "password";
    static public final String SSH_PORT = "port";

    static public final String TIME = "time";

    static public final String TIMEOUT = "timeout";
    static public final String FAILED = "failed";

    //for build log path
    static public final String DEFAULT = "default";

    static public final HashMap<String, String> logMap = new HashMap<>();


    static {
        logMap.put("jobSchedule", "fate_flow_schedule.log");
        logMap.put("jobError", "fate_flow_schedule_error.log");
        logMap.put("partyError", "ERROR.log");
        logMap.put("partyWarning", "WARNING.log");
        logMap.put("partyInfo", "INFO.log");
        logMap.put("partyDebug", "DEBUG.log");
        logMap.put("componentInfo", "INFO.log");
    }
//前端传来的logType和flow的logType对应表
    static public final HashMap<String, String> logTypeMap = new HashMap<>();
    static {
        logTypeMap.put("jobSchedule", "jobSchedule");
        logTypeMap.put("jobError", "jobScheduleError");
        logTypeMap.put("partyError", "partyError");
        logTypeMap.put("partyWarning", "partyWarning");
        logTypeMap.put("partyInfo", "partyInfo");
        logTypeMap.put("partyDebug", "partyDebug");
        logTypeMap.put("componentInfo", "componentInfo");
    }

    //the fields for job search
    static public final HashMap<String, List<String>> fieldMap = new HashMap<>();

    static {
        List<String> status = Arrays.asList("success", "running", "waiting", "failed", "canceled");
        List<String> roles = Arrays.asList("guest", "host", "arbiter", "local");
        fieldMap.put("status", status);
        fieldMap.put("role", roles);
    }

    static public final List<String> JOB_FINISHED_STATUS = Arrays.asList("success", "timeout", "failed", "canceled");

    static public final List<String> ORDER_FIELDS =new ArrayList<>();
    static {
        ORDER_FIELDS.add("f_start_time");
        ORDER_FIELDS.add("f_end_time");
        ORDER_FIELDS.add("f_elapsed");
        ORDER_FIELDS.add("f_job_id");
    }

    static public final List<String> ORDER_RULES =new ArrayList<>();
    static {
        ORDER_RULES.add("desc");
        ORDER_RULES.add("asc");
    }

}
