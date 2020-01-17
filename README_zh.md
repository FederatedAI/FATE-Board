# FATE-Board README chinese version

FATEBoard 是一套用于联邦学习建模期间的可视化工具，旨在深入探索模型并轻松有效地理解模型，以便更容易理解、跟踪、调试和探索联邦学习建模，以及检查、评估和比较各种联邦学习模型。FATEBoard提供了一种可视化方式来探测模型，从中可以有效地重塑和改进模型。
![FATEBoard.png](https://github.com/FederatedAI/FATE-Board/blob/master/images/FATEBoard.png)

# 部署

FATE单机版已经集成了FATEBoard，用户无需额外配置附加信息，只需按照主页显示的步骤启动相关组件。

在分布式环境中，FATEBoard需要通过集群自动部署脚本而不是单独部署，您需要配置集群的相关信息，例如FATEFlow的URL、日志文件的目录、每台机器的SSH信息等。您还可以使用自动脚本部署自动生成所有配置信息，如果信息填写不正确，它将无法正常工作。

可以遵照下列步骤来启动fateboard服务。

1. 修改FATE/fateboard/src/main/resources/application.properties 文件

| 配置项 | 配置项注释 | 默认值 |
| --- | --- | --- |
| server.port | fateboard端口号 | 8080 |
| fateflow.url | fate_flow节点的url | none |
| spring.datasource.driver-Class-Name | 数据库驱动 | com.mysql.cj.jdbc.Driver |
| management.endpoints.web.exposure.include | 公开的端点 | * |
| spring.http.encoding.charset | http代码集 | UTF-8 |
| spring.http.encoding.enabled | 切换编码 | true |
| server.tomcat.uri-encoding | tomcat代码集 | UTF-8 |
| spring.datasource.url | 数据库url | jdbc:mysql://localhost:3306/fate_flow?characterEncoding=utf8&characterSetResults=utf8&autoReconnect=true&failOverReadOnly=false&serverTimezone=GMT%2B8 |
| spring.datasource.username | 数据库用户名 | none |
| spring.datasource.password | 数据库密码 | none |
| server.tomcat.max-threads | tomcat最大线程数 | 1000 |
| server.tomcat.max-connections | tomcat最大连接数 | 2000 |


- 示例1（MySQL数据库）
```
server.port=8080
fateflow.url=http://localhost:9380
spring.datasource.driver-Class-Name=com.mysql.cj.jdbc.Driver
management.endpoints.web.exposure.include=*
spring.http.encoding.charset=UTF-8
spring.http.encoding.enabled=true
server.tomcat.uri-encoding=UTF-8
spring.datasource.url=jdbc:mysql://localhost:3306/fate_flow?characterEncoding=utf8&characterSetResults=utf8&autoReconnect=true&failOverReadOnly=false&serverTimezone=GMT%2B8
spring.datasource.username=fate_dev
spring.datasource.password=fate_dev
server.tomcat.max-threads=1000
server.tomcat.max-connections=20000
```

- 示例2（sqlite数据库）
```
server.port=8080
fateflow.url=http://localhost:9380
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.datasource.url=jdbc:sqlite:/fate/fate_flow/fate_flow_sqlite.db
management.endpoints.web.exposure.include=*
spring.http.encoding.charset=UTF-8
spring.http.encoding.enabled=true
server.tomcat.uri-encoding=UTF-8
spring.datasource.username=
spring.datasource.password=
server.tomcat.max-threads=1000
server.tomcat.max-connections=20000
```

2. 修改FATE/fateboard/src/main/resources/ssh.properties文件

格式：ip=username|password|port



| 配置项 | 配置项注释 |
| --- | --- |
| ip | FATE中其他节点的ip |
| username | 系统登录用户名 |
| password | 系统登录密码 |
| port | 可访问的端口 |


示例： 192.168.xxx.xxx=app|app|22

3. 打包
```
cd FATE/fateboard
mvn clean package -DskipTests
```

4. 启动服务

指令参数释意： 

| 配置项 | 配置项注释 |
| --- | --- |
| -Dspring.config.location | fateboard中application.properties文件路径 |
| -Dssh_config_file | ssh.properties所在文件夹路径 |
| -DFATE_DEPLOY_PREFIX | fate_flow产生的日志文件路径 |


示例：
```
java -Dspring.config.location=FATE/fateboard/src/main/resources/application.properties -DFATE_DEPLOY_PREFIX=FATE/logs/  -Dssh_config_file=FATE/fateboard/src/main/resources/  -Xmx2048m -Xms2048m -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log -XX:+HeapDumpOnOutOfMemoryError  -jar FATE/fateboard/target/fateboard-1.2.0.jar  >/dev/null 2>&1 &
```

5. 关闭服务

获取fateboard的进程id
```
ps -ef|grep java|grep fateboard-1.2.0.jar|grep -v grep|awk '{print $2}'
```

关闭进程
```
kill -9 ${pid}
```


# 用法

**数据库配置**

集群版本的FATEBoard的默认数据库是mysql。如果是单机版环境，则需要使用sqlite数据库。只需要更新fateboard/src/main/resources/application.properties 中sqlite的参数即可。具体需要更新的参数如下：

```
spring.datasource.driver-Class-Name=org.sqlite.JDBC 
spring.datasource.url=xxx 
spring.datasource.username= 
spring.datasource.password=
```

**启动 FATEBoard**

FATEBoard源码使用的是spring-boot框架和嵌入式tomcat容器，默认的web端口是8080。在启动之前请检查机器的8080端口是否已经被占用，如果端口被占用，FATEBoard将无法启动。
FATEBoard通过访问MySQL数据库或者SQLite数据库获取作业列表，如果数据库安装不正确，作业列表将查询失败。FATEBoard通过HTTP协议访问FATEFlow，如果FATEFlow没有正常启动，在FATEBoard中也不会显示图表。
您可以通过http://{fateboard-ip}:8080来访问FATEBoard。

**开启一个新作业**

1. 准备工作：配置一个工作流，创建图表并定义参数；（参考[DSL配置](https://github.com/FederatedAI/FATE/blob/master/doc/develop_guide.md)）
1. 启动FATEBoard：提交作业并开始，返回作业URL。单击URL可以在web上查看作业，或者一旦作业开始运行，也可以将浏览器导航到http://{fateboard-ip}:8080 以查看 FATEBoard；对于Host或Arbiter角色，也可以通过http://{fateboard-ip}:8080 查看FATEBoard；
1. 监控作业：仪表盘可以查看整个运行进度；
1. 查看作业输出：可以通过查看每个组件的模型输出，模型评分和模型日志。

FATEBoard可用于Google Chorme、IE（10.0及以上）等主流浏览器，有些浏览器虽然可以工作，但可能会存在错误或者性能问题。

# 可视化

**作业仪表盘**

FATEBoard 的仪表板可视化了随时间变化的基本统计数据，包括作业运行时间、作业实时日志、每个组件的运行状态。一旦提交了作业任务，需要等待它运行。您可以查看 “正在运行” 页面，查看所有正在运行的作业和所有等待作业的进度。

![dashboard.png](https://github.com/FederatedAI/FATE-Board/blob/master/images/dashboard.png)

![Running.png](https://github.com/FederatedAI/FATE-Board/blob/master/images/Running.png)

**作业可视化**

作业可视化提供了作业整体执行的概述，尽可能地可视化所有结果。有一些简单的互动操作如下:

- 点击组件可以查看参数；
- 点击参数下的按钮可以看到模型输出；
- 切换选项卡可以查看模型输出、数据输出和日志；
- 在模型输出图表上移动鼠标到某个点也将产生动态垂直参考线，并显示数据值。

**可视化工作流程**

联邦学习建模的工作流很容易理解，它可以帮助您更直观地跟踪运行进度。对于每一角色，你可以查看联邦学习建模过程中自己的图表。

![jobDetail.png](https://github.com/FederatedAI/FATE-Board/blob/master/images/jobDetail.png)

**可视化模型图**

FATEBoard 为联邦学习模型提供了不同的可视化，包括统计表、直方图、曲线、混淆矩阵等。您可以比较同一数据集上多个训练模型的性能，或者检查单个模型的性能，以便继续调整和训练，所有这些都可以更好地探测您的模型。

以评估为例:

对于二元分类作业，FATEBoard 显示了评估得分图、 ROC 曲线、 K-S 曲线、提升曲线、增益曲线、精度-召回曲线和精度曲线。对于多类分类作业，FATEBoard 展示了一个评估得分图表和一个精度-召回曲线。对于回归作业，FATEBoard 展示评估得分图表。如果为作业提供了验证集，则根据训练集和验证集分别显示评估曲线。不同模型训练的评估曲线一起呈现，用于模型性能比较以及模型验证。

![ks.png](https://github.com/FederatedAI/FATE-Board/blob/master/images/ks.png)

**可视化数据**

预览每个组件的数据，您可以查看 100 行输出数据，从中您还可以看到预测数据，包括预测结果、预测得分和预测详细信息。

# 常见问题

**我的 FATEBoard 没有显示任何组件的数据!**

FATEBoard 通过 HTTP 发送访问 FATEFlow 的请求，以获取模型所需的所有数据。Httpclient 日志在源代码中的 logback.xml 中单独定义，通过它可以检查 FATEBoard 和 FATEFlow 之间的通信，如果有异常，可以很容易地找到问题所在。

**我的FATEBoard没有显示任何日志！**

FATEBoard 通过查询 MySQL 获取作业和详细信息的列表。在单机版中，Fateboard 读取本地日志文件并通过 WebSocekt 将其返回给用户。如果无法显示日志文件，您可以先检查本地日志文件是否已生成。在集群环境中，FATEBoard 可以使用 SSH 访问不同机器上的日志文件，并通过 WebSocket 将它们推送到浏览器。默认的日志查找路径是/data/projects/fortune/python/logs/。如果无法查看日志，则可能是集群中 SSH 信息的错误，可以通过单击页面右上角的按钮来设置正确的 SSH 信息。