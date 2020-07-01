package com.webank.ai.fate.board.controller;

import com.webank.ai.fate.board.global.ErrorCode;
import com.webank.ai.fate.board.global.ResponseResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.system.ApplicationHome;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

@CrossOrigin
@RestController
@RequestMapping(value = "/file")
public class FileDownloadController {
    private final static Logger logger = LoggerFactory.getLogger(FileDownloadController.class);

    @RequestMapping(value = "/download/{jobId}/{role}/{partyId}/{componentId}", method = RequestMethod.POST)
    public ResponseResult download(@PathVariable("jobId") String jobId,
                                   @PathVariable("role") String role,
                                   @PathVariable("partyId") String partyId,
                                   @PathVariable("componentId") String componentId) {
        return new ResponseResult<>();

    }

    @RequestMapping(value = "/upload/{jobId}/{role}/{partyId}/{componentId}", method = RequestMethod.POST)
    public ResponseResult upload(@PathVariable("jobId") String jobId,
                                 @PathVariable("role") String role,
                                 @PathVariable("partyId") String partyId,
                                 @PathVariable("componentId") String componentId,
                                 MultipartHttpServletRequest multipartHttpServletRequest
    ) {
        MultiValueMap<String, MultipartFile> multiFileMap = multipartHttpServletRequest.getMultiFileMap();
        Iterator<Map.Entry<String, List<MultipartFile>>> iterator = multiFileMap.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, List<MultipartFile>> entry = iterator.next();
            for (MultipartFile multipartFile : entry.getValue()) {

                //get file dir path
                ApplicationHome h = new ApplicationHome(getClass());
                File jarF = h.getSource();
                String filePath = jarF.getParentFile().toString() + "/file" + "/" + jobId + "/" + role + "/" + partyId + "/" + componentId;
                File fileDir = new File(filePath);
                if (!(fileDir.exists() && fileDir.isDirectory())) {
                    fileDir.mkdir();
                }

                String originalFilename = multipartFile.getOriginalFilename();
                if (originalFilename == null || 0 == originalFilename.trim().length()) {
                    continue;
                }
                File file = new File(fileDir, originalFilename);
                InputStream inputStream = null;
                FileOutputStream fileOutputStream = null;
                try {
                    if (!file.exists()) {
                        inputStream = multipartFile.getInputStream();
                        fileOutputStream = new FileOutputStream(file);
                        int len;
                        byte[] buf = new byte[1024];
                        while ((len = inputStream.read(buf)) != -1) {
                            fileOutputStream.write(buf, 0, len);
                        }

                    }
                } catch (IOException e) {
                    e.printStackTrace();
                    logger.error("upload error", e);
                } finally {
                    if (fileOutputStream != null) {
                        try {
                            fileOutputStream.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                            logger.error("close outputStream error", e);
                        }
                    }
                    if (inputStream != null) {
                        try {
                            inputStream.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                            logger.error("close inputStream error", e);
                        }
                    }
                }

            }
        }

        return new ResponseResult<>(ErrorCode.SUCCESS);
    }
}
