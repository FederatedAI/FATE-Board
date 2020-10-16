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

import com.webank.ai.fate.board.dao.TaskMapper;
import com.webank.ai.fate.board.pojo.Task;
import com.webank.ai.fate.board.pojo.TaskDO;
import com.webank.ai.fate.board.pojo.TaskExample;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskManagerService {
    @Autowired
    TaskMapper taskMapper;


    public TaskDO findTask(String jobId,String role,String partyId, String componentName) {

        List<TaskDO> tasks = taskMapper.findTask(jobId, role,partyId, componentName);

        if (tasks.size() != 0) {
            return tasks.get(0);
        }
        return null;
    }


}
