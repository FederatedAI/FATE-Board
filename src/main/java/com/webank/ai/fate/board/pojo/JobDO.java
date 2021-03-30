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

import java.util.List;
import java.util.Set;

public class JobDO {

    private String fJobId;

    private String fName;

    private String fDescription;

    private String fTag;

    private String fDsl;

    private String fRuntimeConf;

    private String fTrainRuntimeConf;

    private String fRoles;

    private Integer fWorkMode;

    private String fInitiatorRole;

    private String fInitiatorPartyId;

    private String fStatus;

//    private Long fStatusLevel;

    private String fRole;

    private String fPartyId;

    private Integer fIsInitiator;

    private Integer fProgress;

    private Long fCreateTime;

    private Long fUpdateTime;

    private Long fStartTime;

    private Long fEndTime;

    private Long fElapsed;

    private Set<String> partners;

    public JobDO() {
    }

    public String getfJobId() {
        return fJobId;
    }

    public void setfJobId(String fJobId) {
        this.fJobId = fJobId;
    }

    public String getfName() {
        return fName;
    }

    public void setfName(String fName) {
        this.fName = fName;
    }

    public String getfDescription() {
        return fDescription;
    }

    public void setfDescription(String fDescription) {
        this.fDescription = fDescription;
    }

    public String getfTag() {
        return fTag;
    }

    public void setfTag(String fTag) {
        this.fTag = fTag;
    }

    public String getfDsl() {
        return fDsl;
    }

    public void setfDsl(String fDsl) {
        this.fDsl = fDsl;
    }

    public String getfRuntimeConf() {
        return fRuntimeConf;
    }

    public void setfRuntimeConf(String fRuntimeConf) {
        this.fRuntimeConf = fRuntimeConf;
    }

    public String getfTrainRuntimeConf() {
        return fTrainRuntimeConf;
    }

    public void setfTrainRuntimeConf(String fTrainRuntimeConf) {
        this.fTrainRuntimeConf = fTrainRuntimeConf;
    }

    public String getfRoles() {
        return fRoles;
    }

    public void setfRoles(String fRoles) {
        this.fRoles = fRoles;
    }

    public Integer getfWorkMode() {
        return fWorkMode;
    }

    public void setfWorkMode(Integer fWorkMode) {
        this.fWorkMode = fWorkMode;
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

    public Integer getfIsInitiator() {
        return fIsInitiator;
    }

    public void setfIsInitiator(Integer fIsInitiator) {
        this.fIsInitiator = fIsInitiator;
    }

    public Integer getfProgress() {
        return fProgress;
    }

    public void setfProgress(Integer fProgress) {
        this.fProgress = fProgress;
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

    public Set<String> getPartners() {
        return partners;
    }

    public void setPartners(Set<String> partners) {
        this.partners = partners;
    }
}
