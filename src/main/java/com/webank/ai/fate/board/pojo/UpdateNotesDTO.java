package com.webank.ai.fate.board.pojo;

import javax.validation.constraints.NotNull;

public class UpdateNotesDTO {
    @NotNull(message = "Job id can't be null!")
    private String job_id;
    @NotNull(message = "Role cant't be null!")
    private String role;
    @NotNull(message = "Party id can't be null!")
    private String party_id;
    @NotNull(message = "Notes name cant't be null!")
    private String notes;

    public UpdateNotesDTO() {
    }

    public UpdateNotesDTO(@NotNull(message = "Job id can't be null!") String job_id, @NotNull(message = "Role cant't be null!") String role, @NotNull(message = "Party id can't be null!") String party_id, @NotNull(message = "Notes name cant't be null!") String notes) {
        this.job_id = job_id;
        this.role = role;
        this.party_id = party_id;
        this.notes = notes;
    }

    public String getJob_id() {
        return job_id;
    }

    public void setJob_id(String job_id) {
        this.job_id = job_id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getParty_id() {
        return party_id;
    }

    public void setParty_id(String party_id) {
        this.party_id = party_id;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
