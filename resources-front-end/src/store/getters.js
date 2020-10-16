
/**
 *
 *  Copyright 2019 The FATE Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

const getters = {
  sidebar: state => state.app.sidebar,
  modelNameMap: state => state.app.modelNameMap,
  metricTypeMap: state => state.app.metricTypeMap,
  device: state => state.app.device,
  isOpenReqSimulate: state => state.app.isOpenReqSimulate,
  jobType: state => state.app.jobType,
  icons: state => state.app.icons,
  currentCvTab: state => state.app.currentCvTab,
  evaluationFlags: state => state.app.evaluationFlags,
  evaluationInstances: state => state.app.evaluationInstances,
  lastJob: state => state.app.lastJob,
  treesColor: state => state.app.treesColor,
  treesBorderColor: state => state.app.treesBorderColor
  // token: state => state.user.token,
  // avatar: state => state.user.avatar,
  // name: state => state.user.name,
  // roles: state => state.user.roles
}
export default getters
