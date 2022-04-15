package com.webank.ai.fate.board.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlowJobQO implements Serializable {
    private Integer page;
    private Integer limit;
    private String job_id;
    private String party_id;
    private List<String> role;
    private List<String> status;
    private String description;
    private String order_by;
    private String order;

    //todo
    private String partner;
}
