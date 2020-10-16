package com.webank.ai.fate.board.utils;

public class CheckPathUtil {
    public static boolean checkPath(String... paths){
        String regex = "^[0-9a-zA-Z_\\u4e00-\\u9fa5]+$";
        for (String parameter : paths) {
            if (!parameter.matches(regex)) {
                return false;
            }
        }
        return true;
    }
}
