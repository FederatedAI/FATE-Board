

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

   | 配置项                              | 说明               | 默认值                                                       |
   | :---------------------------------- | :----------------- | :----------------------------------------------------------- |
   | server.port                         | FATE-Board的端口   | 8080                                                         |
   | fateflow.url                        | fate_flow服务的url | 无                                                           |
   | spring.datasource.driver-Class-Name | 数据库驱动         | com.mysql.cj.jdbc.Driver                                     |
   | spring.http.encoding.charset        | code set for http  | UTF-8                                                        |
   | spring.http.encoding.enabled        | http编码开关       | true                                                         |
   | server.tomcat.uri-encoding          | tomcat编码         | UTF-8                                                        |
   | fateboard.datasource.jdbc-url       | 数据库url          | jdbc:mysql://localhost:3306/fate_flow?characterEncoding=utf8&characterSetResults=utf8&autoReconnect=true&failOverReadOnly=false&serverTimezone=GMT%2B8 |
   | fateboard.datasource.username       | 数据库用户名       | 无                                                           |
   | fateboard.datasource.password       | 数据库密码         | 无                                                           |
   | server.tomcat.max-threads           | tomcat最大线程数   | 1000                                                         |
   | server.tomcat.max-connections       | tomcat最大连接数   | 2000                                                         |

   - 例子1(数据库: mysql)

     ```
     server.port=8080
     fateflow.url=http://localhost:9380
     spring.http.encoding.charset=UTF-8
     spring.http.encoding.enabled=true
     server.tomcat.uri-encoding=UTF-8
     spring.datasource.driver-Class-Name=com.mysql.cj.jdbc.Driver
     fateboard.datasource.jdbc-url=jdbc:mysql://localhost:3306/fate_flow?characterEncoding=utf8&characterSetResults=utf8&autoReconnect=true&failOverReadOnly=false&serverTimezone=GMT%2B8
     fateboard.datasource.username=fate_dev
     fateboard.datasource.password=fate_dev
     server.tomcat.max-threads=1000
     server.tomcat.max-connections=20000
     ```

   - 例子2(数据库: sqlite)

     ```
     server.port=8080
     fateflow.url=http://localhost:9380
     spring.http.encoding.charset=UTF-8
     spring.http.encoding.enabled=true
     server.tomcat.uri-encoding=UTF-8
     spring.datasource.driver-class-name=org.sqlite.JDBC
     fateboard.datasource.jdbc-url=jdbc:sqlite:/fate/fate_flow/fate_flow_sqlite.db
     fateboard.datasource.username=
     fateboard.datasource.password=
     server.tomcat.max-threads=1000
     server.tomcat.max-connections=20000
     ```

     

2. 修改文件 FATE-Board/src/main/resources/ssh.properties.

   格式: ip=username|password|port

   | 配置项   | 说明               |
   | -------- | ------------------ |
   | ip       | FATE其他服务所在ip |
   | username | 操作系统用户名     |
   | password | 操作系统密码       |
   | port     | ssh远程连接端口    |

   例子:

   ```
   192.168.xxx.xxx=app|app|22
   ```

3. 打包

   ```
   cd FATE-Board/
   mvn clean package -DskipTests
   ```

4. 启动服务

   命令行说明:

   | 配置项                   | 说明                                         |
   | ------------------------ | -------------------------------------------- |
   | -Dspring.config.location | FATE-Board的application.properties文件路径   |
   | -Dssh_config_file        | FATE-Board的ssh.properties文件所在文件夹路径 |
   | -DFATE_DEPLOY_PREFIX     | fate_flow产生的日志文件夹路径                |

   命令行示例:

    注意: 请用实际的FATE-Board版本替换下面命令行中的${version}.

   ```
   nohup java -Dspring.config.location=FATE/fateboard/src/main/resources/application.properties -DFATE_DEPLOY_PREFIX=FATE/logs/  -Dssh_config_file=FATE-Board/src/main/resources/  -Xmx2048m -Xms2048m -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log -XX:+HeapDumpOnOutOfMemoryError  -jar FATE-Board/target/fateboard-${version}.jar  >/dev/null 2>&1 &
   ```

5. 停止服务

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
