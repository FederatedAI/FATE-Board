

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

   | Item                                | explains                    | default                                                      |
   | :---------------------------------- | :-------------------------- | :----------------------------------------------------------- |
   | server.port                         | port of FATE-Board          | 8080                                                         |
   | fateflow.url                        | the url of fate_flow server | none                                                         |
   | spring.datasource.driver-Class-Name | driver for database         | com.mysql.cj.jdbc.Driver                                     |
   | spring.http.encoding.charset        | code set for http           | UTF-8                                                        |
   | spring.http.encoding.enabled        | toggle for encoding         | true                                                         |
   | server.tomcat.uri-encoding          | code set for tomcat         | UTF-8                                                        |
   | fateboard.datasource.jdbc-url       | url of database             | jdbc:mysql://localhost:3306/fate_flow?characterEncoding=utf8&characterSetResults=utf8&autoReconnect=true&failOverReadOnly=false&serverTimezone=GMT%2B8 |
   | fateboard.datasource.username       | username of database        | none                                                         |
   | fateboard.datasource.password       | password of database        | none                                                         |
   | server.tomcat.max-threads           | max threads of tomcat       | 1000                                                         |
   | server.tomcat.max-connections       | max connections of tomcat   | 2000                                                         |
   | spring.servlet.multipart.max-file-size |max-file-size|10MB|
   |spring.servlet.multipart.max-request-size|max-request-size|100MB|
   |spring.datasource.druid.filter.config.enabled|Druid set|false|
   |spring.datasource.druid.web-stat-filter.enabled|Druid set|false|
   |spring.datasource.druid.stat-view-servlet.enabled|Druid set|false|
   |server.compression.enabled|compression|true|
   |server.compression.mime-types|compression.mime-types|application/json,application/xml,text/html,text/xml,text/plain|
   |server.board.login.username|username|admin|
   |server.board.login.password|password|admin|
   |management.endpoints.web.exposure.exclude|web.exposure.exclude|*|
   |spring.session.store-type|open spring session|jdbc|
   |spring.session.jdbc.initialize-schema|initialize spring session|always|
   |#server.ssl.key-store=classpath:|key-store classpath ||
   |#server.ssl.key-store-password=|key-store-password||
   |#server.ssl.key-password=|key-password||
   |#server.ssl.key-alias=|key-alias||
   |#HTTP_APP_KEY=|APP_KEY||
   |#HTTP_SECRET_KEY=|be same with the HTTP_SECRET_KEY of flow||

   - example1 (database: mysql)

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
     spring.servlet.multipart.max-file-size=10MB
     spring.servlet.multipart.max-request-size=100MB
     spring.datasource.druid.filter.config.enabled=false
     spring.datasource.druid.web-stat-filter.enabled=false
     spring.datasource.druid.stat-view-servlet.enabled=false
     server.compression.enabled=true
     server.compression.mime-types=application/json,application/xml,text/html,text/xml,text/plain
     server.board.login.username=admin
     server.board.login.password=admin
     management.endpoints.web.exposure.exclude=*
     spring.session.store-type=jdbc
     spring.session.jdbc.initialize-schema=always
     #server.ssl.key-store=classpath:
     #server.ssl.key-store-password=
     #server.ssl.key-password=
     #server.ssl.key-alias=
     #HTTP_APP_KEY=
     #HTTP_SECRET_KEY=
     ```

   - example2(database:sqlite)

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
     spring.servlet.multipart.max-file-size=10MB
     spring.servlet.multipart.max-request-size=100MB
     spring.datasource.druid.filter.config.enabled=false
     spring.datasource.druid.web-stat-filter.enabled=false
     spring.datasource.druid.stat-view-servlet.enabled=false
     server.compression.enabled=true
     server.compression.mime-types=application/json,application/xml,text/html,text/xml,text/plain
     server.board.login.username=admin
     server.board.login.password=admin
     management.endpoints.web.exposure.exclude=*
     spring.session.store-type=jdbc
     spring.session.jdbc.initialize-schema=always
     #server.ssl.key-store=classpath:
     #server.ssl.key-store-password=
     #server.ssl.key-password=
     #server.ssl.key-alias=
     #HTTP_APP_KEY=
     #HTTP_SECRET_KEY=
     ```

     

2. Modify FATE-Board/src/main/resources/ssh.properties.

   Format : ip=username|password|port

   | Item     | explains                      |
   | -------- | ----------------------------- |
   | ip       | ip of other nodes in FATE     |
   | username | user name of operating system |
   | password | password of operating system  |
   | port     | port which can access         |

   example:

   ```
   192.168.xxx.xxx=app|app|22
   ```

3. Package

   ```
   cd FATE-Board/
   mvn clean package -DskipTests
   ```

4. Launch the service

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

5. Stop the service

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
