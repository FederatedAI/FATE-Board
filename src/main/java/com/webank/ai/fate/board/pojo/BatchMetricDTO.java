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

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Map;
import java.util.Objects;

public class BatchMetricDTO implements Serializable {
    @NotNull(message = "Job id can't be null!")
    private String job_id;
    @NotNull(message = "Role cant't be null!")
    private String role;
    @NotNull(message = "Party id can't be null!")
    private String party_id;
    @NotNull(message = "Component name cant't be null!")
    private String component_name;
    @NotNull(message = "Metric data can't be null!")
    private Map<String,String[]> metrics;

    public BatchMetricDTO() {
    }

    public BatchMetricDTO(@NotNull(message = "Job id can't be null!") String job_id, @NotNull(message = "Role cant't be null!") String role, @NotNull(message = "Party id can't be null!") String party_id, @NotNull(message = "Component name cant't be null!") String component_name, @NotNull(message = "Metric data can't be null!") Map<String, String[]> metrics) {
        this.job_id = job_id;
        this.role = role;
        this.party_id = party_id;
        this.component_name = component_name;
        this.metrics = metrics;
    }

    public String getJob_id() {
        return job_id;
    }

    public void setJob_id(String job_id) {
        this.job_id = job_id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getParty_id() {
        return party_id;
    }

    public void setParty_id(String party_id) {
        this.party_id = party_id;
    }

    public String getComponent_name() {
        return component_name;
    }

    public void setComponent_name(String component_name) {
        this.component_name = component_name;
    }

    public Map<String, String[]> getMetrics() {
        return metrics;
    }

    public void setMetrics(Map<String, String[]> metrics) {
        this.metrics = metrics;
    }
}

