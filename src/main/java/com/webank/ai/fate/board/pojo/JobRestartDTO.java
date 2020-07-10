package com.webank.ai.fate.board.pojo;

import java.io.Serializable;
import java.util.Objects;

public class JobRestartDTO implements Serializable {
    private String jobId;
    private String role;
    private String partyId;

    public JobRestartDTO() {
    }

    public JobRestartDTO(String jobId, String role, String partyId) {
        this.jobId = jobId;
        this.role = role;
        this.partyId = partyId;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof JobRestartDTO)) return false;
        JobRestartDTO that = (JobRestartDTO) o;
        return Objects.equals(jobId, that.jobId) &&
                Objects.equals(role, that.role) &&
                Objects.equals(partyId, that.partyId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(jobId, role, partyId);
    }

    @Override
    public String toString() {
        return "JobRestartDTO{" +
                "jobId='" + jobId + '\'' +
                ", role='" + role + '\'' +
                ", partyId='" + partyId + '\'' +
                '}';
    }
}
