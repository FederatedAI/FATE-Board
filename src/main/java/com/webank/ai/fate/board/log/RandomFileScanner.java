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
package com.webank.ai.fate.board.log;

import com.alibaba.fastjson.JSON;
import com.google.common.collect.Lists;
import com.webank.ai.fate.board.utils.LogHandle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import javax.websocket.Session;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public class RandomFileScanner implements Runnable, LogScanner {

    private static final Logger logger = LoggerFactory.getLogger(RandomFileScanner.class);
    long skipLine;
    TailFile tailFile;
    long flushNum;
    Session session;
    boolean needStop = false;


    public RandomFileScanner(File file, Session session, long skipLine) {

        try {
            tailFile = new TailFile(file, 0);
        } catch (IOException e) {
            logger.error("init RandomFileScanner failed", e);

        }
        this.session = session;
        this.skipLine = skipLine;
    }

    public TailFile getTailFile() {
        return tailFile;
    }

    public void setTailFile(TailFile tailFile) {
        this.tailFile = tailFile;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    @Override
    public boolean isNeedStop() {
        return needStop;
    }

    @Override
    public void setNeedStop(boolean needStop) {
        this.needStop = needStop;
    }

    @Override
    public void run() {
        try {
            while (true) {

                try {
                    if (needStop) {
                        logger.info("roll file thread return");
                        return;
                    }
                    List<Map> lines = tailFile.readEventMap(100);

                    if (lines == null) {
                        throw new Exception("lines not exist");
                    }
                    if (lines.size() == 0) {
                        Thread.sleep(500);
                    } else {
                        List<Map> result = Lists.newArrayList();
                        lines.forEach(content -> {
                            flushNum++;
                            if (session.isOpen()) {

                                if (flushNum > skipLine) {
                                    result.add(content);
                                }
                            } else {
                                needStop = true;
                                return;
                            }

                        });
                        if (session.isOpen()) {
                            List<Map> maps = LogHandle.handleLog(result);
                            session.getBasicRemote().sendText(JSON.toJSONString(maps));
                        }
                    }
                } catch (Exception e) {
                    logger.error("roll local file error", e);
                }
            }
        } finally {
            if (tailFile != null) {
                tailFile.close();
            }
        }

    }
}
