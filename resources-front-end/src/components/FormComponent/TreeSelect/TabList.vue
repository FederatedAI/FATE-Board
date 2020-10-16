<template>
  <div class="tab__container">
    <div class="tab__content">
      <el-tooltip
        v-for="(item, index) in options"
        :key="index"
        :content="'id:' + index"
        class="item"
        effect="dark"
        placement="top"
      >
        <div
          :style="'background-color:' + colorGet(item) + ';'"
          :class="{'tab__item-active': index === currentChoose}"
          class="tab__item"
          @click.stop="chooseItem(index)"
        />
      </el-tooltip>
    </div>
    <div class="tab__footer" />
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

import ColorExchange from '../mixin/ColorExchange'
export default {
  name: 'TabList',
  mixins: [ColorExchange],
  props: {
    /**
		 * [treesize]
		 */
    options: {
      type: Array,
      default: () => []
    },
    basicColor: {
      type: String,
      default: '#494ece'
    },
    maxmiun: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      currentChoose: 0,
      biggest: 0,
      originColor: '',
      unkonw: '#aaa'
    }
  },

  // beforeRouteUpdate (to, from, next){
  //  next();
  // }
  watch: {
    options: {
      handler() {
        this.init()
        this.setDefault()
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      let biggest = 0
      if (this.maxmiun < 0) {
        for (const val of this.options) {
          let mid = val
          if (typeof val === 'object') {
            mid = val.label
          }
          if (mid > biggest) {
            biggest = mid
          }
        }
      } else {
        biggest = this.maxmiun
      }
      this.biggest = biggest
      this.currentChoose = 0
      this.originColor = this.toRGB(this.basicColor)
    },

    chooseItem(index) {
      this.currentChoose = index
      this.request()
    },

    request() {
      this.$emit('change', {
        id: this.currentChoose,
        treeSize: this.options[this.currentChoose]
      })
      this.$emit('selected', {
        id: this.currentChoose,
        treeSize: this.options[this.currentChoose]
      })
    },

    setDefault() {
      this.currentChoose = 0
      this.request()
      return true
    },

    colorGet(size) {
      if (parseInt(size.label) !== 0) {
        const colors = this.originColor
          .toLowerCase()
          .replace('rgba(', '')
          .replace(')', '')
          .split(',')
        colors[3] =
					1 -
					0.8 *
						((this.biggest - (typeof size === 'object' ? size.label : size)) /
							this.biggest)
        return 'rgba(' + colors.join(',') + ')'
      } else {
        return this.unkonw
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../styles/position';
.tab__container {
	@include flex(row, flex-start, flex-start);
	width: 100%;
	height: 95px;
	padding-bottom: 5px;
	background-color: #ffffff;
	overflow-y: hidden;
	overflow-x: auto;
	.tab__content {
		@include flex(row, flex-start, flex-start);
		width: 100%;
		height: 75px;
		background-color: #eee;
		.tab__item {
			max-width: 25px;
			min-width: 15px;
			height: 75px;
			margin-left: 1px;
			padding: 3px;
			flex: 1 1 auto;
			position: relative;
		}
		.tab__item:hover::before {
			content: ' ';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 75px;
			margin: auto;
			width: 2px;
			background-color: #ff8800;
		}
		.tab__item-active::after {
			content: ' ';
			position: absolute;
			top: 73px;
			left: 0;
			right: 0;
			margin: auto;
			width: 0px;
			height: 0px;
			border: 4px solid transparent;
			border-bottom: 4px solid #000;
		}
	}
}
</style>
