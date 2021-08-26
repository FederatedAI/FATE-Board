package com.webank.ai.fate.board.utils;

public class JsonFormatUtil {
    private static String BLANK = "  ";

    public static String format(String json) {
        StringBuffer result = new StringBuffer();
        int length = json.length();
        int number = 0;
        char key = 0;
        for (int i = 0; i < length; i++) {
            key = json.charAt(i);
            if ((key == '[') || (key == '{')) {
                if ((i - 1 > 0) && (json.charAt(i - 1) == ':')) {
                   result.append(" ");
                }
                result.append(key);
                result.append('\n');
                number++;
                result.append(blanks(number));
                continue;
            }
            if ((key == ']') || (key == '}')) {
                result.append('\n');
                number--;
                result.append(blanks(number));
                result.append(key);
                continue;
            }
            if ((key == ',')) {
                result.append(key);
                result.append('\n');
                result.append(blanks(number));
                continue;
            }
            result.append(key);
        }
        return result.toString();
    }

    private static String blanks(int number) {
        StringBuffer blank = new StringBuffer();
        for (int i = 0; i < number; i++) {
            blank.append(BLANK);
        }
        return blank.toString();
    }
}