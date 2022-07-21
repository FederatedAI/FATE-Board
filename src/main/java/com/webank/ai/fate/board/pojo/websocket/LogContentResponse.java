package com.webank.ai.fate.board.pojo.websocket;

import com.webank.ai.fate.board.pojo.flow.FlowLogCatResp;
import lombok.Data;

import java.util.List;

@Data
public class LogContentResponse {

    private String type;

    private List<LogContent> data;

    @Data
    public static class LogContent{
        private String lineNum;
        private String content;

        public static LogContent fromFlowContent(FlowLogCatResp flowLogCatResp) {
            LogContent logContent = new LogContent();
            logContent.setLineNum(flowLogCatResp.getLine_num());
            logContent.setContent(flowLogCatResp.getContent());
            return logContent;
        }
    }

}
