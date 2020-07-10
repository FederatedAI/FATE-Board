package com.webank.ai.fate.board.pojo;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Map;
import java.util.Objects;

public class BatchMetricDTO implements Serializable {
    @NotNull(message = "Job id can't be null!")
    private String jobId;
    @NotNull(message = "Role cant't be null!")
    private String role;
    @NotNull(message = "Party id can't be null!")
    private String partyId;
    @NotNull(message = "Component name cant't be null!")
    private String componentName;
    @NotNull(message = "Metric data can't be null!")
    private Map<String,String[]> metrics;

    public BatchMetricDTO() {
    }

    public BatchMetricDTO(@NotNull(message = "Metric data can't be null!") Map<String, String[]> metrics) {
        this.metrics = metrics;
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

    public String getComponentName() {
        return componentName;
    }

    public void setComponentName(String componentName) {
        this.componentName = componentName;
    }

    public Map<String, String[]> getMetrics() {
        return metrics;
    }

    public void setMetrics(Map<String, String[]> metrics) {
        this.metrics = metrics;
    }
}

