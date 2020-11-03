#!/bin/bash

#
#  Copyright 2019 The FATE Authors. All Rights Reserved.
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#
basepath=$(
  cd $(dirname $0)
  pwd
)
configpath=$(
  cd $basepath/conf
  pwd
)
fatepath=$(
  cd $basepath/..
  pwd
)

if test -f "${fatepath}/bin/init_env.sh";then
  source ${fatepath}/bin/init_env.sh
  echo "JAVA_HOME=$JAVA_HOME"
else
  echo "file not found:${fatepath}/bin/init_env.sh"
  exit
fi


module=fateboard

getpid() {
  pid=$(ps -ef | grep java | grep ${basepath}/fateboard.jar | grep -v grep | awk '{print $2}')

  if [[ -n ${pid} ]]; then
    return 1
  else
    return 0
  fi
}

mklogsdir() {
  if [[ ! -d "logs" ]]; then
    mkdir logs
  fi
}

status() {
  getpid
  if [[ -n ${pid} ]]; then
    echo "status:
        $(ps aux | grep ${pid} | grep -v grep)"
    return 1
  else
    echo "service not running"
    return 0
  fi
}

start() {
  getpid
  if [[ $? -eq 0 ]]; then
    mklogsdir
    if [[ $1 == "front" ]]; then
      exec $JAVA_HOME/bin/java -Dspring.config.location=$configpath/application.properties -DFATE_DEPLOY_PREFIX=$fatepath/logs/ -Dssh_config_file=$basepath/ssh/ -Xmx2048m -Xms2048m -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log -XX:+HeapDumpOnOutOfMemoryError -jar $basepath/${module}.jar >/dev/null 2>&1
    else
      nohup $JAVA_HOME/bin/java -Dspring.config.location=$configpath/application.properties -DFATE_DEPLOY_PREFIX=$fatepath/logs/ -Dssh_config_file=$basepath/ssh/ -Xmx2048m -Xms2048m -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log -XX:+HeapDumpOnOutOfMemoryError -jar $basepath/${module}.jar >/dev/null 2>&1 &

    fi

    if [[ $? -eq 0 ]]; then
      sleep 2
      getpid
      echo "service start sucessfully. pid: ${pid}"
    else
      echo "service start failed"
    fi
  else
    echo "service already started. pid: ${pid}"
  fi
}

stop() {
  getpid
  if [[ -n ${pid} ]]; then
    echo "killing:
        $(ps aux | grep ${pid} | grep -v grep)"
    kill -9 ${pid}
    if [[ $? -eq 0 ]]; then
      echo "killed"
    else
      echo "kill error"
    fi
  else
    echo "service not running"
  fi
}

case "$1" in
start)
  start
  status
  ;;

starting)
  start front
  ;;

stop)
  stop
  ;;
status)
  status
  ;;

restart)
  stop
  start
  status
  ;;
*)
  echo "usage: $0 {start|stop|status|restart}"
  exit -1
  ;;
esac
