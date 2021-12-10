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
package com.webank.ai.fate.board.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlowTaskDO implements Serializable {
    private Integer page;
    private Integer limit;

    private String job_id;

    private Long task_set_id;

    private String component_name;

    private String task_id;

    private Long task_version;

    private String initiator_role;

    private String initiator_party_id;

    private String status;

    private Long status_level;

    private String role;

    private String party_id;

    private String run_ip;

    private Integer run_pid;

    private String party_status;

//    private Long fPartyStatusLevel;

    private Long create_time;

    private Long update_time;

    private Long start_time;

    private Long end_time;

    private Long elapsed;
}
