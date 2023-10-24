FROM maven:3.8-jdk-8 as builder
WORKDIR /data/projects/fate/fateboard
COPY . .
RUN  mvn clean package -DskipTests

FROM mcr.microsoft.com/java/jre:8u192-zulu-alpine
RUN apk add tzdata
WORKDIR /data/projects/fate/fateboard/

COPY --from=builder /data/projects/fate/fateboard/target/fateboard-*.jar /data/projects/fate/fateboard
COPY --from=builder /data/projects/fate/fateboard/src/main/resources/application.properties /data/projects/fate/fateboard/conf/
COPY --from=builder /data/projects/fate/fateboard/src/main/resources/ssh.properties /data/projects/fate/fateboard/conf/

EXPOSE 8080

CMD java -Dspring.config.location=/data/projects/fate/fateboard/conf/application.properties  -Dssh_config_file=/data/projects/fate/fateboard/conf  -Xmx2048m -Xms2048m -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log -XX:+HeapDumpOnOutOfMemoryError  -jar fateboard.jar
