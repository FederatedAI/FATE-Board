package org.fedai.fate.board.pojo.websocket;

import lombok.Data;

@Data
public class LogQuery {
    private String type;
    private Integer begin;
    private Integer end;
    private String instanceId;
}
