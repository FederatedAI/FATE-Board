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
              <div class="prop-content notes-content">
                <p id="notesP" :class="{'notes-content-fold': foldPForNote, 'notes-content-unfold': !foldPForNote}">{{ jobInfo.notes }}</p>
              </div>
              <span v-if="noteHint" class="notes-can-fold" @click="foldForNotes">{{ foldButtonForNote ? 'unfold' : 'fold' }}</span>
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
                <el-tooltip v-for="(item, index) in showingRoleList" :key="index" :content="item" :disabled="popover[index]" placement="right">
                  <p :id="'spanPopOver' + index" class="prop-dataset-item">{{ item }}</p>
                </el-tooltip>
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
                        >{{ item.role }}</p>
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
                <dag ref="dagForJobFlow" :dag-info="DAGData" @choose="getDagInstance"/>
              </div>
            </div>

            <div v-loading="paraLoading" class="para-wrapper flex flex-col space-between">
              <div class="flex flex-col flex-start para-warpper-content" style="width:100%;">
                <h4 class="para-title">Parameter({{ parameterCount }})</h4>
                <div v-loading="msgLoading" class="msg bg-dark">
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
    <el-dialog
      :visible.sync="outputVisible"
      :title="outputTitle"
      :close-on-click-modal="false"
      :show-close="false"
      :fullscreen="fullscreen"
      :modal-append-to-body="false"
      width="80%"
      top="70px"
      @close="initOutput"
    >
      <div class="dialog-icons flex flex-center">
        <icon-hover-and-active
          :class-name="'img-wrapper'"
          :default-url="icons.normal[fullscreen?'offscreen':'fullscreen']"
          :hover-url="icons.hover[fullscreen?'offscreen':'fullscreen']"
          :active-url="icons.active[fullscreen?'offscreen':'fullscreen']"
          @clickFn="dialogFullScreen"
        />
        <icon-hover-and-active
          :class-name="'img-wrapper'"
          :default-url="icons.normal.close"
          :hover-url="icons.hover.close"
          :active-url="icons.active.close"
          @clickFn="outputVisible = false"
        />
      </div>
      <div class="tab-bar flex">
        <div v-if="modelOutputShowing" :class="{'tab-btn-active':currentTab === 'model'}" class="tab-btn" @click="switchLogTab('model')">
          <span class="text">model output</span>
        </div>
        <div v-if="dataOutputShow" :class="{'tab-btn-active':currentTab === 'data'}" class="tab-btn" @click="switchLogTab('data')">
          <span class="text">data output</span>
        </div>
        <div :class="{'tab-btn-active':currentTab === 'log'}" class="tab-btn" @click="switchLogTab('log')">
          <span class="text">log</span>
        </div>
      </div>
      <section
        v-loading="metricLoading && modelLoading"
        id="sectionWrapperScroll"
        :style="{height:fullscreen?'calc(100vh - 130px)': 'calc(100% - 48px)'}"
        class="section-wrapper"
        style="padding: 0 42px 24px 48px;margin-bottom: 0;overflow: auto;"
        @mousedown="scrollHoldChange=true"
        @mouseup="scrollHoldChange=false"
        @mousemove="sectionMove"
        @mousewheel="sectionWheel">
        <!-- scroll事件监听内容 -->
        <!--<h3 class="section-title">Visualization</h3>-->
        <div class="section-view" style="padding: 0">

          <div v-show="currentTab === 'model'" class="tab">
            <model-output
              ref="dialog"
              :metric-output-list="metricOutputList"
              :evaluation-output-list="evaluationInstances"
              :model-summary-data="modelSummaryData"
              :is-full-screen="fullscreen"
              :model-output-type="modelOutputType"
              :role="role"
              :model-output="modelOutputData"
              :is-no-metric-output="isNoMetricOutput"
              :is-no-model-output="isNoModelOutput"
              :requested="requested"
              :need-request="needRequest"
              @refresh="refreshing"
            />
          </div>
          <div v-show="currentTab === 'data'">
            <data-output ref="dataoutputdialog" :t-header="dataOutputHeader" :t-body="dataOutputBody" :no-data="dataOutputNoData"/>
          </div>
          <div v-show="currentTab === 'log'" ref="logView">
            <ul
              :style="{height:fullscreen?'75vh':'63vh'}"
              class="log-list"
              @mousewheel="logOnMousewheel"
            >
              <li v-for="(log,index) in logList" :key="index" class="flex">
                <span class="num">{{ log.lineNum }}</span>
                <span>{{ log.content }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </el-dialog>
    <canvas v-show="false" id="historyForDetail" width="1" height="1" style="width:1px;height:1px"/>
  </div>
</template>

<script>
import { parseTime, formatSeconds, initWebSocket } from '@/utils'
import { getJobDetails, getDAGDpencencies, getComponentPara, queryLog } from '@/api/job'
import { getMetrics, getMetricData, getDataOutput, getModelOutput } from '@/api/chart'
import EchartContainer from '@/components/EchartContainer'
import IconHoverAndActive from '@/components/IconHoverAndActive'
import graphChartHandler from '@/utils/vendor/graphChartHandler'
import modelOutputDataHandler from '@/utils/vendor/modelOutputHandler'
import metricDataHandle from '@/utils/vendor/metricOutputHandler'
import ModelOutput from './ModelOutput'
import DataOutput from './DataOutput'
import graphOptions from '@/utils/chart-options/graph'
// import stackBarOptions from '@/utils/chart-options/stackBar'
import treeOptions from '@/utils/chart-options/tree'
// import KSOptions from '@/utils/chart-options/KS'
import doubleBarOptions from '@/utils/chart-options/doubleBar'
import Dag from '@/components/CanvasComponent/flowDiagram'
import BreadcrumbExt from '@/components/BreadcrumbExt'

// import axios from 'axios'
import { mapGetters } from 'vuex'

export default {
  name: 'JobDetails',
  components: {
    EchartContainer,
    ModelOutput,
    DataOutput,
    IconHoverAndActive,
    Dag,
    BreadcrumbExt
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
      fullscreen: false,
      roleList: [],
      jobInfo: {},
      componentName: '',
      logLoading: false,
      dagInstance: null,
      graphOptions,
      treeOptions,
      doubleBarOptions,
      outputGraphOptions: graphOptions,
      paraLoading: false,
      DAGData: null,
      modelSummaryData: {
        tHeader: [],
        tBody: []
      },
      outputVisible: false,
      metricOutputList: [],
      modelOutputType: '',
      modelOutputData: null,
      dataOutputHeader: [],
      dataOutputBody: [],
      dataOutputNoData: false,
      isNoMetricOutput: false,
      metricLoading: false,
      modelLoading: false,
      isNoModelOutput: false,
      outputTitle: '',
      currentTab: 'model',
      logList: [],
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
      requested: 0,
      needRequest: 0,
      scrollTopPos: 0,
      refreshCheck: false,
      scrollHoldChange: false,
      breads: [],
      popover: []
    }
  },
  computed: {
    ...mapGetters([
      'modelNameMap',
      'metricTypeMap',
      'icons',
      'evaluationInstances'
    ]),
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
  mounted() {
    const para = {
      job_id: this.jobId,
      role: this.role,
      party_id: this.partyId
    }
    this.getDatasetInfo()
    getDAGDpencencies(para).then(res => {
      this.DAGData = res.data
    })
    this.timer = setInterval(() => {
      let finish = true
      for (const item of this.DAGData.component_list) {
        if (!item.status || !item.status.match(/success|failed/i)) {
          finish = false
          break
        }
      }
      if (!this.jobInfo.status.match(/success|failed/i) || !finish) {
        this.getDatasetInfo()
        getDAGDpencencies(para).then(res => {
          this.DAGData = res.data
        })
      } else {
        clearInterval(this.timer)
      }
    }, 5000)
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
      { type: 'content', val: 'Job Overview', click: this.toHistory },
      { type: 'content', val: 'Dashboard', click: this.toDashboard },
      { type: 'content', val: 'Job detail' }
    ]
  },
  methods: {
    toHistory() {
      this.toPrevPage('history')
    },
    toDashboard() {
      this.toPrevPage('dashboard')
    },
    shouldShowPopover(item, id) {
      const ctx = document.getElementById('historyForDetail').getContext('2d')
      for (let i = 0; i < this.showingRoleList.length; i++) {
        const width = this.measureText(ctx, this.showingRoleList[i] || '', { font: (12 * 1.14) + 'px roboto_regular' }).width
        const acWidth = parseInt(getComputedStyle(document.getElementById('spanPopOver' + i)).width.replace('px', ''))
        this.popover.splice(i, 1, acWidth > width)
      }
    },
    notesHint() {
      const cvs = document.getElementById('historyForDetail').getContext('2d')
      const width = this.measureText(cvs, this.jobInfo.notes || '', { size: 14, weight: 'bold' }).width
      const acWidth = parseInt(getComputedStyle(document.getElementById('notesP')).width.replace('px', ''))
      this.noteHint = width > (acWidth * 3) - 45
    },
    measureText(ctx, text, style) {
      for (const key in style) {
        ctx[key] = style[key]
      }
      return ctx.measureText(text)
    },
    checkDataSetForOther(dataset) {
      return dataset.split(',')
    },
    getDatasetInfo(refresh = false) {
      const vm = this
      const para = {
        job_id: this.jobId,
        role: this.role,
        party_id: this.partyId
      }
      getJobDetails(para).then(res => {
        this.summaryLoading = false
        const roleList = []
        const { job, dataset: _dataset } = res.data
        if (_dataset) {
          const { roles, dataset } = _dataset
          Object.keys(roles).forEach(role => {
            const datasetList = []
            roles[role].forEach(name => {
              let set = ''
              if (dataset[role]) {
                set = Object.values(dataset[role][name]).join(', ')
              }
              datasetList.push({
                name,
                dataset: set
              })
            })
            roleList.push({
              role: role.toUpperCase(),
              datasetList
            })
            this.roleList = roleList
          })
        }
        if (job) {
          this.jobInfo = {
            submmissionTime: job.fCreateTime ? parseTime(new Date(job.fCreateTime)) : '',
            startTime: job.fStartTime ? parseTime(new Date(job.fStartTime)) : '',
            endTime: job.fEndTime ? parseTime(new Date(job.fEndTime)) : '',
            duration: job.fElapsed ? formatSeconds(job.fElapsed) : '',
            status: job.fStatus ? job.fStatus : '',
            notes: job.fDescription ? job.fDescription : ''
          }
          this.$nextTick(() => {
            vm.notesHint()
            vm.shouldShowPopover()
          })
        }
      })
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
      if (data.model === this.modelNameMap.correlation || data.model === this.modelNameMap.evaluation) {
        this.dataOutputShow = false
      } else {
        this.dataOutputShow = true
      }
      this.clickComponent(data.name, data.dataIndex, data.model, data.disable)
    },

    clickComponent(component_name, dataIndex, componentType, disable) {
      this.componentName = component_name
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
        this.componentName = false
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
      this.initOutput()
      this.getMetrics(this.componentName)
      this.getModelOutput(this.componentName)
      // this.getDataOutput(this.componentName)
      this.outputVisible = true
    },
    initOutput() {
      this.metricOutputList = []
      // this.evaluationOutputList = []
      this.$store.dispatch('SetCurveInstances', [])
      if (this.$refs.dialog) {
        this.$refs.dialog.clearEchartInstance()
      }
      if (this.$refs.dataoutputdialog) {
        this.$refs.dataoutputdialog.redefinedPage()
      }
      this.isNoMetricOutput = false
      this.isNoModelOutput = false
      this.metricLoading = false
      this.modelLoading = false
      this.modelOutputData = null
      this.fullscreen = false
      this.modelSummaryData = {
        tHeader: [],
        tBody: []
      }
      this.dataOutputHeader = []
      this.dataOutputBody = []
      this.dataOutputNoData = false
      this.currentTab = 'model'
      this.logList = []
      this.$store.dispatch('InitModelOutput')
      this.closeWebsocket()
      if (this.$refs.dialog) this.$refs.dialog.isTreeBtnLikeLine = true
    },
    switchLogTab(tab) {
      this.currentTab = tab
      if (tab === 'model') {
        this.$nextTick(() => {
          this.$refs.dialog.EchartInstancesResize()
        })
      }
      if (tab === 'data' && this.dataOutputHeader.length === 0) {
        this.getDataOutput(this.componentName)
      }
      if (tab === 'log' && !this.logWebsocket) {
        this.logWebsocket = initWebSocket(`/log/${this.jobId}/${this.role}/${this.partyId}/${this.componentName}/default`, res => {
          // console.log('log websocket success')
        }, res => {
          // console.log('websocket data:', JSON.parse(res.data))
          const data = JSON.parse(res.data)
          if (Array.isArray(data)) {
            if (data.length > 0) {
              this.logList = [...this.logList, ...data]
            }
          } else {
            this.logList.push(data)
          }
        })
      }
    },
    logOnMousewheel(e) {
      // console.log(e.target.parentNode.parentNode.scrollTop)
      // console.log(e.wheelDelta)
      const topLog = this.logList[0]
      if (!topLog) {
        return
      }
      const end = topLog.lineNum - 1
      if (end > 0) {
        const maxLoadingPage = 1000
        if (this.$refs['logView'].scrollTop === 0 && (e.wheelDelta > 0 || e.detail > 0)) {
          const begin = end - maxLoadingPage > 1 ? end - maxLoadingPage : 1
          if (!this.logLoading) {
            this.logLoading = true

            const fn = () => {
              queryLog({
                componentId: this.componentName,
                job_id: this.jobId,
                role: this.role,
                party_id: this.partyId,
                begin,
                end
              }).then(res => {
                const newLogs = []
                res.data.map(log => {
                  newLogs.push(log)
                })
                this.logList = [...newLogs, ...this.logList]
                this.logLoading = false
              }).catch(() => {
                this.logLoading = false
              })
            }

            window.setTimeout(fn, 1000)
          }
        }
      }
    },
    closeWebsocket() {
      // console.log('close Websocket')
      if (this.logWebsocket) {
        this.logWebsocket.close()
        this.logWebsocket = null
      }
    },
    dialogFullScreen() {
      const vm = this
      this.fullscreen = !this.fullscreen
      setTimeout(() => {
        vm.$refs.dialog.EchartInstancesResize()
      }, 100)
      this.$nextTick(() => {
        const m = vm.$refs['dialog']
        if (Array.isArray(m)) {
          for (const val of m) {
            val.resizeDialogContent()
          }
        } else {
          m.resizeDialogContent()
        }
      })
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
        list.push({
          level,
          isObjKey: false,
          value: `${key}: ${value}`
        })
      }
    },
    getMetrics(component_name) {
      const vm = this
      this.metricLoading = true
      const para = {
        job_id: this.jobId,
        role: this.role,
        party_id: this.partyId,
        component_name
      }
      getMetrics(para).then(res => {
        this.metricLoading = false
        const data = res.data
        if (data && Object.keys(data).length > 0) {
          vm.needRequest = 0
          vm.requested = 0
          const evaluationOutputList = []
          Object.keys(data).forEach((metric_namespace, nameSpaceIndex) => {
            vm.needRequest += data[metric_namespace].length
            data[metric_namespace].forEach((metric_name, nameIndex) => {
              const metricDataPara = {
                job_id: this.jobId,
                role: this.role,
                party_id: this.partyId,
                component_name,
                metric_namespace,
                metric_name
              }
              getMetricData(metricDataPara).then(res => {
                const { data, meta } = res.data
                if (data && meta) {
                  const { metric_type, unit_name, curve_name, pair_type, thresholds } = meta
                  if (metric_type === this.metricTypeMap.RSA) {
                    this.modelOutputShowing = false
                    this.dataOutputShow = false
                    this.switchLogTab('data')
                  } else if (metric_type) {
                    metricDataHandle({
                      metricOutputList: this.metricOutputList,
                      modelSummaryData: this.modelSummaryData,
                      modelOutputType: this.modelOutputType,
                      evaluationOutputList,
                      data,
                      meta,
                      metric_type,
                      metric_namespace,
                      metric_name,
                      unit_name,
                      curve_name,
                      pair_type,
                      thresholds,
                      role: this.role,
                      party_id: this.partyId
                    })
                    vm.requested++
                  }
                }
              })
              if (nameSpaceIndex === Object.keys(data).length - 1 && nameIndex === data[metric_namespace].length - 1) {
                setTimeout(() => {
                  const evaluationFlags = []
                  const arr = []
                  evaluationOutputList.forEach(item => {
                    if (item.type && arr.indexOf(item.type) === -1) {
                      arr.push(item.type)
                    }
                  })
                  this.$store.dispatch('SetCurveInstances', evaluationOutputList)
                  const filterArr = ['ROC', 'K-S', 'Lift', 'Gain', 'Precision Recall', 'Accuracy'].filter(type => {
                    return arr.indexOf(type) !== -1
                  })
                  filterArr.forEach((item, index) => {
                    evaluationFlags.push(index === 0)
                  })
                  evaluationFlags[0] = true
                  this.$store.dispatch('SetCvFlags', evaluationFlags)
                  // evaluationOutputList.forEach(item => {
                  //   if (item.type === 'Precision Recall') {
                  //     console.log(item)
                  //   }
                  // })
                }, 1200)
              }
            })
          })
        } else {
          this.metricLoading = false
          this.isNoMetricOutput = true
        }
      })
    },
    getDataOutput(component_name) {
      const para = {
        job_id: this.jobId,
        role: this.role,
        party_id: this.partyId,
        component_name
      }
      getDataOutput(para).then(res => {
        const header = []
        const body = []
        if (res.data && res.data.meta && res.data.meta.header) {
          res.data.meta.header.forEach(item => {
            header.push({
              prop: item.replace('.', ''),
              label: item
            })
          })
          res.data.data.forEach(oldRow => {
            const newRow = {}
            header.forEach((item, index) => {
              let value = oldRow[index]
              if (typeof value === 'object') {
                value = JSON.stringify(value)
              }
              newRow[item.prop] = value && value.toString()
            })
            body.push(newRow)
          })
          if (header.length === 0 || body.length === 0) {
            this.dataOutputNoData = true
          } else {
            this.dataOutputHeader = header
            this.dataOutputBody = body
          }
        } else {
          this.dataOutputNoData = true
        }
      })
    },
    getModelOutput(component_name) {
      this.modelLoading = true
      const para = {
        job_id: this.jobId,
        role: this.role,
        party_id: this.partyId,
        component_name
      }
      getModelOutput(para).then(res => {
        this.modelLoading = false
        // this.modelOutputType = res.data.meta ? res.data.meta.module_name : ''
        // this.outputTitle = this.modelOutputType || ''
        // if (this.outputTitle) {
        //   this.outputTitle += ': '
        // }
        // this.outputTitle += component_name
        const responseData = res.data.data ? res.data.data : null
        this.modelOutputData = modelOutputDataHandler({
          outputType: this.modelOutputType,
          role: this.role,
          partyId: this.partyId,
          responseData,
          isNoModelOutput: this.isNoModelOutput
        })

        // for tree id start
        if (this.modelOutputData && this.modelOutputData.treeOptions) {
          this.modelOutputData.treeOptions.series.label.formatter = (params) => {
            let matchs = params.name.match(/ID:\s*[0-9]*/)
            matchs = matchs ? matchs[0] : null
            return '{idStyle|' + matchs + '}' + '{checkStyle|\n  }' + params.name.replace(matchs, '')
          }
          this.modelOutputData.treeOptions.series.label.rich = this.modelOutputData.treeOptions.series.label.rich || {}
          this.modelOutputData.treeOptions.series.label.rich.idStyle = {
            width: 56,
            height: 16,
            lineHeight: 16,
            fontSize: 10,
            borderRadius: [5, 5, 0, 0],
            borderWidth: 1,
            borderColor: '#bbbbc8',
            backgroundColor: '#E8E8EF',
            color: '#7f7d8e',
            verticalAlign: 'middle',
            shadowColor: '#bbbbc8',
            shadowBlur: 0,
            shadowOffsetY: 0
          }
          this.modelOutputData.treeOptions.series.label.rich.checkStyle = {
            lineHeight: 3,
            fontSize: 3,
            width: 56
          }
          const pad = this.modelOutputData.treeOptions.series.label.padding
          if (pad.length === 2) {
            pad[2] = pad[0]
            pad[3] = pad[1]
            pad[0] = -16
          }
          this.modelOutputData.treeOptions.series.label.padding = pad
          this.modelOutputData.treeOptions.series.top = '12%'
        }
        // for tree id end

        this.isNoModelOutput = Boolean(this.modelOutputData.isNoModelOutput)
      }).catch(() => {
        this.modelLoading = false
        this.isNoModelOutput = true
      })
    },
    refreshing() {
      this.scrollTopPos = document.getElementById('sectionWrapperScroll').scrollTop
      this.refreshCheck = true
      this.visualization()
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
    }
  }
}
</script>

<style lang="scss">
  @import "../../styles/details";
</style>
