package com.webank.ai.fate.board.pojo;

import javax.validation.constraints.NotNull;
import java.io.Serializable;

public class ReRunDTO implements Serializable {
    @NotNull(message = "Job id can't be null!")
    private String job_id;

    @NotNull(message = "Component name cant't be null!")
    private String component_name;

    public ReRunDTO() {
    }

    public ReRunDTO(@NotNull(message = "Job id can't be null!") String job_id, @NotNull(message = "Component name cant't be null!") String component_name) {
        this.job_id = job_id;
        this.component_name = component_name;
    }

    public String getJob_id() {
        return job_id;
    }

    public void setJob_id(String job_id) {
        this.job_id = job_id;
    }

    public String getComponent_name() {
        return component_name;
    }

    public void setComponent_name(String component_name) {
        this.component_name = component_name;
    }
}
