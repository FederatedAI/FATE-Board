package com.webank.ai.fate.board.utils;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;

public class TelnetUtil {

    public static boolean telnet(String hostname, int port, int timeout) {
        Socket socket = new Socket();
        boolean isConnected = false;
        try {
            socket.connect(new InetSocketAddress(hostname, port), timeout);
            isConnected = socket.isConnected();
        } catch (IOException ignored) {
        } finally {
            try {
                socket.close();
            } catch (IOException ignored) {
            }
        }
        return isConnected;
    }

}