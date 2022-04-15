

#                      **FATE-Board 部署指导**

**DOC|[English](./FATE-Board_deploy_guide_EN.md)**

# 服务器配置

| 服务器   |                                              |
| -------- | -------------------------------------------- |
| 数量     | 1 或 2                                       |
| 配置     | 8 核/16GB 内存/ 500GB /10M 带宽              |
| 操作系统 | CentOS linux 7.2 或以上/ Ubuntu 16.04 或以上 |
| 依赖     | jdk 8                                        |



# 部署

通过以下部署发起一个FATE-Board服务.

1. 修改文件 FATE-Board/src/main/resources/application.properties.

   | 配置项                                            | 说明                            | 默认值                                                       |
   | :------------------------------------------------ | :------------------------------ | :----------------------------------------------------------- |
   | server.port                                       | FATE-Board的端口                | 8080                                                         |
   | fateflow.url                                      | fate_flow服务的url              | 无                                                           |
   | spring.http.encoding.charset                      | code set for http               | UTF-8                                                        |
   | spring.http.encoding.enabled                      | http编码开关                    | true                                                         |
   | server.tomcat.uri-encoding                        | tomcat编码                      | UTF-8                                                        |
   | server.tomcat.max-threads                         | tomcat最大线程数                | 1000                                                         |
   | server.tomcat.max-connections                     | tomcat最大连接数                | 2000                                                         |
   | spring.servlet.multipart.max-file-size            | 最大上传文件大小                | 10MB                                                         |
   | spring.servlet.multipart.max-request-size         | 单次请求的文件的总大小          | 100MB                                                        |
   | server.compression.enabled                        | 是否开启压缩                    | true                                                         |
   | server.compression.mime-types                     | 要压缩的MIME type               | application/json,application/xml,text/html,text/xml,text/plain |
   | server.board.login.username                       | 用户名                          | admin                                                        |
   | server.board.login.password                       | 用户密码                        | admin                                                        |
   | management.endpoints.web.exposure.exclude         | http方式排除需要公开的端点      | *                                                            |
   | spring.session.store-type                         | 开启spring session              | jdbc                                                         |
   | spring.session.jdbc.initialize-schema             | 初始化spring session            | always                                                       |

- 示例

   ```
   server.port=8080
   fateflow.url=http://localhost:9380
   spring.http.encoding.charset=UTF-8
   spring.http.encoding.enabled=true
   server.tomcat.uri-encoding=UTF-8
   server.tomcat.max-threads=1000
   server.tomcat.max-connections=20000
   spring.servlet.multipart.max-file-size=10MB
   spring.servlet.multipart.max-request-size=100MB
   server.compression.enabled=true
   server.compression.mime-types=application/json,application/xml,text/html,text/xml,text/plain
   server.board.login.username=admin
   server.board.login.password=admin
   management.endpoints.web.exposure.exclude=*
   spring.session.store-type=jdbc
   spring.session.jdbc.initialize-schema=always
   ```
   
2. 打包

   ```
   cd FATE-Board/
   mvn clean package -DskipTests
   ```

3. 启动服务

   命令行说明:

   | 配置项                   | 说明                                         |
   | ------------------------ | -------------------------------------------- |
   | -Dspring.config.location | FATE-Board的application.properties文件路径   |
   | -Dssh_config_file        | FATE-Board的ssh.properties文件所在文件夹路径 |

   命令行示例:

    注意: 请用实际的FATE-Board版本替换下面命令行中的${version}.

   ```
   nohup java -Dspring.config.location=FATE/fateboard/src/main/resources/application.properties -Dssh_config_file=FATE-Board/src/main/resources/  -Xmx2048m -Xms2048m -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log -XX:+HeapDumpOnOutOfMemoryError  -jar FATE-Board/target/fateboard-${version}.jar  >/dev/null 2>&1 &
   ```

4. 停止服务

   获取FATE-Board服务 pid:

    注意: 请用实际的FATE-Board版本替换下面命令行中的${version}.

   ```
   ps -ef|grep java|grep fateboard-${version}.jar|grep -v grep|awk '{print $2}'
   ```

   关闭FATE-Board服务:

    注意: 请用实际获得的pid替换下面命令行中的${pid}.

   ```
   kill -9 ${pid}
   ```
