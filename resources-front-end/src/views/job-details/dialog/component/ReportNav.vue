<template>
  <div class="report-nav">
    <crefresh :showing="showRefresh" @refresh="refreshAll" />
    <span v-if="reportType.has" class="nav-item-wrap">
      <span class="title">downLoad:</span>
      <span
        v-if="reportType.hasReport"
        :class="noReportData ? 'disable-color' : 'nav-item'"
        @click="download('report', noReportData)"
      >
        <icon-hover-and-active
          :default-url="require('@/icons/download_report_default.png')"
          :hover-url="require('@/icons/download_report_hover.png')"
          :active-url="require('@/icons/download_report_click.png')"
          :disable-url="require('@/icons/download_report_disable.png')"
          :disabled="noReportData"
          class="operation-btnicon"
        />Report
        <div v-show="noReportData" class="disable-div" />
      </span>
      <span
        v-if="reportType.hasModel"
        :class="noModelData ? 'disable-color' : 'nav-item'"
        @click="download('model', noModelData)"
      >
        <icon-hover-and-active
          :default-url="require('@/icons/download_model_default.png')"
          :hover-url="require('@/icons/download_model_hover.png')"
          :active-url="require('@/icons/download_model_click.png')"
          :disable-url="require('@/icons/download_model_disable.png')"
          :disabled="noModelData"
          class="operation-btnicon"
        />Model
        <div v-show="noModelData" class="disable-div" />
      </span>
      <span
        v-if="reportType.hasData"
        :class="noDataOutput ? 'disable-color' : 'nav-item'"
        @click="download('data', noDataOutput)"
      >
        <icon-hover-and-active
          :default-url="require('@/icons/download_data_default.png')"
          :hover-url="require('@/icons/download_data_hover.png')"
          :active-url="require('@/icons/download_data_click.png')"
          :disable-url="require('@/icons/download_data_disable.png')"
          :disabled="noDataOutput"
          class="operation-btnicon"
        />Data
        <div v-show="noDataOutput" class="disable-div" />
      </span>
    </span>
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

import { mapGetters } from 'vuex'
import IconHoverAndActive from '@/components/IconHoverAndActive'
import crefresh from './Refresh'

export default {
  name: 'ReportNav',
  components: {
    IconHoverAndActive,
    crefresh
  },
  props: {
    modelType: {
      type: String,
      default: ''
    },
    reportType: {
      type: Object,
      default: () => {}
    },
    noReportData: {
      type: Boolean,
      default: false
    },
    noModelData: {
      type: Boolean,
      default: false
    },
    noDataOutput: {
      type: Boolean,
      default: false
    },
    showRefresh: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapGetters(['modelNameMap'])
  },
  methods: {
    download(command, disabled) {
      if (!disabled) {
        this.$emit('download', command)
      }
    },
    refreshAll() {
      this.$emit('refresh')
    }
  }
}
</script>

<style lang="scss" scoped>
.report-nav {
	display: inline;
	line-height: 26px;
	padding-left: 14px;
	background-color: #fff;
	span {
		width: 80px;
		font-size: 12px;
		font-weight: bold;
		color: #4159d1;
		text-align: center;
		display: inline-block;
	}
	.nav-item-wrap {
		background-color: #ebedf0;
		width: auto;
		margin-right: 24px;
		padding-left: 20px;
		padding-right: 12px;
		.title {
			color: #6a6c75;
			font-weight: bold;
			min-width: 25px;
		}
		.nav-item {
			position: relative;
			cursor: pointer;
			&:hover::after {
				content: ' ';
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				width: 80%;
				margin: auto;
				height: 1px;
				background-color: #6d71d8;
			}
		}
	}
}

.operation-btnicon {
	display: inline-block;
	vertical-align: middle;
	width: 18px;
	height: 18px;
	line-height: 1;
}

.disable-div {
	position: absolute;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
}
.disable-color {
	position: relative;
	color: #c6c8cc !important;
	cursor: auto;
}
</style>
