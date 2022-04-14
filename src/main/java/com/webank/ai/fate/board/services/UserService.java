/*
 * Copyright 2019 The FATE Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.webank.ai.fate.board.services;

import com.webank.ai.fate.board.pojo.UserDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.apache.commons.codec.binary.Hex;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Properties;
import java.sql.Timestamp;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.Mac;

@Service
public class UserService {
    private final static Properties config = new Properties();
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public boolean login(UserDTO userDTO, HttpServletRequest httpServletRequest) {

        String username = userDTO.getUsername();
        String password = userDTO.getPassword();
        String nonce = userDTO.getNonce();
        Long timestamp = userDTO.getTimestamp();

        if (!checkUser(username, password, nonce, timestamp)) {
            return false;
        } else {
            HttpSession session = httpServletRequest.getSession();
            session.setAttribute("USER", userDTO);
            return true;
        }
    }

    public void logout(HttpServletRequest httpServletRequest) {
        HttpSession session = httpServletRequest.getSession();
        session.invalidate();
    }

    public String computeDigest(String message, String secret) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(), "HmacSHA1");

        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(secretKey);

        byte[] digest = mac.doFinal(message.getBytes());
        byte[] hexDigest = new Hex().encode(digest);

        return new String(hexDigest, StandardCharsets.ISO_8859_1);
    }

    public boolean checkUser(String username, String password, String nonce, Long timestamp) {
        updateConfig();
        String usernameValue = getValue("server.board.login.username");
        String passwordValue = getValue("server.board.login.password");

        if (!username.equals(usernameValue)) {
            return false;
        }

        Long timestampValue = new Timestamp(System.currentTimeMillis()).getTime();
        if (timestamp < timestampValue - 60000 || timestamp > timestampValue + 60000) {
            return false;
        }

        String digest;
        try {
            digest = computeDigest(nonce + timestamp, passwordValue);
        } catch (Exception e) {
            return false;
        }

        return password.equals(digest);
    }

    public static void updateConfig() {
        try {
            String confP = "conf/application.properties";
            String configP = "config/application.properties";
            File configFile = new File(confP);
            if (configFile.exists() || (configFile = new File(configP)).exists()) {
                BufferedReader bufferedReader = new BufferedReader(new FileReader(configFile));
                config.load(bufferedReader);
            } else {
                config.load(UserService.class.getClassLoader().getResourceAsStream("application.properties"));
            }
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
        }
    }

    public static String getValue(String key){
        return config.getProperty(key);
    }
}
