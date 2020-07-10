package com.webank.ai.fate.board.pojo;

import java.io.Serializable;
import java.util.Objects;

public class ComponentCommandDTO implements Serializable {
    private String jobId;
    private String role;
    private String partyId;
    private String componentName;

    public ComponentCommandDTO() {
    }

    public ComponentCommandDTO(String jobId, String role, String partyId, String componentName) {
        this.jobId = jobId;
        this.role = role;
        this.partyId = partyId;
        this.componentName = componentName;
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
}
