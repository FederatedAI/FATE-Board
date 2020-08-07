package com.webank.ai.fate.board.pojo;

import java.io.Serializable;

public class TaskDO implements Serializable {

    private String fJobId;

    private Long fTaskSetId;

    private String fComponentName;

    private String fTaskId;

    private Long fTaskVersion;

    private String fInitiatorRole;

    private String fInitiatorPartyId;

    private String fStatus;

    private Long fStatusLevel;

    private String fRole;

    private String fPartyId;

    private String fRunIp;

    private Integer fRunPid;

    private String fPartyStatus;

    private Long fPartyStatusLevel;

    private Long fCreateTime;

    private Long fUpdateTime;

    private Long fStartTime;

    private Long fEndTime;

    private Long fElapsed;

    public TaskDO() {
    }

    public TaskDO(String fJobId, Long fTaskSetId, String fComponentName, String fTaskId, Long fTaskVersion, String fInitiatorRole, String fInitiatorPartyId, String fStatus, Long fStatusLevel, String fRole, String fPartyId, String fRunIp, Integer fRunPid, String fPartyStatus, Long fPartyStatusLevel, Long fCreateTime, Long fUpdateTime, Long fStartTime, Long fEndTime, Long fElapsed) {
        this.fJobId = fJobId;
        this.fTaskSetId = fTaskSetId;
        this.fComponentName = fComponentName;
        this.fTaskId = fTaskId;
        this.fTaskVersion = fTaskVersion;
        this.fInitiatorRole = fInitiatorRole;
        this.fInitiatorPartyId = fInitiatorPartyId;
        this.fStatus = fStatus;
        this.fStatusLevel = fStatusLevel;
        this.fRole = fRole;
        this.fPartyId = fPartyId;
        this.fRunIp = fRunIp;
        this.fRunPid = fRunPid;
        this.fPartyStatus = fPartyStatus;
        this.fPartyStatusLevel = fPartyStatusLevel;
        this.fCreateTime = fCreateTime;
        this.fUpdateTime = fUpdateTime;
        this.fStartTime = fStartTime;
        this.fEndTime = fEndTime;
        this.fElapsed = fElapsed;
    }

    public String getfJobId() {
        return fJobId;
    }

    public void setfJobId(String fJobId) {
        this.fJobId = fJobId;
    }

    public Long getfTaskSetId() {
        return fTaskSetId;
    }

    public void setfTaskSetId(Long fTaskSetId) {
        this.fTaskSetId = fTaskSetId;
    }

    public String getfComponentName() {
        return fComponentName;
    }

    public void setfComponentName(String fComponentName) {
        this.fComponentName = fComponentName;
    }

    public String getfTaskId() {
        return fTaskId;
    }

    public void setfTaskId(String fTaskId) {
        this.fTaskId = fTaskId;
    }

    public Long getfTaskVersion() {
        return fTaskVersion;
    }

    public void setfTaskVersion(Long fTaskVersion) {
        this.fTaskVersion = fTaskVersion;
    }

    public String getfInitiatorRole() {
        return fInitiatorRole;
    }

    public void setfInitiatorRole(String fInitiatorRole) {
        this.fInitiatorRole = fInitiatorRole;
    }

    public String getfInitiatorPartyId() {
        return fInitiatorPartyId;
    }

    public void setfInitiatorPartyId(String fInitiatorPartyId) {
        this.fInitiatorPartyId = fInitiatorPartyId;
    }

    public String getfStatus() {
        return fStatus;
    }

    public void setfStatus(String fStatus) {
        this.fStatus = fStatus;
    }

    public Long getfStatusLevel() {
        return fStatusLevel;
    }

    public void setfStatusLevel(Long fStatusLevel) {
        this.fStatusLevel = fStatusLevel;
    }

    public String getfRole() {
        return fRole;
    }

    public void setfRole(String fRole) {
        this.fRole = fRole;
    }

    public String getfPartyId() {
        return fPartyId;
    }

    public void setfPartyId(String fPartyId) {
        this.fPartyId = fPartyId;
    }

    public String getfRunIp() {
        return fRunIp;
    }

    public void setfRunIp(String fRunIp) {
        this.fRunIp = fRunIp;
    }

    public Integer getfRunPid() {
        return fRunPid;
    }

    public void setfRunPid(Integer fRunPid) {
        this.fRunPid = fRunPid;
    }

    public String getfPartyStatus() {
        return fPartyStatus;
    }

    public void setfPartyStatus(String fPartyStatus) {
        this.fPartyStatus = fPartyStatus;
    }

    public Long getfPartyStatusLevel() {
        return fPartyStatusLevel;
    }

    public void setfPartyStatusLevel(Long fPartyStatusLevel) {
        this.fPartyStatusLevel = fPartyStatusLevel;
    }

    public Long getfCreateTime() {
        return fCreateTime;
    }

    public void setfCreateTime(Long fCreateTime) {
        this.fCreateTime = fCreateTime;
    }

    public Long getfUpdateTime() {
        return fUpdateTime;
    }

    public void setfUpdateTime(Long fUpdateTime) {
        this.fUpdateTime = fUpdateTime;
    }

    public Long getfStartTime() {
        return fStartTime;
    }

    public void setfStartTime(Long fStartTime) {
        this.fStartTime = fStartTime;
    }

    public Long getfEndTime() {
        return fEndTime;
    }

    public void setfEndTime(Long fEndTime) {
        this.fEndTime = fEndTime;
    }

    public Long getfElapsed() {
        return fElapsed;
    }

    public void setfElapsed(Long fElapsed) {
        this.fElapsed = fElapsed;
    }
}
