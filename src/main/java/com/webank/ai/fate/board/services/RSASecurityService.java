package com.webank.ai.fate.board.services;

import com.webank.ai.fate.board.utils.RSAUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RSASecurityService implements SecurityService {

    @Value("${security.key-refresh-time:300000}")
    private Long keyRefreshTime;
    private Long lastRefreshTime;
    private RSAUtils.RSAKeyPair keyPair;

    @Override
    public String getEncryptKey() throws Exception {
        return getPublicKey();
    }

    @Override
    public boolean compareValue(String encryptedValue, String realValue) throws Exception {
        return realValue.equals(RSAUtils.decrypt(encryptedValue, getPrivateKey()));
    }

    private String getPrivateKey() throws Exception {
        long currentTime = System.currentTimeMillis();
        if (lastRefreshTime == null || (currentTime - lastRefreshTime) > keyRefreshTime) {
            keyPair = RSAUtils.getKeyPair();
            lastRefreshTime = currentTime;
        }
        return keyPair.getPrivateKey();
    }

    private String getPublicKey() throws Exception {
        long currentTime = System.currentTimeMillis();
        if (lastRefreshTime == null || (currentTime - lastRefreshTime) > keyRefreshTime) {
            keyPair = RSAUtils.getKeyPair();
            lastRefreshTime = currentTime;
        }
        return keyPair.getPublicKey();
    }
}
