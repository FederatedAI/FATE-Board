package com.webank.ai.fate.board.services;

import com.webank.ai.fate.board.utils.CheckPathUtil;
import org.apache.tools.zip.ZipEntry;
import org.apache.tools.zip.ZipOutputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.system.ApplicationHome;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.ArrayList;
import java.util.Collections;

@Service
public class FileService {
    private final static Logger logger = LoggerFactory.getLogger(FileService.class);

    public int upload(String jobId,
                      String role,
                      String partyId,
                      String componentId,
                      MultipartFile[] files) {
        //build file directory
        String componentPath = this.getComponentDirectoryPath(jobId, role, partyId, componentId);
        File componentFile = new File(componentPath);
        if (!componentFile.exists() || !componentFile.isDirectory()) {
            componentFile.mkdirs();
        }

        //upload file
        for (MultipartFile multipartFile : files) {
            if (multipartFile != null && !multipartFile.isEmpty()) {
                String originalFilename = multipartFile.getOriginalFilename();
                if (originalFilename == null || 0 == originalFilename.trim().length()) {
                    return 1;
                }
                String fileType = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
                String fileName = originalFilename.substring(0, originalFilename.lastIndexOf("."));
                if (!CheckPathUtil.checkPath(fileName, fileType)) {
                    return 1;
                }

                File fileObj = new File(componentFile, originalFilename);
                if (fileObj.exists()) {
                    continue;
                }
                try {
                    multipartFile.transferTo(fileObj);
                } catch (IOException e) {
                    e.printStackTrace();
                    logger.error("upload error : file {}", fileObj.getPath());
                    if (fileObj.exists()) {
                        fileObj.delete();
                    }
                    return 2;
                }
            }
        }
        return 0;
    }

    public int download(String jobId,
                        String role,
                        String partyId,
                        String componentId,
                        HttpServletResponse response) throws IOException {

        //build file directory
        String componentPath = this.getComponentDirectoryPath(jobId, role, partyId, componentId);
        File componentFile = new File(componentPath);
        if (!componentFile.exists() || !componentFile.isDirectory()) {
            return 1;
        }
        ArrayList<File> files = new ArrayList<>();
        File[] filesInComponentDirectory = componentFile.listFiles();
        if (filesInComponentDirectory != null && 0 != filesInComponentDirectory.length) {
            Collections.addAll(files, filesInComponentDirectory);
        } else {
            return 1;
        }
        File file = null;
        FileOutputStream outStream = null;
        ZipOutputStream toClient = null;

        try {
            //build temporary zip
            String fileName = componentId + ".zip";
            this.createFile(componentPath, fileName);
            file = new File(componentPath, fileName);
            outStream = new FileOutputStream(file);
            toClient = new ZipOutputStream(outStream);
            toClient.setEncoding("gbk");

            //zip file
            for (File fileToZip : files) {
                zipFile(fileToZip, toClient);
            }
        } catch (IOException e) {
            e.printStackTrace();
            logger.error("zip file error", e);
            return  2;
        } finally {
            if (toClient != null) {
                try {
                    toClient.close();
                } catch (IOException e) {
                    e.printStackTrace();
                    logger.error("close stream error", e);

                }
            }
            if (outStream != null) {
                try {
                    outStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                    logger.error("close stream error", e);
                }
            }
        }
        this.downloadFile(file, response, true);
        return 0;
    }

    private String getComponentDirectoryPath(String... pathParameters) {
        ApplicationHome applicationHome = new ApplicationHome(getClass());
        File source = applicationHome.getSource();
        String appHomePath = source.getParentFile().toString();

        StringBuffer appHomePathBuffer = new StringBuffer(appHomePath);
        appHomePathBuffer.append("/files");
        for (String pathParameter : pathParameters) {
            appHomePathBuffer.append("/").append(pathParameter);
        }
        return appHomePathBuffer.toString();
    }

    public void createFile(String path, String fileName) throws IOException {
        File file = new File(path, fileName);
        if (file.exists()) {
            file.delete();
        } else {
            file.createNewFile();
        }
    }

    /**
     * zip single file
     */
    public static void zipFile(File inputFile, ZipOutputStream outputStream) throws IOException {
        if (inputFile.exists() && inputFile.isFile()) {
            FileInputStream inStream = null;
            BufferedInputStream bInStream = null;
            try {
                inStream = new FileInputStream(inputFile);
                bInStream = new BufferedInputStream(inStream);

                ZipEntry entry = new ZipEntry(inputFile.getName());
                outputStream.putNextEntry(entry);

                final int MAX_BYTE = 10 * 1024 * 1024;
                long streamTotal = 0;
                int streamNum = 0;
                int leaveByte = 0;
                byte[] inOutbyte;

                streamTotal = bInStream.available();
                streamNum = (int) Math.floor(streamTotal / MAX_BYTE);
                leaveByte = (int) streamTotal % MAX_BYTE;

                if (streamNum > 0) {
                    for (int j = 0; j < streamNum; ++j) {
                        inOutbyte = new byte[MAX_BYTE];
                        bInStream.read(inOutbyte, 0, MAX_BYTE);
                        outputStream.write(inOutbyte, 0, MAX_BYTE);
                    }
                }
                inOutbyte = new byte[leaveByte];
                bInStream.read(inOutbyte, 0, leaveByte);
                outputStream.write(inOutbyte);
                outputStream.closeEntry();

            } catch (IOException e) {
                e.printStackTrace();
                logger.error("zip file error", e);
            } finally {
                if (bInStream != null) {
                    try {
                        bInStream.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                        logger.error("close stream error", e);
                    }
                }
                if (inStream != null) {
                    try {
                        inStream.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                        logger.error("close stream error", e);
                    }
                }
            }
        } else {
            throw new IOException("file doesn't exist！");
        }
    }

    /**
     * download zip
     */
    public void downloadFile(File file, HttpServletResponse response, boolean isDelete) throws IOException {
        BufferedInputStream fis = null;
        OutputStream toClient = null;
        try {
            fis = new BufferedInputStream(new FileInputStream(file.getPath()));
            byte[] buffer = new byte[fis.available()];
            fis.read(buffer);

            response.reset();
            toClient = new BufferedOutputStream(response.getOutputStream());
            response.setContentType("application/octet-stream");
            response.setHeader("Content-Disposition",
                    "attachment;filename=" + new String(file.getName().getBytes("UTF-8"), "ISO-8859-1"));
            toClient.write(buffer);
            toClient.flush();

            toClient.close();
            fis.close();
            if (isDelete) {
                file.delete();
            }
        } finally {
            if (toClient != null) {
                toClient.close();
            }
            if (fis != null) {
                fis.close();
            }
        }
    }
}
