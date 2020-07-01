package com.webank.ai.fate.board.controller;


import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.webank.ai.fate.board.global.ErrorCode;
import com.webank.ai.fate.board.global.ResponseResult;
import com.webank.ai.fate.board.pojo.DownloadQo;
import org.apache.tools.zip.ZipEntry;
import org.apache.tools.zip.ZipOutputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.system.ApplicationHome;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping(value = "/model")
@CrossOrigin
public class FileController {
    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    /**
     * javaWeb：
     * 1、commons-fileupload.jar     commons-io.jar
     * 2、解析当前请求  List<FileItem>  items =  servletFileUpload.parse(request);
     * 3、遍历每一个items，文件项，普通项
     * 4、如果是文件项，写流的上传方法
     * <p>
     * SpringMVC：
     * 1、文件上传也是使用commons-fileupload.jar
     * 2、配置好文件上传解析器；
     * 3、
     *
     * @return
     */
    @RequestMapping("/upload")
    public ResponseResult upload(@RequestParam("jobId") String jobId,
                                 @RequestParam("role") String role,
                                 @RequestParam("partyId") String partyId,
                                 @RequestParam("componentId") String componentId,
                                 HttpServletRequest httpServletRequest,
                                 @RequestParam("file") MultipartFile[] file) {
        //保存
        logger.info("{},{},{},{}", jobId, role, partyId, componentId);
        String characterEncoding = httpServletRequest.getCharacterEncoding();
        if (httpServletRequest.getCharacterEncoding() == null) {
            try {
                httpServletRequest.setCharacterEncoding("UTF-8");
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
                logger.error("encode error", e);
            }
        }
        //todo 路径校核
        //get file dir path
        ApplicationHome h = new ApplicationHome(getClass());
        File jarF = h.getSource();
        String filePath = jarF.getParentFile().toString() + "/file" + "/" + jobId + "/" + role + "/" + partyId + "/" + componentId;
        File fileDir = new File(filePath);
        if (!(fileDir.exists() && fileDir.isDirectory())) {
            fileDir.mkdirs();
        }

        for (MultipartFile multipartFile : file) {
            if (multipartFile != null && !multipartFile.isEmpty()) {
                String originalFilename = multipartFile.getOriginalFilename();
                //todo 文件路径处理
//                String fileF = originalFilename.substring(originalFilename.lastIndexOf("."), originalFilename.length());

                if (originalFilename == null || 0 == originalFilename.trim().length()) {
                    continue;
                }
                File fileObj = new File(fileDir, originalFilename);
                if (fileObj.exists()) {
                    continue;
                }
                try {
                    multipartFile.transferTo(fileObj);
                } catch (IllegalStateException | IOException e) {
                    e.printStackTrace();
                    logger.error("upload error {}", fileObj.getPath());
                }
            }
        }
        return new ResponseResult<>(ErrorCode.SUCCESS);
    }


    /**
     * 批量打包下载文件生成zip文件下载
     */
    @RequestMapping(value = "/multDownloadZip", method = RequestMethod.POST)
    public void downloadFiles(@RequestParam("jobId") String jobId,
                              @RequestParam("role") String role,
                              @RequestParam("partyId") String partyId,
                              @RequestParam("componentId") String componentId,
                              HttpServletRequest request,
                              HttpServletResponse response)
            throws ServletException, IOException {
        List<File> files = new ArrayList<>();

//        String outFilePath = request.getSession().getServletContext().getRealPath("/") + "upload";
        ApplicationHome h = new ApplicationHome(getClass());
        File jarF = h.getSource();
        String outFilePath = jarF.getParentFile().toString() + "/file" + "/" + jobId + "/" + role + "/" + partyId + "/" + componentId;

        File allFile = new File(outFilePath);
        System.out.println("Allfile: " + allFile.getPath());

        if (allFile.exists()) {
            //得到项目跟路径upload下所有的文件和目录的绝对路径
            File[] fileArr = allFile.listFiles();
            for (File file2 : fileArr) {
                files.add(file2);
            }
        }

        String fileName = componentId + ".zip";
        // 在服务器端创建打包下载的临时文件
        this.createFile(outFilePath, fileName);
        File file = new File(outFilePath + "/" + fileName);
        // 文件输出流
        FileOutputStream outStream = new FileOutputStream(file);
        /*
         * 压缩流
         * 需要导包：import org.apache.tools.zip.ZipOutputStream;
         */
        ZipOutputStream toClient = new ZipOutputStream(outStream);
        toClient.setEncoding("gbk");
        FileController.zipFile(files, toClient);
        toClient.close();
        outStream.close();
        this.downloadFile(file, response, true);
    }

    // 创建文件
    public void createFile(String path, String fileName) {
        // path表示你所创建文件的路径, fileName为文件名
        File file = new File(path, fileName);
        if (!file.exists()) {
            try {
                file.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

    }

    /**
     * 压缩文件列表中的文件
     *
     * @param files
     * @param outputStream
     * @throws IOException
     */
    public static void zipFile(List<File> files, ZipOutputStream outputStream) throws IOException, ServletException {
        int size = files.size();
        // 压缩列表中的文件
        for (int i = 0; i < size; i++) {
            File file = files.get(i);
            zipFile(file, outputStream);
        }
    }

    /**
     * 将文件写入到zip文件中
     *
     * @param inputFile
     * @param outputStream
     * @throws Exception
     */
    public static void zipFile(File inputFile, ZipOutputStream outputStream) throws IOException {
        if (inputFile.exists()) {
            if (inputFile.isFile()) {
                FileInputStream inStream = new FileInputStream(inputFile);
                BufferedInputStream bInStream = new BufferedInputStream(inStream);
                /*
                 * 需要导包：import org.apache.tools.zip.ZipEntry;
                 */
                ZipEntry entry = new ZipEntry(inputFile.getName());
                outputStream.putNextEntry(entry);

                final int MAX_BYTE = 10 * 1024 * 1024; // 最大的流为10M
                long streamTotal = 0; // 接受流的容量
                int streamNum = 0; // 流需要分开的数量
                int leaveByte = 0; // 文件剩下的字符数
                byte[] inOutbyte; // byte数组接受文件的数据

                streamTotal = bInStream.available(); // 通过available方法取得流的最大字符数
                streamNum = (int) Math.floor(streamTotal / MAX_BYTE); // 取得流文件需要分开的数量
                leaveByte = (int) streamTotal % MAX_BYTE; // 分开文件之后,剩余的数量

                if (streamNum > 0) {
                    for (int j = 0; j < streamNum; ++j) {
                        inOutbyte = new byte[MAX_BYTE];
                        // 读入流,保存在byte数组
                        bInStream.read(inOutbyte, 0, MAX_BYTE);
                        outputStream.write(inOutbyte, 0, MAX_BYTE); // 写出流
                    }
                }
                // 写出剩下的流数据
                inOutbyte = new byte[leaveByte];
                bInStream.read(inOutbyte, 0, leaveByte);
                outputStream.write(inOutbyte);
                outputStream.closeEntry(); // Closes the current ZIP entry
                // and positions the stream for
                // writing the next entry
                bInStream.close(); // 关闭
                inStream.close();
            }
        } else {
            throw new IOException("file doesn't exist！");
        }
    }

    /**
     * 下载文件
     *
     * @param file
     * @param response
     */
    public void downloadFile(File file, HttpServletResponse response, boolean isDelete) {
        try {
            // 以流的形式下载文件。
            BufferedInputStream fis = new BufferedInputStream(new FileInputStream(file.getPath()));
            byte[] buffer = new byte[fis.available()];
            fis.read(buffer);
            fis.close();
            // 清空response
            response.reset();
            OutputStream toClient = new BufferedOutputStream(response.getOutputStream());
            response.setContentType("application/octet-stream");
            response.setHeader("Content-Disposition",
                    "attachment;filename=" + new String(file.getName().getBytes("UTF-8"), "ISO-8859-1"));
            toClient.write(buffer);
            toClient.flush();
            toClient.close();
            if (isDelete) {
                file.delete(); // 是否将生成的服务器端文件删除
            }
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }


    @RequestMapping("/singleDownload")
    public ResponseEntity<byte[]> downloadImg(HttpSession session) throws IOException {
        //=============造响应体=============
        //1、创建一个ResponseEntity对象。这个对象里面既有响应头还有响应体；
        ServletContext servletContext = session.getServletContext();
        //1、获取到图片的流，直接交给浏览器；ServletContext.可以从当前项目下获取资源
        //2、获取到图片的流
        InputStream is = servletContext.getResourceAsStream("/Desert.jpg");
        //创建一个和流一样多的数组
        byte[] body = new byte[is.available()];
        //3、将流的数据放在数组里面
        is.read(body);
        is.close();

        //==============造响应头================
        HttpHeaders headers = new HttpHeaders();
        //文件下载的响应头
        //按照以前乱码的解决方式；

        //文件名乱码解决
        String filename = "单个图片.jpg";
        filename = new String(filename.getBytes("GBK"), "ISO8859-1");
        headers.add("Content-Disposition", "attachment; filename=" + filename);
        //第一个参数代表给浏览器的响应数据（响应体）
        //第二个参数代表当前响应的响应头（定制响应头）MultiValueMap
        //第三个参数代表当前响应状态码（statusCode）HttpStatus
        ResponseEntity<byte[]> re = new ResponseEntity<byte[]>(body, headers, HttpStatus.OK);

        return re;
    }
}