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
import java.util.List;
import java.util.Objects;

public class PagedJobQO implements Serializable {
    private String jobId;
    private String partyId;
    private Long pageNum = 1L;
    private Long pageSize = 10L;
    private List<String> role;
    private List<String> status;
    private String orderField;
    private String orderRule;
    private String fDescription;

    public PagedJobQO() {
    }

    public PagedJobQO(String jobId, String partyId, Long pageNum, Long pageSize, List<String> role, List<String> status, String orderField, String orderRule, String fDescription) {
        this.jobId = jobId;
        this.partyId = partyId;
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        this.role = role;
        this.status = status;
        this.orderField = orderField;
        this.orderRule = orderRule;
        this.fDescription = fDescription;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getPartyId() {
        return partyId;
    }

    public void setPartyId(String partyId) {
        this.partyId = partyId;
    }

    public Long getPageNum() {
        return pageNum;
    }

    public void setPageNum(Long pageNum) {
        this.pageNum = pageNum;
    }

    public Long getPageSize() {
        return pageSize;
    }

    public void setPageSize(Long pageSize) {
        this.pageSize = pageSize;
    }

    public List<String> getRole() {
        return role;
    }

    public void setRole(List<String> role) {
        this.role = role;
    }

    public List<String> getStatus() {
        return status;
    }

    public void setStatus(List<String> status) {
        this.status = status;
    }

    public String getOrderField() {
        return orderField;
    }

    public void setOrderField(String orderField) {
        this.orderField = orderField;
    }

    public String getOrderRule() {
        return orderRule;
    }

    public void setOrderRule(String orderRule) {
        this.orderRule = orderRule;
    }

    public String getfDescription() {
        return fDescription;
    }

    public void setfDescription(String fDescription) {
        this.fDescription = fDescription;
    }

    @Override
    public String toString() {
        return "PagedJobQO{" +
                "jobId='" + jobId + '\'' +
                ", partyId='" + partyId + '\'' +
                ", pageNum=" + pageNum +
                ", pageSize=" + pageSize +
                ", role=" + role +
                ", status=" + status +
                ", orderField='" + orderField + '\'' +
                ", orderRule='" + orderRule + '\'' +
                ", fDescription='" + fDescription + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PagedJobQO)) return false;
        PagedJobQO that = (PagedJobQO) o;
        return Objects.equals(jobId, that.jobId) &&
                Objects.equals(partyId, that.partyId) &&
                Objects.equals(pageNum, that.pageNum) &&
                Objects.equals(pageSize, that.pageSize) &&
                Objects.equals(role, that.role) &&
                Objects.equals(status, that.status) &&
                Objects.equals(orderField, that.orderField) &&
                Objects.equals(orderRule, that.orderRule) &&
                Objects.equals(fDescription, that.fDescription);
    }

    @Override
    public int hashCode() {
        return Objects.hash(jobId, partyId, pageNum, pageSize, role, status, orderField, orderRule, fDescription);
    }
}
