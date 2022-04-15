<template>
  <el-dialog
    :title="title"
    :show-close="false"
    :visible.sync="visible"
    :fullscreen="fullscreen"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    width="80%"
    top="70px"
  >
    <view-switch
      :fullscreen="fullscreen"
      @switchFullscreen="switchFullscreen"
      @switchVisible="switchVisible"
    />
    <div class="dialog-content">
      <report-nav
        :show-refresh="showRefresh"
        :model-type="modelType"
        :report-type="reportType"
        :no-report-data="noReportData"
        :no-model-data="noModelData"
        :no-data-output="noDataOutput"
        class="report"
        @download="command => $emit('download', command)"
        @refresh="refreshAll"
      />
      <el-tabs v-model="activeName" class="dialog-tabs" @tab-click="changeTabs">
        <el-tab-pane v-if="modelOutputShow" :label="modelName" name="model">
          <combination
            ref="model_output"
            :c-list="cList"
            :visiable="visible"
            @reporter="combinationReporter"
          />
        </el-tab-pane>
        <el-tab-pane v-if="dataOutputShow" label="data output" name="data">
          <DataOutput
            v-if="tabIndex === 1"
            ref="data_output"
            :data="dataOutput"
            @reporter="dataOutputReporter"
          />
        </el-tab-pane>
        <el-tab-pane label="log" name="log">
          <log
            v-if="logInited"
            :visible="visible"
            :component-name="componentName"
            :job-id="jobId"
            :role="role"
            :party-id="partyId"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
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

import ViewSwitch from './component/ViewSwitch'
import ReportNav from './component/ReportNav'
import Combination from './component/Combination'
import DataOutput from './component/DataOutput'
import Log from './component/Log'
import getTransformFn from '@/transform'
// import arrangeMetrics from '@/transform/fn/metricsArrange'
import { getMetrics, getModelOutput, getDataOutput } from '@/api/chart'
import { mapGetters } from 'vuex'

export default {
  name: 'OutputDialog',
  components: {
    ViewSwitch,
    ReportNav,
    Combination,
    DataOutput,
    Log
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    modelType: {
      type: String,
      default: ''
    },
    componentName: {
      type: String,
      default: ''
    },
    jobId: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      default: ''
    },
    partyId: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      fullscreen: false,
      activeName: 'model',
      transformFn: null,
      cList: [],
      tabIndex: 0,
      logInited: false,
      dataOutput: [],
      noReportData: false,
      noModelData: false,
      noDataOutput: false,
      dataOutputResponse: null,
      showRefresh: true
    }
  },
  computed: {
    ...mapGetters(['modelNameMap']),
    modelName() {
      let name = 'summary'
      const modelOutputCheck = [
        'boost',
        'homoBoost',
        'homoLR',
        'heteroLR',
        'heteroLinR',
        'sklearnLR',
        'poisson',
        'homoNN',
        'heteroNN',
        'heterofm',
        'homofm',
        'heteroMF',
        'heteroSVD',
        'heteroSVDPP',
        'heteroGMF'
      ]
      const metricsOutputCheck = ['evaluation', 'scorecard']
      if (this.joinComponents(metricsOutputCheck).match(this.modelType)) {
        name = 'metrics'
      } else if (this.joinComponents(modelOutputCheck).match(this.modelType)) {
        name = 'model output'
      }
      return name
    },
    reportType() {
      const componentHasReport = [
        'binning', 'selection',
        'evaluation', 'featureimputation',
        'labeltransform', 'datatransform',
        'dataio', 'federatedsample',
        'scale', 'onehot',
        'union', 'split',
        'sampleweight', 'statistics',
        'transformer'
      ]
      const componentHasData = [
        'binning', 'selection',
        'secureboost', 'lr',
        'featureimputation', 'labeltransform',
        'datatransform', 'dataio',
        'intersection', 'federatedsample',
        'scale', 'onehot',
        'linr', 'union',
        'split', 'sampleweight',
        'statistics', 'psi',
        'transformer', 'possion',
        'nn', 'kmeans'
      ]
      const componentHasModel = [
        'secureboost', 'lr',
        'linr', 'possion',
        'nn', 'kmeans'
      ]
      const hasReport = !!this.modelType
        .toLowerCase()
        .match(new RegExp('(' + componentHasReport.join('|') + ')'))
      const hasData = !!this.modelType
        .toLowerCase()
        .match(new RegExp('(' + componentHasData.join('|') + ')'))
      const hasModel = !!this.modelType
        .toLowerCase()
        .match(new RegExp('(' + componentHasModel.join('|') + ')'))
      const has = hasReport || hasData || hasModel
      return { has, hasReport, hasData, hasModel }
    },
    dataOutputShow() {
      const componentNotHasDataOutput = [
        'correlation',
        'evaluation',
        'psi',
        'statistic',
        'modelLoader',
        'CacheLoader'
      ]
      return !this.joinComponents(componentNotHasDataOutput).match(
        this.modelType
      )
    },
    modelOutputShow() {
      const componentNotHasModelOutput = ['columnexpend']
      return !this.modelType.match(
        new RegExp(`(${componentNotHasModelOutput.join('|')})`)
      )
    }
  },
  watch: {
    componentName() {
      if (this.componentName) {
        this.refresh()
        this.dataOutputResponse = null
      }
    },
    fullscreen() {
      this.$refs.model_output.resize()
    }
  },
  created() {
    this.currentActiveName()
    this.transformFn = getTransformFn(this.modelType)
  },
  methods: {
    refresh() {
      const param = {
        job_id: this.jobId,
        role: this.role,
        party_id: this.partyId,
        component_name: this.componentName
      }
      this.dataDataOutputCheck()
      this.getResults(param)
      this.transformFn = getTransformFn(this.modelType)
      this.dataOutput = []
    },
    refreshAll() {
      if (this.activeName === 'model') {
        this.refresh()
      } else if (this.activeName === 'data') {
        this.getDataOutputData()
      }
    },
    switchFullscreen() {
      this.fullscreen = !this.fullscreen
    },
    currentActiveName() {
      if (this.modelOutputShow) {
        this.activeName = 'model'
      } else if (this.dataOutputShow) {
        this.activeName = 'data'
      } else {
        this.activeName = 'log'
      }
    },
    switchVisible() {
      this.currentActiveName()
      this.dataOutput = []
      this.$emit('closeDialog')
    },
    joinComponents(components) {
      return components.map(component => this.modelNameMap[component]).join('|')
    },

    getResults(param) {
      // this.transformFn(
      //   {},
      //   {},
      //   this.partyId,
      //   this.role,
      //   this.componentName,
      //   this.jobId,
      //   this.modelType
      // )
      Promise.all([getModelOutput(param), getMetrics(param)]).then(values => {
        const [modelData, metricsData] = values
        let transformResult = ''
        if (
          (modelData.data === null ||
						modelData.data
						  .toString()
						  .toLowerCase()
						  .match('no data') ||
						(modelData.msg &&
							modelData.msg
							  .toString()
							  .toLowerCase()
							  .match('no data'))) &&
					(metricsData.data === null ||
						metricsData.data
						  .toString()
						  .toLowerCase()
						  .match('no data') ||
						(metricsData.msg &&
							metricsData.msg
							  .toString()
							  .toLowerCase()
							  .match('no data')))
        ) {
          transformResult = []
        } else {
          transformResult = this.transformFn(
            modelData,
            metricsData,
            this.partyId,
            this.role,
            this.componentName,
            this.jobId,
            this.modelType
          )
        }

        if (Array.isArray(transformResult)) {
          this.cList = transformResult
          if (transformResult.length === 0) {
            this.noModelData = true
            this.noReportData = true
          } else {
            this.noModelData = false
            this.noReportData = false
          }
        } else {
          transformResult.then(list => {
            this.cList = list
            if (list.length === 0) {
              this.noModelData = true
              this.noReportData = true
            } else {
              this.noModelData = false
              this.noReportData = false
            }
          })
        }
      })
    },
    changeTabs(tab) {
      this.tabIndex = +tab.index
      this.showRefresh = true
      switch (+tab.index) {
        case 1:
          this.getDataOutputData()
          this.showRefresh = false
          break
        default:
          break
      }
      switch (tab.name) {
        case 'log':
          this.logInited = true
          this.showRefresh = false
          break
        default:
          break
      }
    },
    getDataOutputData() {
      const para = {
        job_id: this.jobId,
        role: this.role,
        party_id: this.partyId,
        component_name: this.componentName
      }
      const responseHandler = res => {
        this.dataOutputResponse = res
        this.dataOutput = (res && res.data) || []
        if (
          !this.dataOutput ||
					!this.dataOutput.retmsg ||
					this.dataOutput.retmsg
					  .toString()
					  .toLowerCase()
					  .match('no data')
        ) {
          this.noDataOutput = true
        } else {
          this.noDataOutput = false
        }
      }
      if (!this.dataOutputResponse) {
        getDataOutput(para).then(responseHandler)
      } else {
        responseHandler(this.dataOutputResponse)
      }
    },
    getNames() {
      return this.$refs['model_output'].getNames()
    },
    getVariableMap() {
      return this.$refs['model_output'].getVariableMap()
    },
    hasIv() {
      return this.$refs['model_output'].hasIv()
    },
    allSteps(args) {
      return this.$refs['model_output'].allSteps(args)
    },
    combinationReporter(res) {
      this.$emit('cReporter', res)
    },
    dataOutputReporter(res) {
      this.$emit('dReporter', res)
    },
    handleFilterLogic(filters) {
      return this.$refs['model_output'].handleFilterLogic(filters)
    },
    dataDataOutputCheck() {
      this.getDataOutputData()
    }
  }
}
</script>

<style lang="scss">
@import '../../../styles/component_custom.scss';
.dialog-content {
	position: relative;
	height: 100%;
	.report {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 1;
	}
	.dialog-tabs {
		margin: 0px;
		padding: 0 10px 10px 24px;
		height: 100%;
		background: #fff;
		.el-tabs__content {
			height: calc(100% - 40px);
			.el-tab-pane {
				height: 100%;
				width: 100%;
				padding-right: 12px;
				position: relative;
				overflow-y: auto;
				overflow-x: hidden;
			}
		}
	}
}
</style>
