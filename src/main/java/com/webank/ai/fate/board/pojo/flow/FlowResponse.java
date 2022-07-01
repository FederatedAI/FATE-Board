package com.webank.ai.fate.board.pojo.flow;

import lombok.Data;

@Data
public class FlowResponse<T> {

    private String retcode;
    private String retmsg;
    private T data;

}
