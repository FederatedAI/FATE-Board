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
