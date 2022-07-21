package com.webank.ai.fate.board.pojo.websocket;

import lombok.Data;

@Data
public class LogSizeResponse {

    private Integer jobSchedule;
    private Integer jobError;
    private Integer partyError;
    private Integer partyWarning;
    private Integer partyInfo;
    private Integer partyDebug;
    private Integer componentInfo;

}
