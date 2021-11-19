<template>
  <div class="app-container details-container bg-dark" @click="notePopover = false">
    <breadcrumb-ext :breads="breads"/>

    <div class="flex flex-row space-between app-content">
      <section class="section-wrapper prop-section">
        <div v-loading="summaryLoading" class="section-view job-summary section-summary">
          <h3 class="section-title">Job Summary</h3>
          <ul class="summary-items">
            <li>
              <div class="prop">job ID:</div>
              <p class="prop-content">{{ jobId }}</p>
            </li>
            <li>
              <div class="prop">status:</div>
              <p class="prop-content">{{ jobInfo.status }}</p>
            </li>
            <li style="position:relative;">
              <div class="prop">notes:</div>
              <notes ref="notes" :job-info="jobInfo"/>
            </li>
            <li>
              <hr class="hr-style">
            </li>
            <li class="inline-row">
              <div class="prop inline-prop">role:</div>
              <p class="prop-content">{{ role }}</p>
            </li>
            <li class="inline-row">
              <div class="prop inline-prop">party_ID:</div>
              <p class="prop-content">{{ partyId }}</p>
            </li>
            <li class="inline-row" style="margin-bottom: 0px;">
              <div class="prop inline-prop">dataset:</div>
              <div class="flex flex-col flex-start prop-content prop-dataset">
                <overflow-tooltip v-for="(item, index) in showingRoleList" :key="index" :content="item" placement="right">
                  <p class="prop-dataset-item">{{ item }}</p>
                </overflow-tooltip>
                <el-popover
                  v-if="thisRoleList.length > 3"
                  placement="right-start"
                  title=""
                  width="250"
                  trigger="click">
                  <div class="flex flex-col flex-start">
                    <span v-for="(itemRole, indexRole) in thisRoleList" :key="indexRole" style="margin-bottom: 6px;">{{ itemRole }}</span>
                  </div>
                  <p slot="reference" class="text-primary tip" style="margin-bottom:12px;">more</p>
                </el-popover>
              </div>
            </li>
            <li v-for="(item,index) in otherRoleList" :key="index" class="inline-row">
              <div class="prop inline-prop">{{ item.role.toLowerCase() + ':' }}</div>
              <div class="flex flex-center prop-content">
                <p class="value">{{ item.datasetList.length }}</p>
                <el-popover
                  placement="right-start"
                  title=""
                  width="250"
                  trigger="click">
                  <div>
                    <el-row>
                      <el-col :span="8">
                        <p
                          style="margin-bottom: 8px;
                                font-weight: bold;
                                color: #7f7d8e;
                                height: 18px;
                                line-height: 18px;"
                        >party_ID</p>
                        <!-- <p v-for="(dataset,index) in item.datasetList" :key="index">{{ dataset.name }}</p> -->
                      </el-col>
                      <el-col :span="12" :offset="4">
                        <p
                          style="margin-bottom: 8px;
                                font-weight: bold;
                                color: #7f7d8e;
                                height: 18px;
                                line-height: 18px;"
                        >Dataset</p>
                        <!-- <p v-for="(dataset,index) in item.datasetList" :key="index">{{ dataset.dataset }}</p> -->
                      </el-col>
                    </el-row>
                    <el-row v-for="(dataset,index) in item.datasetList" :key="index">
                      <el-col :span="8">
                        <p> {{ dataset.name }} </p>
                      </el-col>
                      <el-col :span="12" :offset="4">
                        <div class="flex flex-col">
                          <p v-for="(item, index) in checkDataSetForOther(dataset.dataset)" :key="index">
                            {{ item }}
                          </p>
                        </div>
                      </el-col>
                    </el-row>
                  </div>
                  <p slot="reference" class="text-primary tip">view</p>
                </el-popover>
              </div>
            </li>
            <li class="inline-row download-link" @click="downloadJobConfig('dsl')">
              Job DSL&nbsp;
              <i class="el-icon-download"/>
            </li>
            <li :class="{'disable-color': role.toLowerCase() === 'arbiter'}" class="inline-row download-link" @click="downloadJobConfig('runtime')">
              Runtime config&nbsp;
              <i class="el-icon-download"/>
            </li>
            <li>
              <hr class="hr-style">
            </li>
            <li>
              <div class="prop">submission time:</div>
              <p class="prop-content">{{ jobInfo.submmissionTime }}</p>
            </li>
            <li>
              <div class="prop">start time:</div>
              <p class="prop-content">{{ jobInfo.startTime }}</p>
            </li>
            <li>
              <div class="prop">end time:</div>
              <p class="prop-content">{{ jobInfo.endTime }}</p>
            </li>
            <li>
              <div class="prop">duration:</div>
              <p class="prop-content">{{ jobInfo.duration }}</p>
            </li>
          </ul>
          <button class="dashboard-btn" @click="toDashboard">dashboard</button>
        </div>
      </section>

      <section class="section-wrapper echart-section">
        <div class="output-wrapper flex flex-col">
          <h3 class="section-title">Outputs From Job</h3>
          <!--DAG-->
          <div class="flex flex-row output-content">
            <div class="dag-wrapper overflow-auto">
              <div class="flex flex-row flex-center justift-center">
                <h4 class="output-title">Main Graph</h4>
                <p class="output-desc">Click component to view details</p>
              </div>
              <!--<div v-if="DAGData" :style="{'min-height':DAGData.component_list.length * 120+'px'}" class="echart-wrapper">-->
              <div v-if="DAGData" class="echart-wrapper">
                <dag ref="dagForJobFlow" :dag-info="DAGData" @choose="getDagInstance" @retry="jobRetry"/>
              </div>
            </div>

            <div v-loading="paraLoading" class="para-wrapper flex flex-col space-between">
              <div class="flex flex-col flex-start para-warpper-content" style="width:100%;">
                <h4 class="para-title">Parameter({{ parameterCount }})</h4>
                <div v-loading="msgLoading" class="msg bg-dark" style="display:flex;">
                  <el-tree v-if="treeRefresh" ref="foldParameterTree" :data="paramList" :empty-text="''" :default-expand-all="treeUnfoldAll" :props="defaultPropsForTree" class="bg-dark"/>
                  <div v-if="paramList && paramList.length > 0" class="unfold-tree" @click.stop="unfoldAll">{{ treeUnfoldAll ? 'fold all' : 'unfold all' }}</div>
                </div>
              </div>
              <el-button
                :disabled="!componentName"
                type="primary"
                round
                style="height: 32px;line-height: 0;font-size: 14px;border-radius: 2px;width:100%;"
                @click="visualization"
              >
                view the outputs
              </el-button>
            </div>
          </div>
        </div>
      </section>
    </div>
    <output-dialog
      ref="outputDialog"
      :title="outputTitle"
      :visible="outputVisible"
      :model-type="modelOutputType"
      :component-name="componentName"
      :job-id="jobId"
      :role="role"
      :party-id="partyId"
      :status="jobInfo.status"
      @closeDialog="closeDialog"
      @download="handleDownloadDialog"
      @filterLogic="handleFilterLogic"
      @cReporter="downloadFile"
      @dReporter="downloadFile"/>

    <download-report ref="downloadReport" :download-list="downloadList" :use-logic="useLogic" :table-data="variableMap" @download="handleBeforeDownload" @filterLogic="handleFilterLogic"/>

    <download-data ref="downloadData" />

    <canvas v-show="false" id="historyForDetail" width="1" height="1" style="width:1px;height:1px"/>
    <confirm ref="confirm" class="confirm-dialog"/>
  </div>
</template>

<script>
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

import { parseTime, formatSeconds } from '@/utils'
import { getComponentPara, getComponentCommand, retryJob, jobDownload } from '@/api/job'
import IconHoverAndActive from '@/components/IconHoverAndActive'
import graphChartHandler from '@/utils/vendor/graphChartHandler'
import graphOptions from '@/utils/chart-options/graph'
import treeOptions from '@/utils/chart-options/tree'
import doubleBarOptions from '@/utils/chart-options/doubleBar'
import Dag from '@/components/CanvasComponent/flowDiagram'
import BreadcrumbExt from '@/components/BreadcrumbExt'
import OutputDialog from './dialog/index'
import OverflowTooltip from '@/components/OverflowTooltip'
import ReconnectingWebSocket from '@/utils/ReconnectingWebSocket'
import DownloadReport from './download/report'
import DownloadData from './download/data'
import { mapGetters, mapActions, mapState } from 'vuex'
import Confirm from '@/views/job-dashboard/board/Confirm'

export default {
  name: 'JobDetails',
  components: {
    IconHoverAndActive,
    Dag,
    BreadcrumbExt,
    OutputDialog,
    OverflowTooltip,
    DownloadReport,
    DownloadData,
    Confirm,
    Notes: () => import('./notes/index')
  },
  data() {
    return {
      jobId: this.$route.query.job_id,
      role: this.$route.query.role,
      partyId: this.$route.query.party_id,
      jobFrom: this.$route.query.from,
      summaryLoading: true,
      msgLoading: false,
      paramList: [],
      roleList: [],
      jobInfo: {},
      componentName: '',
      lastStatus: '',
      logLoading: false,
      dagInstance: null,
      graphOptions,
      treeOptions,
      doubleBarOptions,
      outputGraphOptions: graphOptions,
      paraLoading: false,
      DAGData: null,
      outputVisible: false,
      modelOutputType: '',
      outputTitle: '',
      currentTab: 'model',
      logWebsocket: null,
      timer: null,
      modelOutputShowing: true,
      dataOutputShow: true,
      noteHint: false,
      notePopover: false,
      defaultPropsForTree: { label: 'label', children: 'children' },
      treeUnfoldAll: false,
      treeRefresh: true,
      foldButtonForNote: true,
      foldPForNote: 'notes-content-p',
      parameterCount: 0,
      scrollTopPos: 0,
      refreshCheck: false,
      scrollHoldChange: false,
      breads: [],
      popover: [],
      downloadList: [],
      useLogic: false,
      variableMap: []
    }
  },
  computed: {
    ...mapGetters([
      'modelNameMap',
      'metricTypeMap',
      'icons',
      'evaluationInstances'
    ]),
    ...mapGetters('job', {
      oldJobId: 'jobId'
    }),
    ...mapState('job', ['job']),
    otherRoleList() {
      const final = JSON.parse(JSON.stringify(this.roleList))
      for (let i = 0; i < final.length; i++) {
        if (this.role === final[i].role.toLowerCase()) {
          final.splice(i, 1)
          i--
        }
      }
      return final
    },
    thisRoleList() {
      const final = JSON.parse(JSON.stringify(this.roleList))
      for (let i = 0; i < final.length; i++) {
        if (this.role !== final[i].role.toLowerCase()) {
          final.splice(i, 1)
          i--
        } else {
          for (let j = 0; j < final[i].datasetList.length; j++) {
            const val = final[i].datasetList[j]
            if (val.name.toString() !== this.partyId) {
              final[i].datasetList.splice(j, 1)
              j--
            }
          }
        }
      }
      let check = []
      for (const val of final) {
        for (const item of val.datasetList) {
          check.push(item.dataset)
        }
      }
      const len = check.length
      for (let i = 0; i < len; i++) {
        const item = check.splice(0, 1)
        for (const val of item) {
          check = check.concat(val.split(','))
        }
      }
      return check
    },
    showingRoleList() {
      const final = JSON.parse(JSON.stringify(this.thisRoleList))
      if (final.length <= 3) {
        return final
      } else {
        return final.slice(0, 3)
      }
    }
  },
  watch: {
    job: {
      handler(val) {
        if (val) {
          this.setData(val)
        }
      },
      immediate: true
    }
  },
  created() {
    if (this.$route.query.job_id !== this.oldJobId) {
      this.cleanJob()
    }
    if (!this.job || !this.isDone(this.job.status)) {
      this.initJobSocket()
    } else {
      this.summaryLoading = false
    }
  },
  mounted() {
  },
  updated() {
    const dom = document.getElementById('sectionWrapperScroll')
    if (this.refreshCheck) {
      dom.scrollTo(0, this.scrollTopPos)
    }
  },
  beforeDestroy() {
    this.closeWebsocket()
    clearInterval(this.timer)
  },
  beforeMount() {
    this.breads = [
      // { type: 'content', val: 'Job Overview', click: this.toHistory },
      { type: 'content', val: 'Dashboard', click: this.toDashboard },
      { type: 'content', val: 'Job detail' }
    ]
  },
  methods: {
    ...mapActions('job', ['cleanJob', 'updateJob']),
    toHistory() {
      this.toPrevPage('history')
    },
    toDashboard() {
      this.toPrevPage('dashboard')
    },
    // shouldShowPopover(item, id) {
    //   const ctx = document.getElementById('historyForDetail').getContext('2d')
    //   for (let i = 0; i < this.showingRoleList.length; i++) {
    //     const width = this.measureText(ctx, this.showingRoleList[i] || '', { font: (12 * 1.14) + 'px Arial' }).width
    //     const acWidth = parseInt(getComputedStyle(document.getElementById('spanPopOver' + i)).width.replace('px', ''))
    //     this.popover.splice(i, 1, acWidth > width)
    //   }
    // },
    // notesHint() {
    //   const cvs = document.getElementById('historyForDetail').getContext('2d')
    //   const width = this.measureText(cvs, this.jobInfo.notes || '', { size: 14, weight: 'bold' }).width
    //   const acWidth = parseInt(getComputedStyle(document.getElementById('notesP')).width.replace('px', ''))
    //   this.noteHint = width > (acWidth * 3) - 45
    // },
    measureText(ctx, text, style) {
      for (const key in style) {
        ctx[key] = style[key]
      }
      return ctx.measureText(text)
    },
    checkDataSetForOther(dataset) {
      return dataset.split(',')
    },
    toPrevPage(toPage) {
      // console.log(this.$route)
      let path = null
      if (!toPage) {
        if (this.jobFrom === 'Job overview') {
          path = '/history'
        } else if (this.jobFrom === 'Dashboard') {
          path = '/dashboard'
        }
      } else {
        if (toPage === 'history') {
          path = './history'
        } else {
          path = './dashboard'
        }
      }
      this.$router.push({
        path,
        query: { job_id: this.jobId, role: this.role, party_id: this.partyId }
      })
    },

    getGraphEchartInstance(echartInstance) {
      this.dagInstance = echartInstance
      let fnInterval = null
      const fn = () => {
        if (this.DAGData) {
          window.clearInterval(fnInterval)
          const { dataList, linksList } = graphChartHandler(this.DAGData)
          // console.log(this.DAGData)
          this.graphOptions.series[0].data = dataList
          this.graphOptions.series[0].links = linksList
          echartInstance.setOption(this.graphOptions, true)
          echartInstance.on('click', { dataType: 'node' }, nodeData => {
            // console.log(nodeData)
            this.clickComponent(nodeData.name, nodeData.dataIndex, nodeData.data.componentType)
          })
        }
      }
      fnInterval = window.setInterval(fn, 100)
    },

    getDagInstance(data) {
      if (
        data.model === this.modelNameMap.correlation ||
        data.model === this.modelNameMap.evaluation) {
        this.dataOutputShow = false
      } else {
        this.dataOutputShow = true
      }
      this.clickComponent(data.name, data.dataIndex, data.model, data.disable, data.status)
    },

    clickComponent(component_name, dataIndex, componentType, disable, status) {
      let couldBeNeedRefresh = false
      if (component_name === this.componentName) {
        couldBeNeedRefresh = this.lastStatus !== status
      }
      this.lastStatus = status
      this.componentName = component_name
      this.lastComponentName = component_name
      this.modelOutputType = componentType || ''
      this.outputTitle = this.modelOutputType ? `${componentType}: ${component_name}` : ''
      // this.clickComponentChangeStyle(this.graphOptions.series[0].data, dataIndex)
      // this.dagInstance.setOption(this.graphOptions)
      if (!disable) {
        this.getParams(component_name)
      } else {
        this.paramList = [{
          label: 'NO DATA',
          bold: true
        }]
        this.parameterCount = 0
        this.componentName = ''
      }
      if (couldBeNeedRefresh) {
        this.$refs['outputDialog'].refresh()
      }
    },
    clickComponentChangeStyle(obj, dataIndex) {
      obj.forEach(item => {
        // item.itemStyle = {}
        item.label = item.sourceLabel
      })
      // obj[dataIndex].itemStyle = { color: '#494ece' }
      obj[dataIndex].label = { color: '#fff', backgroundColor: '#494ece' }
    },
    visualization() {
      if (this.jobInfo.status === 'running' && this.lastComponentName === this.componentName) {
        this.$refs.outputDialog.refresh()
      }
      this.outputVisible = true
    },
    closeWebsocket() {
      // console.log('close Websocket')
      if (this.logWebsocket) {
        this.logWebsocket.close()
        this.logWebsocket = null
      }
      if (this.ws) {
        this.ws.close()
      }
    },
    getParams(component_name) {
      const vm = this
      const para = {
        job_id: this.jobId,
        role: this.role,
        party_id: this.partyId,
        component_name
      }
      this.paraLoading = true
      this.parameterCount = 0
      getComponentPara(para).then(res => {
        this.paraLoading = false
        const d = JSON.parse(res.data)
        // this.paraData = JSON.stringify(res.data, null, 2)
        const checkLevels = function(obj) {
          const finalParameter = []
          for (const key in obj) {
            const midObj = {}
            if (obj[key] === null) {
              midObj.label = key + ': null'
              vm.parameterCount++
            } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
              midObj.label = key
              midObj.children = checkLevels(obj[key])
            } else {
              if (Array.isArray(obj[key])) {
                let hasObject = false
                for (const val of obj[key]) {
                  if (typeof val === 'object' && val) {
                    hasObject = true
                    break
                  }
                }
                if (hasObject) {
                  midObj.label = key + ': ['
                  const middle = {}
                  let index = 0
                  for (const val of obj[key]) {
                    middle[index] = val
                    index++
                  }
                  midObj.children = checkLevels(middle)
                  midObj.children.push({ label: ']' })
                } else {
                  midObj.label = key + ': [' + obj[key].join(', ') + ']'
                }
              } else {
                midObj.label = key + ': ' + obj[key].toString()
              }
              vm.parameterCount++
            }
            if (key === 'module') {
              finalParameter.unshift(midObj)
            } else {
              finalParameter.push(midObj)
            }
          }
          return finalParameter
        }
        this.paramList = checkLevels(d)
      }).catch(() => {
        this.paraLoading = false
        this.paramList = [{
          label: 'NO DATA',
          bold: true
        }]
        this.parameterCount = 0
      })
    },
    formatParams(key, value, level, list) {
      if (value && value.constructor === Object) {
        list.push({
          level,
          isObjKey: true,
          value: key
        })
        Object.entries(value).forEach(item => {
          const subKey = item[0]
          const subValue = item[1]
          this.formatParams(subKey, subValue, level + 1, list)
        })
      } else {
        if (key === 'module') {
          key = 'Module'
        }
        if (Array.isArray(value)) {
          value = JSON.stringify(value).replace(/\"/g, '')
        }
        if (value === null) {
          value = 'null'
        }
        if (value === '') {
          value = `""`
        }
        list.push({
          level,
          isObjKey: false,
          value: `${key}: ${value}`
        })
      }
    },
    unfoldAll() {
      const vm = this
      this.treeUnfoldAll = !this.treeUnfoldAll
      this.treeRefresh = false
      this.$nextTick(() => {
        vm.treeRefresh = true
      })
    },
    foldForNotes() {
      this.foldButtonForNote = !this.foldButtonForNote
      this.foldPForNote = !this.foldPForNote
    },
    sectionMove() {
      if (this.scrollHoldChange) {
        this.scrollTopPos = document.getElementById('sectionWrapperScroll').scrollTop
        this.refreshCheck = false
      }
    },
    sectionWheel() {
      this.scrollTopPos = document.getElementById('sectionWrapperScroll').scrollTop
      this.refreshCheck = false
    },
    closeDialog() {
      this.outputVisible = false
    },
    initJobSocket() {
      if (!this.ws) {
        const { jobId, role, partyId } = this
        if (!jobId || !role || !partyId) {
          console.warn(`Missing required parameters`)
        }
        this.ws = new ReconnectingWebSocket(
          `/websocket/progress/${jobId}/${role}/${partyId}`
        )
        this.summaryLoading = true
        this.ws.addEventListener('message', event => {
          this.summaryLoading = false
          let data
          try {
            data = JSON.parse(event.data)
          } catch (error) {
            this.ws.close()
            data = null
            return
          }
          this.handleMessage(data)
        })
      }
      return this.ws
    },
    restartJobWebsocket(name) {
      retryJob({
        job_id: this.jobId,
        component_name: name
      }).then(res => {
        this.initJobSocket()
      })
    },
    isDone(status) {
      return ['success', 'complete', 'failed', 'canceled'].includes(status)
    },
    handleMessage(data) {
      if (!data) {
        return
      }
      this.updateJob(data)
      this.summaryLoading = false
      this.setData(data)
      if (this.isDone(data.status)) {
        if (this.ws) {
          this.ws.close()
          this.ws = ''
        }
      }
    },
    setData(data) {
      const { summary_date: { job, dataset: _dataset }, dependency_data } = data
      if (_dataset) {
        this.roleList = this.transformDataset(_dataset)
      }
      if (job) {
        this.jobInfo = this.transformJobInfo(job)
        // this.$nextTick(() => {
        //   this.notesHint()
        // })
      }
      if (dependency_data) {
        this.DAGData = this.transformDAGData(dependency_data)
      }
    },
    transformDataset({ roles, dataset }) {
      return Object.keys(roles).map(role => {
        const datasetList = roles[role].map(name => {
          let set = ''
          if (dataset[role]) {
            set = Object.values(dataset[role][name]).join(', ')
          }
          return {
            name,
            dataset: set
          }
        })
        return {
          role: role.toUpperCase(),
          datasetList
        }
      })
    },
    transformJobInfo(job) {
      return {
        submmissionTime: job.fCreateTime ? parseTime(new Date(job.fCreateTime)) : '',
        startTime: job.fStartTime ? parseTime(new Date(job.fStartTime)) : '',
        endTime: job.fEndTime ? parseTime(new Date(job.fEndTime)) : '',
        duration: job.fElapsed ? formatSeconds(job.fElapsed) : '',
        status: job.fStatus ? job.fStatus : '',
        notes: job.fDescription ? job.fDescription : ''
      }
    },
    transformDAGData(data) {
      return data
    },
    handleDownloadDialog(command) {
      if (command === 'report') {
        this.handleDownloadReport()
      } else if (command === 'data') {
        this.handleDownloadData()
      } else if (command === 'model') {
        this.handleDownloadModel()
      }
    },
    handleFilterLogic(filters) {
      const res = this.$refs.outputDialog.handleFilterLogic(filters)
      this.$refs.downloadReport.logicError(res)
    },
    handleDownloadModel() {
      if (this.$refs.downloadReport) {
        // todo: 获取展示名称以及展示数据。
        // 筛选当前的内容。
        const fileList = this.$refs['outputDialog'].getNames()
        const res = []
        fileList.forEach((item, index) => {
          const mid = item.split('.')
          res.push({
            type: mid[1],
            filename: item,
            checked: true
          })
        })
        this.downloadList = res
        this.useLogic = false
        const map = []
        this.$refs['outputDialog'].getVariableMap().forEach((item) => {
          map.push({ variable: item })
        })
        this.variableMap = map
        this.$refs.downloadReport.show()
      }
    },
    handleDownloadReport() {
      if (this.$refs.downloadReport) {
        const fileList = this.$refs['outputDialog'].getNames()
        const res = []
        fileList.forEach((item, index) => {
          const mid = item.split('.')
          res.push({
            type: mid[1],
            filename: item,
            checked: true
          })
        })
        this.downloadList = res
        const filterReq = {}
        if (this.modelOutputType.toLowerCase().match(new RegExp('(' + ['selection'].join('|') + ')'))) {
          const hasIv = this.$refs['outputDialog'].hasIv()
          if (this.role === 'host') {
            filterReq.anonym_index = true
          }
          if (this.role === 'guest' && hasIv) {
            filterReq.iv = {
              variableType: 'float'
            }
          }
        }
        this.useLogic = Object.keys(filterReq).length > 0 ? filterReq : false
        const map = []
        this.$refs['outputDialog'].getVariableMap().forEach((item) => {
          map.push({ variable: item })
        })
        this.variableMap = map
        this.$refs.downloadReport.show()
      }
    },
    transformDownloadList(list) {
      return list.map(({ name, type }) => {
        return {
          filename: `${name}.${type}`,
          name,
          type,
          checked: true
        }
      })
    },
    handleBeforeDownload(args) {
      this.$nextTick(() => {
        this.$refs['outputDialog'].allSteps(args)
      })
    },
    handleDownloadData() {
      getComponentCommand({
        job_id: this.jobId,
        role: this.role,
        party_id: this.partyId,
        component_name: this.componentName
      }).then(response => {
        this.$refs.downloadData && this.$refs.downloadData.show(response.data)
      })
    },
    jobRetry(name) {
      const vm = this
      const confirmText = [`The job will continue from where it ${this.jobInfo.status}`, 'it may take few seconds to  update job status.']
      this.$refs.confirm
        .confirm(...confirmText)
        .then(() => {
          vm.restartJobWebsocket(name)
        })
    },
    downloadFile(res) {
      this.$refs.downloadReport.downloadFiles(res, this.jobId + '_' + this.componentName)
    },
    downloadJobConfig(type) {
      if (!(this.role.toLowerCase() === 'arbiter' && type === 'runtime')) {
        jobDownload({
          jobId: this.jobId,
          role: this.role,
          partyId: this.partyId,
          type
        })
      }
    }
  }
}
</script>

<style lang="scss">
  @import "../../styles/details";
  .confirm-dialog {
    .el-dialog {
      height: auto !important;
      .el-dialog__body {
        height: auto !important;
        padding: 30px 20px;
      }
    }
  }
  .download-link {
    font-size: 12px;
    color: #4159D1;
    cursor: pointer;
    text-decoration: underline;
    font-weight: bold;
  }
  .disable-color {
    color: #c6c8cc;
    cursor: default;
  }
</style>
