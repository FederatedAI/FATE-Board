<template>
  <div class="chart__container">
    <c-legend
      v-if="currentLegend.length > 0"
      ref="chartLegend"
      :style="(biggestGroup - 1) ? 'height:' + ((biggestGroup - 1) * 16) + 'px;' : ''"
      :choose="currentLegend"
      class="chart__legend"
      @form="legendChange"
    />
    <c-echart
      ref="chartInstance"
      :options="currentOptions"
      :width="currentWidth"
      :height="currentHeight"
      :container-height="currentContainerHeight"
      :no-data="noData"
      :no-data-missing="noDataMissing"
      :zoom="zoom"
      :legend="legend === 'custom'"
      :class-name="className"
      class="chart__instance"
      @refreshed="chartsRefreshed"
    />
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
import { sortByName } from '@/transform/fn/uitls'
import basicOpertaion from '@/mixin/BasicOperation'
import dataFilter from '@/mixin/DataFilters'
import { deepClone } from '@/utils'
import dataReporter from './mixin/DataReporter'

function replacement(setting, imply) {
  const replace = data => {
    const list = Array.isArray(data) ? data : [data]
    for (const item of list) {
      if (item.name) {
        for (const val of imply) {
          item.name = item.name.replace(val.origin, val.modified)
        }
        if (item.children) {
          replace(item.children)
        }
      }
    }
  }
  if (setting.series && imply) {
    const series = setting.series
    const itemsList = Array.isArray(series) ? series : [series]
    for (const val of itemsList) {
      replace(val.data)
    }
  }
  return setting
}

export default {
  name: 'CustomCharts',
  components: {
    cgroup: () => import('../../ComponentGroup'),
    cLegend: () => import('../../FormComponent/Legend'),
    cEchart: () => import('../EchartsInstance')
  },
  mixins: [dataFilter, basicOpertaion, dataReporter],
  props: {
    setting: {
      type: Object,
      default: () => {}
    },
    options: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Object | Array,
      default: () => []
    },
    group: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'line'
    },
    legend: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: String | Boolean,
      default: true
    },
    name: {
      type: String,
      default: ''
    },
    zoom: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number | String | Object,
      default: ''
    },
    height: {
      type: Number | String | Object,
      default: ''
    },
    containerHeight: {
      type: Number | String | Object,
      default: 500
    },
    noData: {
      type: String,
      default: 'No Data'
    },
    className: {
      type: String,
      default: ''
    },
    export: {
      type: String,
      default: ''
    },
    detail: {
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
      allOptions: Array.isArray(this.options)
        ? [...this.options]
        : Object.assign({}, this.options),
      oldStack: {},
      reportToUpper: true,
      noNeedToRefresh: false,
      needToImply: null
    }
  },
  computed: {
    currentOptions() {
      if (!this.property && !Array.isArray(this.allOptions)) {
        return {}
      }
      const series = Array.isArray(this.allOptions)
        ? this.allOptions
        : this.propfilter(this.allOptions)
      let setting = ''
      if (this.setting[this.property]) {
        setting = deepClone(this.setting[this.property])
      } else {
        setting = deepClone(this.setting)
      }
      setting = Object.assign({}, setting, series.length > 0 ? { series } : {})
      if (!this.legend || this.legend === 'custom') {
        delete setting.legend
      } else if (
        this.legend === true &&
				(!setting.legend || !setting.legend.data)
      ) {
        setting = this.setLegend(setting)
      }
      if (this.needToImply) {
        replacement(setting, this.needToImply)
      }
      return setting
    },
    currentLegend() {
      const chooseRes = []
      if (this.legend !== 'custom') {
        return chooseRes
      }
      if (this.group.length > 0) {
        for (const item of this.group) {
          chooseRes.push({
            group: item,
            items: []
          })
        }
      }
      const series = this.currentOptions.series || []
      for (const val of series) {
        if (val.type === this.type) {
          if (this.group.length > 0) {
            for (const group of chooseRes) {
              if (
                val.pairType === group.group &&
								val.name.toString().length > 0
              ) {
                group.items.push({
                  label: val.name,
                  value: val.name
                })
              }
            }
          } else {
            chooseRes.push({
              label: val.name,
              value: val.name
            })
          }
        }
      }
      sortByName(chooseRes, chooseRes[0].group ? 'group' : 'label')
      return chooseRes
    },
    currentWidth() {
      if (!this.width) {
        return ''
      } else if (typeof this.width === 'number') {
        return this.width + 'px'
      } else if (typeof this.width === 'string') {
        return this.width
      } else if (!this.property) {
        return ''
      } else {
        return this.width[this.property]
      }
    },
    currentHeight() {
      if (!this.height) {
        return ''
      } else if (typeof this.height === 'number') {
        return this.height + 'px'
      } else if (typeof this.height === 'string') {
        return this.height
      } else if (!this.property) {
        return ''
      } else {
        return this.height[this.property]
      }
    },
    currentContainerHeight() {
      if (!this.containerHeight) {
        return ''
      } else if (typeof this.containerHeight === 'number') {
        return this.containerHeight + 'px'
      } else if (typeof this.containerHeight === 'string') {
        return this.containerHeight
      } else if (!this.property) {
        return ''
      } else {
        return this.containerHeight[this.property]
      }
    },
    biggestGroup() {
      let biggest = 1
      for (const val of this.currentLegend) {
        if (val.items && val.items.length > biggest) {
          biggest = val.items.length
        } else if (!val.items) {
          break
        }
      }
      return biggest
    }
  },
  watch: {
    options: {
      handler() {
        this.allOptions = Array.isArray(this.options)
          ? [...this.options]
          : Object.assign({}, this.options)
      },
      deep: true
    }
  },
  methods: {
    setLegend(tableSetting) {
      const res = []
      if (tableSetting.series) {
        for (const val of tableSetting.series) {
          res.push(val.name)
        }
        if (res.length > 0) {
          tableSetting.legend = Object.assign({}, tableSetting.legend, {
            data: res
          })
        }
      }
      return tableSetting
    },
    setProperty(param) {
      const mid = Array.isArray(param) ? param[0] : param
      if (mid !== this.property || this.needToImply) {
        this.property = mid
        this.$nextTick(() => {
          this.setLegendDefault()
        })
      } else {
        this.chartsRefreshed()
      }
    },
    getCurrentProperty() {
      return this.property
    },
    linkageChange(param, noNeedToRefresh, imply) {
      if (typeof noNeedToRefresh === 'object') {
        imply = noNeedToRefresh
        noNeedToRefresh = false
      }
      this.noNeedToRefresh = noNeedToRefresh
      this.setImply(imply)
      this.setProperty(param)
    },
    setImply(imply) {
      if (Array.isArray(imply) && imply.length > 0) {
        this.needToImply = [...imply]
      }
      const series = this.currentOptions.series
      if (series) {
        const data = (Array.isArray(series) ? series : [series])[0].data
        if (data) {
          const first = (Array.isArray(data) ? data : [data])[0]
          const isLine = !!(first.name && first.children)
          if (!isLine) {
            this.clearImply()
          }
          return isLine
        }
      }
    },
    clearImply() {
      this.needToImply = null
    },
    legendChange(param) {
      this.oldStack[this.property || this.name] = param
      this.refOpera('chartInstance', 'linkageForm', param)
    },
    setLegendDefault() {
      if (this.currentLegend.length > 0) {
        if (
          !this.refOpera(
            'chartLegend',
            'setDefault',
            this.oldStack[this.property || this.name]
          )
        ) {
          return false
        }
      }
      return true
    },
    setDefault() {
      if (!this.$refs['chartInstance']) {
        return false
      } else {
        return this.setLegendDefault()
      }
    },
    chartsRefreshed() {
      if (!this.noNeedToRefresh) {
        if (this.reportToUpper) {
          this.$emit('refreshed')
        }
      } else {
        this.noNeedToRefresh = false
      }
    },
    resize() {
      this.$refs['chartInstance'].resize()
    }
  }
}
</script>

<style lang="scss" scoped>
.chart__container {
	position: relative;
}
</style>
