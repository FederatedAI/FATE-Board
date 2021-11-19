<template>
  <div class="cus-tree__container">
    <header class="cus-tree__header">
      <div class="cus-tree__header-left">
        <c-title :content="'Tree'" />
        <c-select
          v-if="labels.length > 0"
          ref="labelSeletions"
          :options="labels"
          :label="'label_index'"
          class="label-container"
          @change="labelChange"
        />
        <span
          v-if="labels.length > 0 && showlabel"
          class="label-span"
        >
          model label:{{ modelLabel }}
        </span>
      </div>
      <div class="cus-tree__header-right">
        <div v-show="isTreeBtnLikeLine" class="cus-tree__gradient">
          <span>tree size: max</span>
          <span
            :style="{'background': `linear-gradient(to right,${currentColor}, ${currentColor.replace(',1)', ',0.2)')})`}"
            class="spectrum-bar"
          />
          <span>min</span>
        </div>
        <c-search :placeholder="'tree Id'" class="cus-tree__input" @search="treeSearch" />
        <icon-hover-and-active
          :class-name="'boost-switch-btn'"
          :default-url="isTreeBtnLikeLine?icons.normal['tree-line']:icons.normal['tree-spectrum']"
          :hover-url="isTreeBtnLikeLine?icons.hover['tree-line']:icons.hover['tree-spectrum']"
          :active-url="isTreeBtnLikeLine?icons.hover['tree-line']:icons.hover['tree-spectrum']"
          @clickFn="swithTreeLink"
        />
      </div>
    </header>
    <main class="cus-tree__content">
      <c-tree-select
        ref="cTreeSelection"
        :options="treeLinkOptions"
        :basic-color="currentColor"
        :maxmiun="currentMaxmiun"
        class="cus-tree__content-list"
        @selected="treeListChange"
      />
      <c-chart
        ref="treeSelectChart"
        :key="'treeSelectChart'"
        :options="lineChartOptions"
        :container-height="95"
        :style="{'z-index': currentLine ? 3 : 1}"
        class="cus-tree__content-chart"
      />
    </main>
    <footer class="cus-tree__footer">
      <c-text
        ref="treeIdText"
        :content="'Tree ID: {id}'"
        :data="{
          '{id}': treeIdFormat
        }"
        class="cus-tree__text"
      />
      <c-text
        ref="treeSizeText"
        :content="'Tree Size: {size}'"
        :data="{
          '{size}': (param) => {return param.size ? param.size : 'unkonw'}
        }"
        class="cus-tree__text"
      />
    </footer>
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

import basicOperation from '@/mixin/BasicOperation'
import { mapGetters } from 'vuex'
export default {
  name: 'CusTreeSelect',
  components: {
    CTitle: () => import('../Text/Title'),
    CSelect: () => import('../Select'),
    CSearch: () => import('../Searching'),
    CButton: () => import('../Button'),
    CTreeSelect: () => import('./TabList'),
    iconHoverAndActive: () => import('../../IconHoverAndActive'),
    CChart: () => import('../../ChartComponent/EchartsInstance'),
    CText: () => import('../Text')
  },
  mixins: [basicOperation],
  props: {
    labels: {
      type: Array,
      default: () => []
    },
    treeList: {
      type: Array | Object,
      default: () => []
    },
    treeLine: {
      type: Object,
      default: () => []
    },
    maxmium: {
      type: Number | Object,
      default: 0
    },
    basicColor: {
      type: String | Object,
      default: () => {}
    },
    showlabel: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isTreeBtnLikeLine: true,
      property: '',
      currentTreeId: 0,
      currentTreeSize: 0,
      chartsInstance: null,
      currentLine: false,
      needToGetPic: false,
      asyncPicData: ''
    }
  },
  computed: {
    ...mapGetters(['icons']),
    treeLinkOptions() {
      if (Array.isArray(this.treeList)) {
        return this.treeList
      } else if (this.property === '' || !this.treeList[this.property]) {
        return []
      } else {
        return this.treeList[this.property]
      }
    },
    lineChartOptions() {
      if (this.labels.length === 0) {
        return this.treeLine
      } else if (this.property === '') {
        return {}
      } else {
        return this.treeLine[this.property]
      }
    },
    currentColor() {
      if (typeof this.basicColor === 'string') {
        return this.basicColor
      } else {
        if (this.property === '') {
          return this.basicColor['0']
        } else {
          return this.basicColor[this.property]
        }
      }
    },
    currentMaxmiun() {
      if (typeof this.maxmium === 'number') {
        return this.maxmium
      } else {
        if (this.property === '') {
          return -1
        } else {
          return this.maxmium[this.property]
        }
      }
    },
    modelLabel() {
      const item = this.labels.find((val) => {
        return val.value === this.property
      })
      return item ? (item.name || item.value) : ''
    }
  },
  methods: {
    labelChange(param) {
      this.property = param
    },

    treeListChange(param) {
      this.currentTreeId = param.treeSize.value
      this.currentTreeSize = param.treeSize.label
      this.$nextTick(() => {
        this.chartChange()
        this.textChange()
        this.change()
      })
    },

    textChange() {
      const res = {
        id: this.currentTreeId,
        size: this.currentTreeSize
      }
      this.refOpera('treeIdText', 'linkageOutside', res)
      this.refOpera('treeSizeText', 'linkageOutside', res)
    },

    chartListeners() {
      const _that = this
      const cinstance = this.refOpera('treeSelectChart', 'getInstance')
      if (!cinstance) {
        return false
      }
      this.chartsInstance = cinstance
      this.chartsInstance.getZr().on('click', params => {
        const pointInPixel = [params.offsetX, params.offsetY]
        if (_that.chartsInstance.containPixel('grid', pointInPixel)) {
          let newId = 0
          if (_that.treeLinkOptions.length === 1) {
            newId = 0
          } else {
            newId = Math.round(
              _that.chartsInstance.convertFromPixel({ seriesIndex: 0 }, [
                params.offsetX,
                params.offsetY
              ])[0]
            )
          }
          if (newId !== _that.currentTreeId) {
            _that.currentTreeId = newId
            for (const val of _that.treeLinkOptions) {
              if (val.value === newId.toString()) {
                _that.currentTreeSize = val.label
                break
              }
            }
            _that.listChooseChange()
          }
        }
      })
      return true
    },

    listChooseChange() {
      this.refOpera('cTreeSelection', 'chooseItem', this.currentTreeId)
    },

    chartChange() {
      const currentOptions = this.refOpera(
        'treeSelectChart',
        'getCurrentOptions'
      )
      if (currentOptions) {
        currentOptions.series[0].markLine.data[0] = [
          {
            coord: [this.currentTreeId, 0]
          },
          {
            coord: [this.currentTreeId, this.currentMaxmiun]
          }
        ]
        currentOptions.yAxis.max = this.currentMaxmiun
        this.refOpera('treeSelectChart', 'setCurrentOptions', currentOptions)
      }
    },

    change() {
      this.$emit('change', this.currentTreeId)
    },

    setDefault() {
      if (
        this.$refs.cTreeSelection &&
				this.$refs.treeSelectChart &&
				this.$refs.treeIdText &&
				this.$refs.treeSizeText
      ) {
        if (this.labels.length > 0) {
          if (!this.refOpera('labelSeletions', 'setDefault')) {
            return false
          }
        } else {
          if (!this.refOpera('cTreeSelection', 'setDefault')) {
            return false
          }
        }
      } else {
        return false
      }
      if (!this.chartListeners()) {
        return false
      }
      return true
    },

    treeSearch(param) {
      if (this.treeLinkOptions[parseInt(param)]) {
        this.refOpera('cTreeSelection', 'chooseItem', parseInt(param))
      }
    },

    swithTreeLink() {
      this.currentLine = !this.currentLine
    },

    allSteps(args) {
      let res = {}
      const needLines =
				args.needExport['model_summary.png'] ||
				args.needExport.indexOf('model_summary.png') >= 0
      const needExport =
				args.needExport['model_summary.csv'] ||
				args.needExport.indexOf('model_summary.csv') >= 0
      if (this.labels.length > 0) {
        this.labels.forEach((item, index) => {
          res[item.value] = this.eachLabel(
            this.treeList[item.value],
            this.treeLine[item.value],
            'label' + item.label,
            needLines,
            needExport
          )
          res[item.value].title = item.value
        })
      } else {
        res = this.eachLabel(
          this.treeList,
          this.treeLine,
          'label0',
          needLines,
          needExport
        )
      }
      if (needLines) {
        this.getPictrues(res)
      }
      return res
    },
    eachLabel(list, line, upper, needTreeLines, needTreeList) {
      const res = {}
      list.forEach((item, index) => {
        let mid = item.value.split('_')
        mid = mid[1] || mid[0] || mid
        res[item.value] = {
          title: upper + '_id' + mid
        }
      })
      if (needTreeList) {
        res['model_summary.csv'] = (() => {
          const res = []
          for (const val of list) {
            let id = val.value.split('_')
            id = id.length > 1 ? id[1] : id[0]
            res.push({
              treeID: id,
              treeSize: val.label
            })
          }
          return {
            data: res,
            header: ['id', 'treeSize']
          }
        })()
      }
      if (needTreeLines) {
        res['model_summary.png'] = line
      }
      return res
    },
    getPictrues(list) {
      let setting = {}
      if (list['model_summary.png']) {
        list['model_summary.png'] = this.$refs.treeSelectChart.getPicture()
      } else {
        for (const key in list) {
          setting[key] = list[key]['model_summary.png']
        }
        setting = this.$refs.treeSelectChart.getPicture(setting)
        for (const key in setting) {
          list[key]['model_summary.png'] = setting[key]
        }
      }
    },
    getNames() {
      return ['model_summary.png', 'model_summary.csv']
    },
    resize() {
      this.refOpera('treeSelectChart', 'resize')
    },
    treeIdFormat(param) {
      const paramId = param.id.split('_')
      return paramId[1] || paramId[0]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../styles/position';
@import '../../../styles/common_style';
.cus-tree__container {
	@include flex(column, flex-start, flex-start);
	width: 100%;
	.cus-tree__header {
		@include flex(row, space-between, center);
		width: 100%;
		margin-bottom: 12px;
		.cus-tree__header-left {
			@include flex(row, flex-start, center);
			.label-container {
				margin-left: 12px;
			}
      .label-span {
        margin-left: 12px;
      }
		}
		.cus-tree__header-right {
			@include flex(row, flex-end, center);
			.cus-tree__gradient {
				padding-right: 12px;
				.spectrum-bar {
					min-width: 100px;
					height: 10px;
					display: inline-block;
					border-radius: 5px;
				}
			}
			.cus-tree__input {
				padding-right: 12px;
			}
		}
	}
	.cus-tree__content {
		width: 100%;
		position: relative;
		@include flex(row, flex-start, center);
		.cus-tree__content-list {
			width: 100%;
			z-index: 2;
		}
		.cus-tree__content-chart {
			position: absolute;
			top: 0px;
			left: 0px;
			width: 100%;
			height: 100%;
		}
	}
	.cus-tree__footer {
		.cus-tree__text {
			&:first-child {
				margin-right: 12px;
			}
		}
	}
}
.boost-switch-btn {
	width: 40px;
	height: 22px;
}
</style>
