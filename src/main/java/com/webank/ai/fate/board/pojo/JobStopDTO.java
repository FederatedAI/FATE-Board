package com.webank.ai.fate.board.pojo;

import javax.validation.constraints.NotNull;

public class JobStopDTO {
    @NotNull(message = "Job id can't be null!")
    private String job_id;

    public JobStopDTO() {
    }

    public JobStopDTO(@NotNull(message = "Job id can't be null!") String job_id) {
        this.job_id = job_id;
    }

    public String getJob_id() {
        return job_id;
    }

    public void setJob_id(String job_id) {
        this.job_id = job_id;
    }
}
