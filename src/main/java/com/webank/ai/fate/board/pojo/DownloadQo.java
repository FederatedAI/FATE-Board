package com.webank.ai.fate.board.pojo;

import java.io.Serializable;
import java.util.Objects;

public class DownloadQo implements Serializable {
    private String jobId;
    private String role;
    private String partyId;
    private String componentId;

    public DownloadQo() {
    }

    public DownloadQo(String jobId, String role, String partyId, String componentId) {
        this.jobId = jobId;
        this.role = role;
        this.partyId = partyId;
        this.componentId = componentId;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DownloadQo)) return false;
        DownloadQo that = (DownloadQo) o;
        return Objects.equals(jobId, that.jobId) &&
                Objects.equals(role, that.role) &&
                Objects.equals(partyId, that.partyId) &&
                Objects.equals(componentId, that.componentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(jobId, role, partyId, componentId);
    }

    @Override
    public String toString() {
        return "DownloadQo{" +
                "jobId='" + jobId + '\'' +
                ", role='" + role + '\'' +
                ", partyId='" + partyId + '\'' +
                ", componentId='" + componentId + '\'' +
                '}';
    }
}
