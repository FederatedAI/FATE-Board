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

import java.io.Serializable;
import java.util.Objects;

public class FuzzyLogQO implements Serializable {

    private String jobId;
    private String role;
    private String partyId;
    private String componentId;
    private String type;
    private String condition;
    private Integer begin;
    private Integer end;

    public FuzzyLogQO() {
    }

    public FuzzyLogQO(String jobId, String role, String partyId, String componentId, String type, String condition, Integer begin, Integer end) {
        this.jobId = jobId;
        this.role = role;
        this.partyId = partyId;
        this.componentId = componentId;
        this.type = type;
        this.condition = condition;
        this.begin = begin;
        this.end = end;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPartyId() {
        return partyId;
    }

    public void setPartyId(String partyId) {
        this.partyId = partyId;
    }

    public String getComponentId() {
        return componentId;
    }

    public void setComponentId(String componentId) {
        this.componentId = componentId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public Integer getBegin() {
        return begin;
    }

    public void setBegin(Integer begin) {
        this.begin = begin;
    }

    public Integer getEnd() {
        return end;
    }

    public void setEnd(Integer end) {
        this.end = end;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FuzzyLogQO)) return false;
        FuzzyLogQO that = (FuzzyLogQO) o;
        return Objects.equals(jobId, that.jobId) &&
                Objects.equals(role, that.role) &&
                Objects.equals(partyId, that.partyId) &&
                Objects.equals(componentId, that.componentId) &&
                Objects.equals(type, that.type) &&
                Objects.equals(condition, that.condition) &&
                Objects.equals(begin, that.begin) &&
                Objects.equals(end, that.end);
    }

    @Override
    public int hashCode() {
        return Objects.hash(jobId, role, partyId, componentId, type, condition, begin, end);
    }

    @Override
    public String toString() {
        return "FuzzyLogQO{" +
                "jobId='" + jobId + '\'' +
                ", role='" + role + '\'' +
                ", partyId='" + partyId + '\'' +
                ", componentId='" + componentId + '\'' +
                ", type='" + type + '\'' +
                ", condition='" + condition + '\'' +
                ", begin=" + begin +
                ", end=" + end +
                '}';
    }
}
