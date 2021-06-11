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

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.webank.ai.fate.board.dao.UserMapper;
import com.webank.ai.fate.board.pojo.UserDO;
import com.webank.ai.fate.board.pojo.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.List;

@Service
public class UserService {

    @Autowired
    UserMapper userMapper;

    public boolean login(UserDTO userDTO, HttpServletRequest httpServletRequest) {

        String password = userDTO.getPassword();
        String md5Password = DigestUtils.md5DigestAsHex(password.getBytes());
        userDTO.setPassword(md5Password);
        List<UserDO> userDOS = userMapper.find(userDTO);
        if (userDOS.size() <= 0) {
            return false;
        } else {
            HttpSession session = httpServletRequest.getSession();
            session.setAttribute("USER", userDOS.get(0));
            return true;
        }

    }

    public void logout(HttpServletRequest httpServletRequest) {
        HttpSession session = httpServletRequest.getSession();
        session.invalidate();
    }
}
