package com.webank.ai.fate.board.services;

public interface SecurityService {

    String getEncryptKey() throws Exception;

    boolean compareValue(String encryptedValue, String realValue) throws Exception;

}
