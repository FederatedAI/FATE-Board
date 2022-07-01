package com.webank.ai.fate.board.pojo.websocket;

import lombok.Data;

@Data
public class LogQuery {
    private String type;
    private Integer begin;
    private Integer end;
    private String instanceId;
}
