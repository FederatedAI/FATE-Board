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
