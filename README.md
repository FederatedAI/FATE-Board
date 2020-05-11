**DOC|[Chinese guide](./README-CN.md)**

FATE-Board as a suite of visualization tool for federated learning modeling designed to deep explore models and understand models easily and effectively. 

To make it easier to understand, track, debug, and explore federated learning modeling, as well as examine, evaluate, and compare various federation learning models. FATE-Board provides a visual way to probe models, from which you can reshape and improve models efficiently.

As a built-in visualization tool for FATE, FATE-Board presents abundant data visualization and model visualization information. In the Running Management, you can monitor the overall progress of all job runs. In the Dashboard, you can track the progress and logs of the algorithm components in real time. And in the Job Management, you can obtain model logs, model parameters, model outputs, evaluation metrics, etc.

 <div style="text-align:center", align=center>
<img src="./images/FATEBoard.png" />
</div>

# **Usage** #

**Database Configuration**

The default database for FATE-Board for cluster version is mysql. If you want to use standalone version, you should use sqlite databse. Just update the file : FATE-Board/src/main/resources/application.properties with right parameters of sqlite. The parameters you should update are below: 

spring.datasource.driver-Class-Name=org.sqlite.JDBC 

fateboard.datasource.url=xxx 

fateboard.datasource.username= 

fateboard.datasource.password=

**Starting FATE-Board** 

The FATE-Board source code uses the spring-boot framework and the embedded tomcat container. The default web port provided is 8080. Before starting, it is necessary to check whether port 8080 of the machine is already occupied. If the port is occupied, FATE-Board will fail to start.

FATE-Board gets job list through accessing MySQL database. If the database is not installed properly, the job list query will fail.
FATE-Board access FATE-Flow through HTTP protocol. If FATE-Flow is not started properly, FATE-Board will not display charts.

You can access FATE-Board by visiting http://{fateboard-ip}:8080.

**Starting a new job** 

1. Preparing a job: you should configure a pipeline, create graph, and define parameters. 
2. Launching FATE-Board: submit the job and get started, returning a job URL. Click the URL to view the job on web. Alternatively, once the job is running, you can navigate your web browser to http://{fateboard-ip}:8080 to view the FATEBoard.
Host or arbiter can also access the FATE-Board through http://{fateboard-ip}:8080.
3. Monitoring the job: dashboard visualizes the whole running progress.
4. Viewing the job outputs: you may view visual model outputs, data outputs and logs for each component.


FATE-Board can be used in Google Chrome, IE (10.0 and above) and other mainstream browsers. Some browsers might work, but there may be bugs or performance issues.

# **The Visualizations** #

**Job Dashboard** 

FATE-Board’s dashboard visualizes basic statistics that vary over time, which include running time of job, real-time Log of job, running status for each component. Once you submit your job, you may have to wait for it to run. You can check the RUNNING page to see the progress of all running jobs and all waiting jobs.

<div style="text-align:center", align=center>
<img src="./images/dashboard.png" />
</div>
<div style="text-align:center", align=center>
<img src="./images/Running.png" />
</div>

**Job Visualization**

Job visualization provides overviews of the overall execution of the job, visualizes all the results as much as possible. There are some simple interactions as following:

- Basic information about the job is shown on the left side of the page
- Clicking on component and you can see the parameters
- Clicking on the button under the parameter and you can see the model outputs，Switching tabs to see model output, data output, and log

<div style="text-align:center", align=center>
<img src="./images/jobDetail.png" />
</div>

**Visualizing the job workflow**

The job workflow of federated learning modeling is easy to understand, which can help you track the running progress intuitively. For each role, you may see your own graph in the federated learning modeling. 

**Visualizing the model graph**

FATE-Board provides different visualizations for federated learning models, including statistical table, histograms, curves, and so on. You can compare the performance of multiple training models on the same dataset, or inspect a single model’s performance for continued tuning and training, which all probe your models better.

**Visualizing the data**

Preview the data of each component and you can view 100 lines of output data, from which you can also see the prediction data, including prediction result, prediction score and prediction detail.

# **Frequently Asked Questions** #

**My FATE-Board isn’t showing any data of components!** 

FATE-Board sends a request to access FATE-Flow via HTTP to obtain all the data needed by a model. Log of httpclient is defined separately in the logback.xml in the source code, through which you can check communication between FATE-Board and FATE-Flow, and you can easily locate the problem if there is an exception.

**My FATE-Board isn’t showing any log！**

FATE-Board gets the list of jobs and details by querying MySQL. 
In a stand-alone environment, FATE-Board reads the local log file and returns it to the user through WebSocekt. If the log file cannot be displayed, you can first check whether the local log file has been generated.
In a clustered environment, FATE-Board could access log files on different machines with SSH, and push them to the browser through WebSocket. The default log lookup path is /data/projects/fate/python/logs/. If you cannot view the logs, it may be an error in SSH information in the cluster. you can set the correct SSH information by clicking the button in the upper right corner of the page.
