FROM maven:3.8-jdk-8 as builder
WORKDIR /data/projects/fate/fateboard
COPY . .
RUN  mvn clean package -DskipTests

FROM mcr.microsoft.com/java/jre:8u192-zulu-alpine
RUN apk add tzdata
WORKDIR /data/projects/fate/fateboard/

COPY --from=builder /data/projects/fate/fateboard/target/fateboard-*.zip /data/projects/fate/fateboard

RUN unzip fateboard-*.zip && rm -rf fateboard-*.zip
RUN ln -s fateboard-*.jar fateboard.jar

EXPOSE 8080

CMD java -Dspring.config.location=/data/projects/fate/fateboard/conf/application.properties -Dssh_config_file=/data/projects/fate/fateboard/ssh/ -Xmx2048m -Xms2048m -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log -XX:+HeapDumpOnOutOfMemoryError -cp /data/projects/fate/fateboard/lib/*:/data/projects/fate/fateboard/fateboard.jar org.fedai.fate.board.bootstrap.Bootstrap