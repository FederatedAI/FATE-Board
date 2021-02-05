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
package com.webank.ai.fate.board.pojo;

import java.io.Serializable;
import java.util.Objects;

public class SshDTO implements Serializable {
    private String ip;
    private String port;
    private String user;
    private String password;

    public SshDTO() {
    }

    public SshDTO(String ip, String port, String user, String password) {
        this.ip = ip;
        this.port = port;
        this.user = user;
        this.password = password;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getPort() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SshDTO)) return false;
        SshDTO sshDTO = (SshDTO) o;
        return Objects.equals(ip, sshDTO.ip) &&
                Objects.equals(port, sshDTO.port) &&
                Objects.equals(user, sshDTO.user) &&
                Objects.equals(password, sshDTO.password);
    }

    @Override
    public int hashCode() {
        return Objects.hash(ip, port, user, password);
    }

    @Override
    public String toString() {
        return "SshDTO{" +
                "ip='" + ip + '\'' +
                ", port='" + port + '\'' +
                ", user='" + user + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
