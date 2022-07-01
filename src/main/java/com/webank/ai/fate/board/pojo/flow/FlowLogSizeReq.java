package com.webank.ai.fate.board.pojo.flow;

import lombok.Data;

@Data
public class FlowLogSizeReq {

    private String job_id;
    private String log_type;
    private String role;
    private String party_id;
    private String component_name;
    private String instance_id;

}
