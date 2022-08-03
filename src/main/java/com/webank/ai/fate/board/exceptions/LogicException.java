package com.webank.ai.fate.board.exceptions;

import com.webank.ai.fate.board.global.ErrorCode;

public class LogicException extends RuntimeException {

    private int code;
    private String message;

    private LogicException() {
    }

    protected LogicException(int code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }

    protected LogicException(int code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.message = message;
    }

    protected LogicException(int code, Throwable cause) {
        super(cause);
        this.code = code;
    }

    protected LogicException(int code, String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
        this.code = code;
        this.message = message;
    }

    public static void throwError(int code, String message) {
        throw new LogicException(code, message);
    }

    public static void throwError(ErrorCode errorCode) {
        throw new LogicException(errorCode.getCode(), errorCode.getMsg());
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    @Override
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
