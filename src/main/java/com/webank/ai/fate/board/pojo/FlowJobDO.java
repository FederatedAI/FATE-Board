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
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Set;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlowJobDO implements Serializable{
    private Integer page;
    private Integer limit;

    private String job_id;

    private String name;

    private String description;

    private String tag;

    private String dsl;

    private String runtime_conf;

    private String train_runtime_conf;

    private String roles;

    private Integer work_mode;

    private String initiator_role;

    private String initiator_party_id;

    private String status;

//    private Long fStatusLevel;

    private String role;

    private String party_id;

    private Integer is_initiator;

    private Integer progress;

    private Long create_time;

    private Long update_time;

    private Long start_time;

    private Long end_time;

    private Long elapsed;

    private Set<String> partners;

    }
