

#                      **FATE-Board deployment Guide**


**DOC|[中文](./FATE-Board_deploy_guide_CN.md)**




# Server Configuration

| Server           |                                                  |
| ---------------- | ------------------------------------------------ |
| number           | 1 or 2                                           |
| configurations   | 8 core /16GB memory / 500GB /10M broadband       |
| operation system | CentOS linux 7.2 or above/ Ubuntu 16.04 or above |
| dependency       | jdk 8                                            |



# **Deploy**

Launch a FATE-Board service by following steps.

1. Modify FATE-Board/src/main/resources/application.properties.

   | Item                                      | explains                    | default                                                      |
   | :---------------------------------------- | :-------------------------- | :----------------------------------------------------------- |
   | server.port                               | port of FATE-Board          | 8080                                                         |
   | fateflow.url                              | the url of fate_flow server | none                                                         |
   | spring.http.encoding.charset              | code set for http           | UTF-8                                                        |
   | spring.http.encoding.enabled              | toggle for encoding         | true                                                         |
   | server.tomcat.uri-encoding                | code set for tomcat         | UTF-8                                                        |
   | server.tomcat.max-threads                 | max threads of tomcat       | 1000                                                         |
   | server.tomcat.max-connections             | max connections of tomcat   | 2000                                                         |
   | spring.servlet.multipart.max-file-size    | max-file-size               | 10MB                                                         |
   | spring.servlet.multipart.max-request-size | max-request-size            | 100MB                                                        |
   | server.compression.enabled                | compression                 | true                                                         |
   | server.compression.mime-types             | compression.mime-types      | application/json,application/xml,text/html,text/xml,text/plain |
   | server.board.login.username               | username                    | admin                                                        |
   | server.board.login.password               | password                    | admin                                                        |
   | management.endpoints.web.exposure.exclude | web.exposure.exclude        | *                                                            |
   | spring.session.store-type                 | open spring session         | jdbc                                                         |
   | spring.session.jdbc.initialize-schema     | initialize spring session   | always                                                       |


   - example

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

2. Package

   ```
   cd FATE-Board/
   mvn clean package -DskipTests
   ```

3. Launch the service

   command explains:

   | Item                     | explains                                           |
   | ------------------------ | -------------------------------------------------- |
   | -Dspring.config.location | path of application.properties of FATE-Board       |
   | -Dssh_config_file        | path of directory which ssh.properties lies in     |

   command example:

    NOTES: Please replace ${version} in command below with the real FATE-Board version you use.

   ```
   nohup java -Dspring.config.location=FATE/fateboard/src/main/resources/application.properties -Dssh_config_file=FATE-Board/src/main/resources/  -Xmx2048m -Xms2048m -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log -XX:+HeapDumpOnOutOfMemoryError  -jar FATE-Board/target/fateboard-${version}.jar  >/dev/null 2>&1 &
   ```

4. Stop the service

   Get the pid of FATE-Board:

   NOTES: Please replace ${version} in command below with the real FATE-Board version you use.

   ```
   ps -ef|grep java|grep fateboard-${version}.jar|grep -v grep|awk '{print $2}'
   ```

   kill the FATE-Board:

   NOTES: Please replace ${pid} in command below with the real pid you get.

   ```
   kill -9 ${pid}
   ```
