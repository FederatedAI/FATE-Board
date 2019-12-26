<template>
  <div class="dashboard-container bg-dark app-container">

    <h3 v-if="!showingAllLog" class="app-title flex space-between">
      <span>Dashboard</span>
      <!--<p>Job: <span class="text-primary pointer" @click="toDetails()">{{ jobId }}</span></p>-->
      <p>Job: <span>{{ jobId }}</span></p>
    </h3>

    <el-row v-if="!showingAllLog" :gutter="24" class="dash-board-list">
      <el-col :span="8">
        <div v-loading="datasetLoading" class="col dataset-info shadow">

          <h3 class="list-title" style="margin-bottom: 24px;">DATASET INFO</h3>

          <el-row v-for="(row,index) in datasetList" :key="index" :gutter="4" class="dataset-row">
            <el-col :span="6" :offset="2">
              <div class="dataset-item">
                <p class="name dataset-title">{{ row.role }}</p>
                <p v-if="row.options.length===1" class="value">{{ row.roleValue }}</p>
                <el-select v-else v-model="row.roleValue">
                  <el-option
                    v-for="(option,index) in row.options"
                    :key="index"
                    :value="option.value"
                    :label="option.label"
                  />
                  {{ row.roleValue }}
                </el-select>
              </div>
            </el-col>

            <el-col :span="14">
              <div class="dataset-item">
                <p class="name">DATASET</p>
                <p class="value">
                  <el-tooltip
                    popper-class="tooltip-content"
                    placement="top">
                    <div slot="content">
                      <span v-for="(values, valIndex) in combinaTooltip(row)" :key="valIndex">
                        {{ values }} <br v-if="valIndex !== (combinaTooltip(row).length - 1)">
                      </span>
                    </div>
                    <span class="toolContent">{{ row.datasetData?Object.values(row.datasetData[row.roleValue]).join(', ') : '' }}</span>
                  </el-tooltip>
                </p>
              </div>
            </el-col>

          </el-row>

        </div>
      </el-col>
      <el-col :span="8">
        <div class="col job flex-center justify-center shadow pos-r">
          <h3 class="list-title">JOB</h3>

          <div v-if="jobStatus==='failed' || jobStatus==='success'" class="job-end-container flex flex-col flex-center">
            <!--<i-->
            <!--v-if="jobStatus === 'failed'"-->
            <!--class="el-icon-circle-close job-icon"-->
            <!--style="color: #ff6464;"/>-->
            <img
              v-if="jobStatus === 'failed'"
              :src="icons.normal.failed"
              alt=""
              class="job-icon">
            <!--<i-->
            <!--v-else-if="jobStatus === 'success'"-->
            <!--class="el-icon-circle-check job-icon"-->
            <!--style="color: #24b68b;"/>-->
            <img
              v-if="jobStatus === 'success'"
              :src="icons.normal.success"
              alt=""
              class="job-icon">
            <ul class="job-info flex space-around flex-wrap w-100">
              <li>
                <p class="name">status</p>
                <p class="value">{{ jobStatus }}</p>
              </li>
              <li v-if="elapsed">
                <p class="name">duration</p>
                <p class="value">{{ elapsed }}</p>
              </li>
              <li v-if="AUC">
                <p class="name overflow-ellipsis">best score(AUC)</p>
                <p class="value">{{ AUC }}</p>
              </li>
              <li v-if="ratio">
                <p class="name">ratio</p>
                <p class="value">{{ ratio }}</p>
              </li>
              <li v-if="count">
                <p class="name">count</p>
                <p class="value">{{ count }}</p>
              </li>
            </ul>
          </div>

          <div v-else-if="jobStatus==='waiting' || jobStatus==='running'" class="echarts-container">
            <!-- <div v-if="elapsed" class="elapsed">
              <p class="elapsed-title">elapsed</p>
              <p class="elapsed-time text-primary">{{ elapsed }}</p>
            </div>
            <echart-container :class="'echarts'" :options="jobOptions" @getEchartInstance="getJobEchartInstance"/> -->
            <panel :msg="jobDetail" class="echarts"/>
          </div>

          <div class="btn-wrapper flex flex-col flex-center pos-a">
            <el-button
              ref="jobDetails"
              :style="{background:butBackground, color:butFontColor}"
              type="primary"
              style="position:relative"
              round
              @mouseover.native="overButton"
              @mouseout.native="outButton"
              @mousedown.native="clickButton"
              @click="toDetails(jobId)"
            >view this job
              <img :src="butImage" alt="" style="width:11%">
            </el-button>
            <p
              v-show="jobStatus==='running' || jobStatus==='waiting'"
              class="kill text-primary pointer"
              @click="handleKillJob(jobStatus==='running'?'kill':'cancel')">{{ jobStatus==='running'?'kill':'cancel'
              }}
            </p>
            <!--<el-button-->
            <!--v-show="jobStatus==='running'"-->
            <!--type="primary"-->
            <!--round-->
            <!--@click="killJob"-->
            <!--&gt;KILL-->
            <!--</el-button>-->
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div v-loading="false" class="col graph flex-center justify-center shadow">
          <div class="flex flex-row space-between">
            <h3 class="list-title">GRAPH</h3>
            <icon-hover-and-active
              :class-name="'img-wrapper'"
              :default-url="icons.normal['fullscreen']"
              :hover-url="icons.hover['fullscreen']"
              :active-url="icons.active['fullscreen']"
              @clickFn="showGraph = true"
            />
          </div>
          <div
            v-if="DAGData"
            class="wrapper w-100 pointer"
            style="min-width:400px;">
            <!--class="wrapper w-100"-->
            <!--style="min-width:400px;">-->
            <!-- <echart-container
              :class="'echarts'"
              :options="graphOptions"
              @getEchartInstance="getGraphEchartInstance"
            /> -->
            <dag :id="'graphCanvas'" :msg="DAGData" :thumbnail="true" :pure-pic="true"/>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="log-wrapper shadow" >
      <div class="flex flex-center" style="padding: 18px 0;">
        <h3 class="title">LOG</h3>
        <ul class="tab-bar flex">
          <li
            v-for="(tab,index) in Object.keys(logsMap)"
            :key="index"
            :class="{'tab-btn-active':currentLogTab === tab}"
            class="tab-btn"
            @click="switchLogTab(tab)"
          >
            <span class="text">{{ tab }}</span>
            <span v-if="tab!=='all'" :class="[tab]" class="count">{{ logsMap[tab].length }}</span>
          </li>
          <!--<div class="tab-search">debug</div>-->
        </ul>
      </div>
      <div v-loading="logLoading" ref="logView" :style="largestLog" class="log-container" @mousewheel="logOnMousewheel">
        <ul class="log-list overflow-hidden">
          <li v-for="(log,index) in logsMap[currentLogTab].list" :key="index">
            <div class="flex">
              <span class="line-num">{{ log.lineNum }}</span>
              <span class="content"> {{ log.content }}</span>
            </div>
          </li>
        </ul>
      </div>
      <div class="log-extend flex flex-center justify-center">
        <!-- <i v-if="!showingAllLog" class="el-icon-caret-top" /> -->
        <icon-hover-and-active
          v-if="!showingAllLog"
          :default-url="icons.normal['dashBoardFold']"
          :hover-url="icons.hover['dashBoardFold']"
          :active-url="icons.active['dashBoardFold']"
          @clickFn="showingAllLogs"
        />
        <!-- <i v-if="showingAllLog" class="el-icon-caret-bottom" /> -->
        <icon-hover-and-active
          v-if="showingAllLog"
          :default-url="icons.normal['dashBoardUnfold']"
          :hover-url="icons.hover['dashBoardUnfold']"
          :active-url="icons.active['dashBoardUnfold']"
          @clickFn="showingAllLogs"
        />
      </div>
    </div>

    <el-dialog
      :visible.sync="showGraph"
      :close-on-click-modal="false"
      width="50%"
      top="10vh"
    >
      <h3 slot="title" class="list-title t-a-c" style="color:rgb(96, 98, 102);">GRAPH</h3>
      <div
        v-if="DAGData"
        class="wrapper w-100"
        style="width:100%;height:70vh;position:relative;">
        <!-- <echart-container
          :class="'echarts'"
          :options="graphOptions"
          @getEchartInstance="getGraphEchartInstance"
        /> -->
        <dag ref="purePicBigerDag" :id="'dialogCanvas'" :msg="DAGData" :pure-pic="true"/>
        <div class="flex flex-col flex-center suitable-button">
          <div class="sutiable-button-item item-suitable" @click="dagSuitable">
            <i class="el-icon-full-screen"/>
          </div>
          <div class="sutiable-button-item item-plus" @click="dagPlus">
            <i class="el-icon-plus"/>
          </div>
          <div class="sutiable-button-item item-minus" @click="dagMinus">
            <i class="el-icon-minus"/>
          </div>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import EchartContainer from '@/components/EchartContainer'
import jobOptions from '@/utils/chart-options/gauge'
import graphOptions from '@/utils/chart-options/graph'
import graphChartHandler from '@/utils/vendor/graphChartHandler'
import { formatSeconds, initWebSocket } from '@/utils'
import Dag from '@/components/Dag'
import Panel from '@/components/Panel'
import IconHoverAndActive from '@/components/IconHoverAndActive'

import { getJobDetails, getDAGDpencencies, queryLog, killJob } from '@/api/job'

export default {
  components: {
    EchartContainer,
    Dag,
    Panel,
    IconHoverAndActive
  },
  data() {
    return {
      jobOptions,
      graphOptions,
      datasetList: [],
      jobId: this.$route.query.job_id,
      role: this.$route.query.role,
      partyId: this.$route.query.party_id,
      jobStatus: '',
      jobDetail: {},
      datasetLoading: true,
      logLoading: false,
      jobTimer: null,
      logWebsocket: {
        // 'all': null,
        'error': null,
        'warning': null,
        'info': null,
        'debug': null
      },
      jobWebsocket: null,
      logsMap: {
        // 'all': { list: [], length: 0 },
        'error': { list: [], length: 0 },
        'warning': { list: [], length: 0 },
        'info': { list: [], length: 0 },
        'debug': { list: [], length: 0 }
      },
      DAGData: null,
      gaugeInstance: null,
      graphInstance: null,
      ratio: '',
      count: '',
      AUC: '',
      elapsed: '',
      currentLogTab: 'info',
      showGraph: false,
      butImage: require('@/utils/dag/icon/button.png'),
      butBackground: '',
      butFontColor: '',
      showingAllLog: false,
      largestLog: ''
    }
  },
  computed: {
    ...mapGetters([
      'icons'
    ])
  },
  mounted() {
    // console.log(process.env.BASE_API)
    const vm = this
    this.jobTimer = setInterval(function() {
      vm.getDatasetInfo(true)
      vm.getDAGDpendencies()
    }, 5000)
    this.getDatasetInfo()
    this.getDAGDpendencies()
    this.getLogSize()
    this.openLogsWebsocket()
    this.openJobWebsocket()
  },
  beforeDestroy() {
    clearInterval(this.jobTimer)
    this.closeWebsocket()
  },
  methods: {
    getDAGDpendencies() {
      const para = {
        job_id: this.jobId,
        role: this.role,
        party_id: this.partyId
      }
      getDAGDpencencies(para).then(res => {
        this.DAGData = res.data
      })
    },
    openLogsWebsocket() {
      Object.keys(this.logsMap).forEach(item => {
        this.logWebsocket[item] = initWebSocket(`/log/${this.jobId}/${this.role}/${this.partyId}/default/${item}`, res => {
          // console.log(item, 'success')
        }, res => {
          const data = JSON.parse(res.data)
          // console.log(item, data)
          if (Array.isArray(data)) {
            if (data.length > 0) {
              this.logsMap[item].list = [...this.logsMap[item].list, ...data]
              this.logsMap[item].length = data[data.length - 1].lineNum
            }
          } else {
            this.logsMap[item].list.push(data)
            this.logsMap[item].length = data.lineNum
          }
        })
      })
    },
    openJobWebsocket() {
      const vm = this
      this.jobWebsocket = initWebSocket(`/websocket/progress/${this.jobId}/${this.role}/${this.partyId}`, res => {
        // console.log('job wbsocket success')
      }, res => {
        const { process, status, duration, dependency_data } = JSON.parse(res.data)
        // console.log(JSON.parse(res.data))
        vm.jobDetail.progress = process || 0
        vm.jobDetail.time = duration || 0

        if (this.graphInstance) {
          this.pushDataToGraphInstance(this.graphInstance, dependency_data.data)
        }
        if (duration) {
          this.elapsed = formatSeconds(duration)
        }
        this.jobStatus = status
        if (this.jobStatus !== 'failed' && this.jobStatus !== 'success') {
          this.jobOptions.series[0].pointer.show = true
          this.jobOptions.series[0].detail.show = true
          this.jobOptions.series[0].data[0].value = process || 0
        }
        if (this.gaugeInstance) {
          this.gaugeInstance.setOption(this.jobOptions, true)
        }
      })
    },
    getLogSize() {
      // Object.keys(this.logsMap).forEach(item => {
      //   queryLogSize({
      //     job_id: this.jobId,
      //     party_id: this.partyId,
      //     role: this.role,
      //     type: item
      //   }).then(res => {
      //     this.logsMap[item].length = res.data
      //   })
      // })
    },
    getDatasetInfo(isInterval = false) {
      const para = {
        job_id: this.jobId,
        role: this.role,
        party_id: this.partyId
      }
      getJobDetails(para).then(res => {
        // console.log(res)
        const { job, dataset: _dataset } = res.data
        if (!isInterval) {
          if (_dataset) {
            const { roles, dataset } = _dataset
            const datasetList = []
            Object.keys(roles).forEach(role => {
              const options = []
              roles[role].forEach(item => {
                options.push({
                  value: item,
                  label: item
                })
              })
              const roleInfo = {
                role: role.toUpperCase(),
                options,
                roleValue: options[0].label,
                datasetData: dataset[role] || ''
              }
              // if (dataset[role]) {
              datasetList.push(roleInfo)
              // }
            })
            this.datasetList = datasetList.sort((a, b) => {
              const aRole = a.role
              const bRole = b.role
              if (aRole === 'GUEST') {
                return -1
              } else if (aRole === 'HOST' && bRole === 'ARBITER') {
                return -1
              }
            })
          }
        }
        if (job) {
          this.jobStatus = job.fStatus
          this.jobDetail = { progress: job.fProgress, time: job.duration || this.jobDetail.time || 0 }
        }
      }).then(res => {
        this.datasetLoading = false
      })
    },
    getJobEchartInstance(echartInstance) {
      this.gaugeInstance = echartInstance
    },

    closeWebsocket() {
      // console.log('close Websocket')
      Object.keys(this.logWebsocket).forEach(type => {
        if (this.logWebsocket[type]) {
          this.logWebsocket[type].close()
        }
      })
      if (this.jobWebsocket) {
        this.jobWebsocket.close()
      }
    },

    handleKillJob(method) {
      const para = { job_id: this.jobId, role: this.role, party_id: this.partyId }
      getJobDetails(para).then(res => {
        const { job } = res.data
        const status = this.jobStatus = job.fStatus
        if (status === 'waiting') {
          method = 'cancel'
        } else {
          if (method === 'cancel') {
            method = 'kill'
          }
        }
        this.killJob(para, method)
      })
      // this.confirmKill(para)
    },
    killJob(para, method) {
      // console.log(this.jobWebsocket)
      this.$confirm(`You can\'t undo this action', 'Are you sure you want to ${method} this job?`, {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel'
      }).then(() => {
        killJob(para).then(() => {
          this.getDatasetInfo()
          this.getDAGDpendencies()
        })
        // console.log('kill job:' + this.jobId, this.role, this.partyId)
        // this.jobStatus = 'failed'
      }).catch(() => {
        // console.log('cancel kill')
      })
    },

    getGraphEchartInstance(echartInstance) {
      let fnInterval = null
      const fn = () => {
        if (this.DAGData) {
          window.clearInterval(fnInterval)
          // const { dataList, linksList } = graphChartHandler(this.DAGData)
          // console.log(dataList, linksList)
          // this.graphOptions.series[0].data = dataList
          // this.graphOptions.series[0].links = linksList
          this.graphOptions.tooltip.show = false
          // echartInstance.setOption(this.graphOptions, true)
          // echartInstance.on('click', { dataType: 'node' }, nodeData => {
          //   console.log(nodeData)
          // })
          this.pushDataToGraphInstance(echartInstance, this.DAGData)
        }
      }
      fnInterval = window.setInterval(fn, 100)
      this.graphInstance = echartInstance
    },
    pushDataToGraphInstance(instance, data) {
      const { dataList, linksList } = graphChartHandler(data)
      // console.log(dataList, linksList)
      this.graphOptions.series[0].data = dataList
      this.graphOptions.series[0].links = linksList
      instance.setOption(this.graphOptions, true)
    },
    toDetails() {
      this.$router.push({
        path: '/details',
        query: { job_id: this.jobId, role: this.role, party_id: this.partyId, 'from': 'Dashboard' }
      })
    },
    switchLogTab(tab) {
      this.currentLogTab = tab
    },
    logOnMousewheel(e) {
      // console.log(e.target.parentNode.parentNode.scrollTop)
      // console.log(e.wheelDelta)
      const topLog = this.logsMap[this.currentLogTab].list[0]
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
                componentId: 'default',
                job_id: this.jobId,
                role: this.role,
                party_id: this.partyId,
                begin,
                end,
                type: this.currentLogTab
              }).then(res => {
                // console.log(res)
                const newLogs = []
                res.data.map(log => {
                  // console.log(log)
                  if (log) {
                    newLogs.push(log)
                  }
                })
                this.logsMap[this.currentLogTab].list = [...newLogs, ...this.logsMap[this.currentLogTab].list]
                this.logLoading = false
              }).catch(() => {
                this.logLoading = false
              })
            }

            window.setTimeout(fn, 1000)
          }
        }
      }
      return false
    },
    overButton(e) {
      this.butBackground = '#494ece'
      this.butFontColor = '#ffffff'
      this.butImage = require('@/utils/dag/icon/button2.png')
    },
    outButton(e) {
      this.butBackground = ''
      this.butFontColor = ''
      this.butImage = require('@/utils/dag/icon/button.png')
    },
    clickButton() {
      this.butBackground = '#3135A6'
      this.butFontColor = '#ffffff'
    },
    combinaTooltip(row) {
      let final = []
      if (row.datasetData) {
        final = Object.values(row.datasetData[row.roleValue])
      }
      return final
    },
    showingAllLogs() {
      this.showingAllLog = !this.showingAllLog
      if (this.showingAllLog) {
        this.largestLog = 'height:703px;'
      } else {
        this.largestLog = ''
      }
    },
    dagSuitable() {
      this.$refs.purePicBigerDag.suitable()
    },
    dagPlus() {
      this.$refs.purePicBigerDag.dagPlus()
    },
    dagMinus() {
      this.$refs.purePicBigerDag.dagMinus()
    }
  }
}
</script>

<style lang="scss">
  @import "../../styles/dashboard";

  .toolContent {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .el-tooltip__popper[x-placement^=top] .popper__arrow::after {
    border-top-color: rgba(127,125,142,0.7)
  }

  .el-tooltip__popper[x-placement^=top] .popper__arrow {
    border-top-color: rgba(127,125,142,0.7)
  }

  .tooltip-content {
    font-family: 'Lato';
    background-color:rgba(127,125,142,0.7) !important
  }
</style>
