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
package org.fedai.fate.board.utils;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.fedai.fate.board.global.Dict;
import org.fedai.fate.board.global.ErrorCode;
import org.fedai.fate.board.global.ResponseResult;
import org.apache.commons.lang3.StringUtils;

public class ResponseUtil {


    public static ResponseResult buildResponse(String result, String dataName) {

        if (StringUtils.isEmpty(result)) {
            return new ResponseResult<>(ErrorCode.FATEFLOW_ERROR_NULL_RESULT);
        }
        JSONObject resultObject = JSON.parseObject(result);

        Integer retcode = resultObject.getInteger(Dict.CODE) == null ? 200 : resultObject.getInteger(Dict.CODE);
        String msg = resultObject.getString(Dict.RETMSG) == null ? "ok" : resultObject.getString(Dict.RETMSG);

        if (dataName != null) {
            JSONArray jsonArray = resultObject.getJSONArray(Dict.DATA);
            return new ResponseResult<>(retcode, msg, jsonArray);
        } else {
            return new ResponseResult<>(retcode, msg, resultObject);
        }

    }

}
