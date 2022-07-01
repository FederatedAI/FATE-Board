package com.webank.ai.fate.board.intercept;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Component
public class FeignRequestInterceptor implements RequestInterceptor {

    @Value("${fateflow.http_app_key}")
    private String flowAppKey;
    @Value("${fateflow.http_secret_key}")
    private String flowSecretKey;

    @Override
    public void apply(RequestTemplate template) {
        template.header("Content-Type", "application/json;charset=UTF-8");
        if (!StringUtils.isAnyBlank(flowAppKey, flowSecretKey)) {
            String timestamp = System.currentTimeMillis() + "";
            String nonce = UUID.randomUUID().toString();
            String ENCODING = "ascii";
            String ALGORITHM = "HmacSHA1";
            String signature = null;
            try {
                Mac mac = Mac.getInstance(ALGORITHM);
                mac.init(new SecretKeySpec(flowSecretKey.getBytes(ENCODING), ALGORITHM));
                String[] array = new String[]{
                        new String(timestamp.getBytes(ENCODING)),
                        new String(nonce.getBytes(ENCODING)),
                        new String(flowAppKey.getBytes(ENCODING)),
                        new String(template.request().url().getBytes(ENCODING)),
                        new String(template.request().body()),
                        "",
                };
                String text = String.join("\n", array);
                byte[] signData = mac.doFinal(text.getBytes());
                signature = new String(Base64.encodeBase64(signData), ENCODING);
            } catch (NoSuchAlgorithmException | InvalidKeyException | UnsupportedEncodingException e) {
                e.printStackTrace();
            }
            template.header("TIMESTAMP", timestamp);
            template.header("NONCE", nonce);
            template.header("APP_KEY", flowAppKey);
            template.header("SIGNATURE", signature);
        }
    }

}