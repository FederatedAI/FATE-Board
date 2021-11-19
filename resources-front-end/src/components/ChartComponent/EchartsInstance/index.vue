<template>
  <div
    v-drag="!zoom ? false : chartSuitables"
    v-scale="!zoom ? false : chartScale"
    :style="containerStyle"
    :class="containerClass"
    class="charts__container"
  >
    <div ref="myChart" :style="chartStyle" class="charts__instance" />
    <div v-show="showNoData" class="charts__nodata">
      <span>{{ noData }}</span>
    </div>
    <div v-if="zoom" class="flex flex-col flex-center suitable-button" style="margin-left:20px">
      <div class="sutiable-button-item item-suitable" @click="chartSuitable">
        <i class="el-icon-full-screen" />
      </div>
      <div class="sutiable-button-item item-plus" @click="chartPlus">
        <i class="el-icon-plus" />
      </div>
      <div class="sutiable-button-item item-minus" @click="chartMinus">
        <i class="el-icon-minus" />
      </div>
    </div>
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

import zoomChart from './mixin/ZoomChart'
import echarts from 'echarts'
import { deepClone } from '@/utils'
import dataReporter from './mixin/DataReport'
export default {
  name: '',
  mixins: [zoomChart, dataReporter],
  props: {
    options: {
      type: Object,
      default: () => {}
    },
    width: {
      type: Number | String,
      default: ''
    },
    height: {
      type: Number | String,
      default: ''
    },
    containerHeight: {
      type: Number | String,
      default: 500
    },
    noData: {
      type: String | Boolean,
      default: false
    },
    legend: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: ''
    },
    zoom: {
      type: Boolean,
      default: false
    },
    noDataMissing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      instance: '',
      currentOptions: {},
      currentFilter: '',
      showNoData: false,
      originChartStyle: '',
      resizeChange: false,
      chartsChange: false,
      afterCharts: false
    }
  },
  computed: {
    chartStyle() {
      let res = ''
      if (this.width) {
        res += `width:${parseInt(this.width) + 'px'};`
      }
      if (this.height) {
        let sh = this.height
        const ch = parseInt(this.containerStyle.split(':')[1])
        if (this.height.match(/(\+|\-)/)) {
          sh = parseInt(sh) + ch + 'px'
        }
        res += `height:${sh};`
      }
      return res
    },
    containerStyle() {
      if (this.containerHeight && parseInt(this.containerHeight) < 500) {
        return `height:${parseInt(this.containerHeight) + 'px'};`
      } else {
        return 'height: 500px;'
      }
    },
    containerClass() {
      let res = ''
      if (this.noDataMissing && this.showNoData) {
        res = 'missing'
      }
      if (this.className) {
        res += (res ? ' ' : '') + this.className
      }
      return res
    }
  },
  watch: {
    options: {
      handler() {
        if (!this.legend) {
          this.linkageForm(this.currentFilter)
        }
      },
      deep: true
    },
    chartStyle() {
      if (this.chartStyle !== this.originChartStyle) {
        this.resize()
      }
    },
    currentOptions() {
      this.recovery()
    }
  },
  mounted() {
    this.echartInit()
    this.originChartStyle = this.chartStyle
    if (!this.legend) {
      this.linkageForm(this.currentFilter)
    }
  },
  methods: {
    echartInit() {
      const vm = this
      this.instance = echarts.init(this.$refs['myChart'])
      this.instance.on('finished', () => {
        if (vm.resizeChange && vm.chartsChange) {
          vm.resizeChange = false
          vm.refreshed()
        } else if (!vm.resizeChange && vm.chartsChange) {
          if (vm.afterCharts) {
            vm.afterCharts = false
            vm.resize()
          } else {
            vm.chartsChange = false
            vm.$emit('refreshed')
          }
        } else if (vm.resizeChange) {
          vm.resizeChange = false
        }
      })
    },
    refresh(seriess) {
      seriess = seriess || this.currentOptions
      if (Object.keys(seriess).length > 0 || !this.noData) {
        if (
          !seriess.series ||
          (seriess.series.length === 1 &&
					(Object.keys(seriess.series ? (seriess.series[0] || {}) : {})).length === 0)
        ) {
          this.showNoData = true
          return false
        }
        this.instance.setOption(seriess, true)
        this.showNoData = false
        return true
      } else {
        this.showNoData = true
        return false
      }
    },
    refreshed() {
      this.chartsChange = true
      const chartChange = this.chartStyle !== this.originChartStyle
      if (chartChange && this.showNoData) {
        this.afterCharts = true
      }
      if (chartChange && !this.showNoData) {
        this.$nextTick(() => {
          this.resizeChange = true
          this.resize()
        })
      } else {
        this.$nextTick(() => {
          if (!this.refresh()) {
            this.$emit('refreshed')
          }
        })
      }
    },
    resize() {
      this.originChartStyle = this.chartStyle
      this.instance.resize()
    },
    getInstance() {
      return this.instance
    },
    getCurrentOptions() {
      return this.currentOptions
    },
    setCurrentOptions(options) {
      this.$set(this, 'currentOptions', options)
      this.refreshed()
    },
    linkageForm(res) {
      const opts = deepClone(this.options)
      if (res) {
        this.currentFilter = res
        for (let i = 0; i < opts.series.length; i++) {
          const val = opts.series[i]
          let has = false
          for (const item of this.currentFilter) {
            if (val.pairType === item.group.name) {
              has = true
              let initems = false
              for (const it of item.items) {
                if (val.name === it.value) {
                  initems = true
                  val.itemStyle = val.itemStyle || {}
                  val.itemStyle.color = it.color
                  break
                }
              }
              if (!initems) {
                val.itemStyle = val.itemStyle || {}
                val.itemStyle.color = item.group.color[0]
              } else {
                break
              }
            }
          }
          if (!has) {
            opts.series.splice(i, 1)
            i--
          }
        }
      }
      this.currentOptions = opts
      if ((this.legend && this.currentFilter) || !this.legend) {
        this.refreshed()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../styles/position';

.charts__container {
	position: relative;
	margin-bottom: 20px;
	border: 2px solid #ebedf0;
	.charts__instance {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		margin: 0 auto;
	}
	.charts__nodata {
		position: absolute;
		top: 0px;
		left: 0px;
		bottom: 0px;
		right: 0px;
		margin: auto;
		min-height: 500px;
		background-color: #ebedf0;
		z-index: 10;
		@include flex(column, center, center);
	}
}
.suitable-button {
	position: absolute;
	bottom: 0px;
	left: 15px;
	.sutiable-button-item {
		width: 32px;
		height: 32px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f8f8fa;
		margin-bottom: 12px;
		color: #bbbbc8;
		&:hover {
			background-color: #494ece;
			color: #fff;
		}
	}
}
.missing {
	display: none;
}
</style>
