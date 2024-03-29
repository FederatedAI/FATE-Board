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
package org.fedai.fate.board.global;


import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

public class Dict {

    static public final String STATUS_JOB_WAITING = "waiting";
    static public final String STATUS_JOB_RUNNING = "running";

    static public final String ID = "id";
    static public final String NAME = "name";
    static public final String JOBID = "job_id";
    static public final String LOG_TYPE = "log_type";
    static public final String CODE = "code";
    static public final String DATA = "data";
    static public final String DATA_VIEW = "data_view";
    static public final String DATA_SET = "dataset";
    static public final String OUTPUT_DATA = "output_data";
    static public final String DATA_COUNT = "total";
    static public final String JOB = "job";
    static public final String DATASET = "dataset";
    static public final String COMPONENT_NAME = "component_name";
    static public final String TASK_NAME = "task_name";
    static public final String TASK_ID = "task_id";
    static public final String COMPONENT_PARAMETERS = "component_parameters";
    static public final String INSTANCE_ID = "instance_id";
    static public final String BEGIN = "begin";
    static public final String END = "end";
    static public final String ROLE = "role";
    static public final String PARTY_ID = "party_id";
    static public final String RETMSG = "message";
    static public final String NOTES = "notes";
    static public final String DESCRIPTION = "description";
    static public final String LIMIT = "limit";
    static public final String PAGE = "page";
    static public final String ORDER = "order";
    static public final String ORDER_BY = "order_by";
    static public final String COUNT = "count";
    static public final String PARTNER = "partner";


    static public final String DEPENDENCY_DATA = "dependency_data";
    static public final String SUMMARY_DATA = "summary_date";

    static public final String METRIC_NAMESPACE = "metric_namespace";
    static public final String METRIC_NAME = "metric_name";
    static public final String STATUS = "status";
    static public final String COMPONENT_LIST = "component_list";
    static public final String COMPONENT_NEED_RUN = "component_need_run";
    static public final String COMPONENT_DEPENDENCIES = "dependencies";

    static public final String SSH_CONFIG_FILE = "ssh_config_file";
    static public final String LOG_LINE_NUM = "line_num";
    static public final String LOG_CONTENT = "content";
    static public final String JOB_PROCESS = "process";
    static public final String JOB_DURATION = "duration";
    static public final String JOB_STATUS = "status";

    static public final String URL_COPONENT_METRIC_DATA = "/v2/output/metric/key/query";
    static public final String URL_COPONENT_METRIC = "/v2/output/metric/query";
    static public final String URL_COPONENT_PARAMETERS = "/v2/output/metric/key/query";
    static public final String URL_OUTPUT_MODEL = "/v2/output/model/query";
    static public final String URL_OUTPUT_DATA = "/v2/output/data/display";

    static public final String URL_JOB_STOP = "/v2/job/stop";
    static public final String URL_JOB_QUERY_LIST = "/v2/job/list/query";

    static public final String URL_JOB_QUERY = "/v2/job/query";
    static public final String URL_JOB_DATA_VIEW = "/v2/job/data/view";
    static public final String URL_JOB_UPDATE = "/v2/job/notes/add";
    static public final String URL_JOB_RERUN = "/v2/job/rerun";
    static public final String URL_DAG_DEPENDENCY = "/v2/job/dag/dependency";
    static public final String URL_TASK_QUERY = "/v2/job/task/list/query";
    static public final String URL_TASK_DATAVIEW = "/v2/job/task/query";

    static public final String URL_JOB_LOG_PATH = "/v1/job/log/path";
    static public final String URL_LOG_SIZE = "/v1/log/size";
    static public final String URL_LOG_CAT = "/v1/log/cat";

    static public final String URL_CONFIG_CAT = "/v1/job/config";

    static public final String URL_FLOW_INFO = "/v2/server/fateflow";

    static public final String ZK_DATA_HOST = "host";
    static public final String ZK_DATA_PORT = "http_port";

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
        logTypeMap.put("jobSchedule", "schedule_info");
        logTypeMap.put("jobError", "schedule_error");
        logTypeMap.put("partyError", "task_error");
        logTypeMap.put("partyWarning", "task_warning");
        logTypeMap.put("partyInfo", "task_info");
        logTypeMap.put("partyDebug", "task_debug");
        logTypeMap.put("componentInfo", "task_info");
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
