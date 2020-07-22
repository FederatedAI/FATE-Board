package com.webank.ai.fate.board.controller;


import java.io.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.webank.ai.fate.board.global.ErrorCode;
import com.webank.ai.fate.board.global.ResponseResult;
import com.webank.ai.fate.board.services.FileService;
import com.webank.ai.fate.board.utils.CheckPathUtil;
import org.apache.tools.zip.ZipEntry;
import org.apache.tools.zip.ZipOutputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.system.ApplicationHome;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping(value = "/file")
@CrossOrigin
public class FileController {
    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    @Autowired
    FileService fileService;

    /**
     * upload multiple files
     */
    @RequestMapping("/upload")
    public ResponseResult upload(@RequestParam("jobId") String jobId,
                                 @RequestParam("role") String role,
                                 @RequestParam("partyId") String partyId,
                                 @RequestParam("componentId") String componentId,
                                 @RequestParam("file") MultipartFile[] files) {
        logger.info("{},{},{},{}", jobId, role, partyId, componentId);

        if (!CheckPathUtil.checkPath(jobId, role, partyId, componentId)) {
            return new ResponseResult<>(ErrorCode.REQUEST_PARAMETER_ERROR);
        }
        int result = fileService.upload(jobId, role, partyId, componentId, files);
        if (0 != result) {
            logger.info("return code for upload:{}", result);
            return new ResponseResult<>(ErrorCode.UPLOAD_ERROR);
        }
        return new ResponseResult<>(ErrorCode.SUCCESS);
    }

//    /**
//     * upload multiple files
//     */
//    @RequestMapping("/download")
//    public ResponseResult download(@RequestParam("jobId") String jobId,
//                                   @RequestParam("role") String role,
//                                   @RequestParam("partyId") String partyId,
//                                   @RequestParam("componentId") String componentId,
//                                   HttpServletResponse httpServletResponse
//    ) throws IOException {
//        logger.info("{},{},{},{}", jobId, role, partyId, componentId);
//
//        if (!CheckPathUtil.checkPath(jobId, role, partyId, componentId)) {
//            return new ResponseResult<>(ErrorCode.REQUEST_PARAMETER_ERROR);
//        }
//        int result = fileService.download(jobId, role, partyId, componentId, httpServletResponse);
//        if (0 != result) {
//            logger.info("return code for download:{}", result);
//            return new ResponseResult<>(ErrorCode.DOWNLOAD_ERROR);
//        }
//        return new ResponseResult<>(ErrorCode.SUCCESS);
//    }


    /**
     * download the zip for all files of component
     */
    @RequestMapping(value = "/downloadZip", method = RequestMethod.POST)
    public ResponseResult downloadZip(@RequestParam("jobId") String jobId,
                                      @RequestParam("role") String role,
                                      @RequestParam("partyId") String partyId,
                                      @RequestParam("componentId") String componentId,
                                      HttpServletRequest request,
                                      HttpServletResponse response)
            throws Exception {
        List<File> files = new ArrayList<>();

        ApplicationHome h = new ApplicationHome(getClass());
        File jarF = h.getSource();
        String outFilePath = jarF.getParentFile().toString() + "/file" + "/" + jobId + "/" + role + "/" + partyId + "/" + componentId;

        File allFile = new File(outFilePath);
        if (!(allFile.exists() && allFile.isDirectory())) {
            return new ResponseResult<>(ErrorCode.DOWNLOAD_ERROR);
        }
        File[] fileArr = allFile.listFiles();
        if (fileArr != null && 0 != fileArr.length) {
            Collections.addAll(files, fileArr);
        } else {
            return new ResponseResult<>(ErrorCode.DOWNLOAD_ERROR);
        }

        //build temporary zip
        String fileName = componentId + ".zip";
        this.createFile(outFilePath, fileName);
        File file = new File(outFilePath, fileName);
        FileOutputStream outStream = new FileOutputStream(file);
        ZipOutputStream toClient = new ZipOutputStream(outStream);
        toClient.setEncoding("gbk");
//        FileController.zipFile(files, toClient);
        for (File fileToZip : files) {
            zipFile(fileToZip, toClient);
        }
        toClient.close();
        outStream.close();
        this.downloadFile(file, response, true);
        return new ResponseResult<>(ErrorCode.SUCCESS);
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
            FileInputStream inStream = new FileInputStream(inputFile);
            BufferedInputStream bInStream = new BufferedInputStream(inStream);

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
            bInStream.close();
            inStream.close();
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