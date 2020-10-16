<template>
  <div class="flex flex-row space-between align-center filter-container" @click.stop="stopClick">
    <img src="./icons/sortby.png" class="range-icon" alt >
    <el-slider
      v-model="range"
      :marks="marks"
      :format-tooltip="formatTool"
      range
      class="range-slider"
      @change="getChangeData"
    />
    <div class="range-btn" @mouseover="hoverCheck" @mouseout="outCheck" @click="checkRange">
      <img :src="btn_style" alt >
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

export default {
  name: 'RangeChoose',
  data() {
    return {
      range: [1, 100],
      marks: {
        0: '-1',
        25: '-0.5',
        50: '0',
        75: '0.5',
        100: {
          style: {
            width: '15px'
          },
          label: '1'
        }
      },
      max: 1,
      min: -1,
      click: require('./icons/click.png'),
      hover: require('./icons/hover.png'),
      default: require('./icons/default.png'),
      btn_style: '',
      origin: ''
    }
  },

  beforeMount() {
    this.inited()
  },

  methods: {
    inited() {
      this.btn_style = this.default
    },
    getChangeData(val) {
      this.min = -parseFloat((1 - (parseFloat(val[0]) * 2) / 100).toFixed(6))
      this.max = -parseFloat((1 - (parseFloat(val[1]) * 2) / 100).toFixed(6))
      this.btn_style = this.default
    },
    checkRange() {
      this.btn_click = this.click
      this.origin = this.btn_click
      this.$emit('filter', this.max, this.min)
    },
    formatTool(value) {
      return -parseFloat((1 - (parseFloat(value) * 2) / 100).toFixed(6))
    },
    stopClick(ev) {
      ev.stopPropagation()
      return false
    },
    redefined() {
      this.range = [1, 100]
      this.max = 1
      this.min = -1
    },
    hoverCheck() {
      this.origin = this.btn_style
      this.btn_style = this.hover
    },
    outCheck() {
      this.btn_style = this.origin
    }
  }
}
</script>

<style scoped lang="scss">
.filter-container {
	position: absolute;
	top: 40px;
	right: 70px;
	max-width: 68%;
	min-width: 400px;
	max-height: 70%;
	min-height: 68px;
	overflow: hidden;
	background-color: #fff;
	border-radius: 2px;
	box-shadow: 0px 4px 12px 4px rgba(83, 76, 119, 0.26);
	padding: 15px;
	z-index: 1;
	.range-icon {
		width: 14px;
		margin: 12px;
		height: 100%;
	}
	.range-btn {
		width: 14px;
		margin: 12px;
		height: 100%;
	}
	.range-slider {
		width: calc(100% - 100px);
	}
}
</style>
