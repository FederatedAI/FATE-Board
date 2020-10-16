<template>
  <div class="flex flex-col space-between correlation-container" @click="dialogClose">
    <div class="flex flex-row space-between flex-center correlation-title">
      <div class="flex flex-row flex-center">
        <span v-if="!single">role:</span>
        <el-select
          v-if="!single"
          v-model="roleSelected"
          size="small"
          class="title-selection"
          @change="correlationChange"
        >
          <el-option
            v-for="(item, index) in roleSelectionComp"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <span class="title-filters" @click.stop="showingTransfer">select</span>
        <div
          v-show="showTransferDialog"
          class="flex flex-col flex-start title-filters-dialog"
          @click.stop="showTransferDialog = true"
        >
          <div class="flex flex-row flex-end title-filter-title">
            <i class="el-icon-close selection-close" @click.stop="showTransferDialog = false" />
          </div>
          <transfer v-show="showTransferDialog" :all-info="features" @change="changeFeature" />
        </div>
      </div>
      <div class="flex flex-row flex-center correlation-operations">
        <el-checkbox
          class="correlation-coefficient"
          size="small"
          @change="coefficientChange"
        >Correlation coefficient</el-checkbox>
        <icon-hover-and-active
          :class-name="'img-wrapper'"
          :default-url="require('@/components/CanvasComponent/pearsonDiagram/icons/sortby_default.png')"
          :hover-url="require('@/components/CanvasComponent/pearsonDiagram/icons/sortby_hover.png')"
          :active-url="require('@/components/CanvasComponent/pearsonDiagram/icons/sortby_click.png')"
          class="operation-btnicon"
          @clickFn="showingSortBy"
        />
        <sort-by
          v-show="showSortBy"
          ref="sortBy"
          :features="correlationFeatures"
          :all-features="[...variable,...otherVariable]"
          :nums="nums"
          class="sort-by-dialog"
          @sort="changeCorrelationFeatures"
          @close="dialogClose"
        />
        <icon-hover-and-active
          :class-name="'img-wrapper'"
          :default-url="require('@/components/CanvasComponent/pearsonDiagram/icons/filter_default.png')"
          :hover-url="require('@/components/CanvasComponent/pearsonDiagram/icons/filter_hover.png')"
          :active-url="require('@/components/CanvasComponent/pearsonDiagram/icons/filter_click.png')"
          class="operation-btnicon btn-no-margin"
          @clickFn="showingFilterRange"
        />
        <filter-range v-show="showRangefilter" ref="filterRange" @filter="filterCorrelation" />
      </div>
    </div>
    <div class="flex flex-row space-around flex-center correlation-relationship">
      <div class="relationship-picture">
        <correlation
          ref="correlation"
          :features="correlationFeatures"
          :correlation="correlationContent"
          :max="filterMax"
          :min="filterMin"
        />
      </div>
      <div class="flex flex-col space-between range-axis">
        <span
          v-for="(item, index) in RangeAxis"
          :key="index"
          class="range-axis-item flex flex-row flex-row"
        >
          <span class="range-axis-item-check" />
          <span class="range-axis-item-num">{{ item }}</span>
        </span>
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

import IconHoverAndActive from '@/components/IconHoverAndActive'
import correlation from './correlation'
import transfer from './transfer'
import sortBy from './sorting'
import filterRange from './range'
export default {
  name: 'PearsonDiagram',
  components: {
    correlation,
    transfer,
    IconHoverAndActive,
    sortBy,
    filterRange
  },
  props: {
    variable: {
      // features for guest
      type: Array,
      default: () => []
    },
    otherVariable: {
      // features for host
      type: Array,
      default: () => []
    },
    nums: {
      type: Array | Object,
      default: () => []
    },
    role: {
      type: String,
      default: 'guest'
    },
    single: {
      type: Boolean | String,
      default: false
    }
  },
  data() {
    return {
      rangeStart: 1,
      rangeEnd: -1,
      rangeBetween: 0.25,

      roleSelection: [
        { label: 'all', value: 'all' },
        { label: 'guest', value: 'guest' }
      ],
      roleSelected: 'all',

      features: [],
      correlationFeatures: [],
      correlationContent: [],

      filterMax: 1,
      filterMin: -1,

      showTransferDialog: false,
      showSortBy: false,
      showRangefilter: false
    }
  },
  computed: {
    RangeAxis() {
      const final = []
      let val = this.rangeStart
      while (val >= this.rangeEnd) {
        final.push(val)
        val -= this.rangeBetween
      }
      return final
    },
    roleSelectionComp() {
      const final = JSON.parse(JSON.stringify(this.roleSelection))
      if (this.role === 'host') {
        final[1].label = 'host'
      }
      return final
    }
  },
  watch: {},

  created() {
    this.initing()
  },

  methods: {
    initing() {
      this.allFeatures()
      this.correlationFeatures = JSON.parse(JSON.stringify(this.features))
      this.correlation()
    },
    allFeatures() {
      const final = []
      if (this.roleSelected === 'all') {
        final.push(...this.variable)
        final.push(...this.otherVariable)
      } else if (this.roleSelected === 'guest') {
        final.push(...this.variable)
      } else {
        final.push(...this.otherVariable)
      }
      this.features = final
    },
    correlation() {
      const fixed = num => {
        if (num) {
          return parseFloat(num).toFixed(6)
        } else {
          return '-'
        }
      }
      const final = []
      const rowv = this.features
      const colv = [...this.features].reverse()
      for (let i = 0; i < colv.length; i++) {
        const row = []
        const c = colv[i].replace(/\(.+\)/, '')
        for (let j = 0; j < rowv.length; j++) {
          const r = rowv[j].replace(/\(.+\)/, '')
          if (this.nums[c]) {
            row.push(fixed(this.nums[c][r]))
          } else if (this.nums[r]) {
            row.push(fixed(this.nums[r][c]))
          } else {
            row.push('-')
          }
        }
        final.push(row)
      }
      this.correlationContent = final
    },

    changeFeature(data) {
      const final = []
      for (const val of data) {
        if (val.checked) {
          final.push(val.key)
        }
      }
      this.correlationFeatures = final
      this.operationRedifined()
    },

    coefficientChange(check) {
      if (check) {
        this.$refs.correlation.showText()
      } else {
        this.$refs.correlation.hideText()
      }
    },

    correlationChange() {
      this.allFeatures()
      this.correlationFeatures = JSON.parse(JSON.stringify(this.features))
      this.operationRedifined()
    },

    changeCorrelationFeatures(newFeats) {
      this.correlationFeatures = newFeats
    },

    canvasResize() {
      this.$refs.correlation.canvasResize()
    },

    resize() {
      this.canvasResize()
    },

    filterCorrelation(max, min) {
      this.filterMax = max
      this.filterMin = min
    },

    dialogClose() {
      this.showTransferDialog = false
      this.showSortBy = false
      this.showRangefilter = false
    },

    showingSortBy() {
      this.showTransferDialog = false
      this.showSortBy = true
      this.showRangefilter = false
    },

    showingFilterRange() {
      this.showTransferDialog = false
      this.showSortBy = false
      this.showRangefilter = true
    },

    showingTransfer() {
      this.showTransferDialog = true
      this.showSortBy = false
      this.showRangefilter = false
    },

    operationRedifined() {
      this.$refs.sortBy.redefined()
      this.$refs.filterRange.redefined()
      this.filterMax = 1
      this.filterMin = -1
    }
  }
}
</script>

<style lang="scss" scoped>
.correlation-container {
	width: 100%;
	height: 100%;
	position: relative;
	flex: 1 1 100%;
	.correlation-title {
		width: 100%;
		margin: 12px 0px;
		flex: 0 0 auto;
		.el-select {
			max-width: 135px;
			.el-input {
				.el-input__inner {
					height: 24px;
					background-color: #fff;
					border: 2px solid #ebedf0;
					border-radius: 2px;
				}
				.el-input__icon {
					line-height: 24px;
				}
			}
			.el-select__caret {
				line-height: 24px;
			}
		}
		.operation-btnicon {
			margin-right: 12px;
			max-width: 36px;
			max-height: 24px;
			min-width: 24px;
			min-height: 16px;
		}
		.btn-no-margin {
			margin-right: 0px;
		}
		.title-selection {
			margin-left: 10px;
		}
		.title-filters {
			margin-left: 10px;
			cursor: pointer;
			color: #494ece;
		}
		.title-filters-dialog {
			position: absolute;
			top: 40px;
			left: 0px;
			max-width: 75%;
			max-height: 70%;
			min-width: 70%;
			overflow: hidden;
			background-color: #fff;
			border-radius: 2px;
			box-shadow: 0px 4px 12px 4px rgba(83, 76, 119, 0.26);
		}
		.correlation-operations {
			margin-right: 80px;
			.correlation-coefficient {
				margin-right: 12px;
			}
		}
		.title-filters-dialog {
			padding: 6px;
			z-index: 1;
			.title-filter-title {
				color: #7f7d8e;
				font-size: 17px;
				margin-bottom: -15px;
				z-index: 2;
				.selection-close {
					cursor: pointer;
				}
			}
			.el-transfer-panel__list {
				display: flex;
				flex-direction: column;
			}
		}
	}
	.correlation-relationship {
		width: 100%;
		flex: 1 1 100%;
		position: relative;
		.relationship-picture {
			width: 100%;
			height: 100%;
			margin-right: 15px;
			border: 2px solid #ebedf0;
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
		}
		.range-axis {
			height: 100%;
			padding-left: 15px;
			position: relative;
			color: #bbbbc8;
			font-size: 14px;
			min-width: 70px;
			&::before {
				position: absolute;
				top: 9px;
				left: 0px;
				content: ' ';
				width: 15px;
				height: calc(100% - 15px);
				background-image: linear-gradient(#3145a6, #deecfc, #0ec7a5);
			}
			.range-axis-item-check {
				background-color: #dcdde0;
				width: 6px;
				height: 2px;
				margin-top: 7px;
				margin-right: 12px;
			}
			.range-axis-item-num {
				color: #6a6c75;
				font-size: 12px;
			}
		}
	}
}
</style>
