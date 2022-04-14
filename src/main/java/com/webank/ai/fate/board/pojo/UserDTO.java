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

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.io.Serializable;

@Data
public class UserDTO implements Serializable {
    @NotNull(message = "username can't be null!")
    private String username;

    @NotNull(message = "password can't be null!")
    private String password;

    @NotNull(message = "nonce can't be null!")
    private String nonce;

    @NotNull(message = "timestamp can't be null!")
    private Long timestamp;

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getNonce() {
        return nonce;
    }

    public Long getTimestamp() {
        return timestamp;
    }
}
