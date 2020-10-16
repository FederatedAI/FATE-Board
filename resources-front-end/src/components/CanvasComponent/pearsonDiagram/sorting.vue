<template>
  <div class="flex flex-col justify-center sortby-constainer" @click.stop="stopClick">
    <div class="flex flex-col sort-content">
      <div class="sort-title">Sort by</div>
      <div class="sort-search">
        <el-input
          v-model="searchInput"
          size="small"
          clearable
          placeholder="Search Variables"
          @clear="clearSearch"
          @input="searching"
        >
          <el-button slot="append" icon="el-icon-search search-icon" />
        </el-input>
      </div>
      <div class="flex flex-col sort-list">
        <div v-for="(item, index) in selection" :key="index" class="list-item">
          <el-checkbox v-model="item.checked" @change="chooseing(item, index)">{{ item.label }}</el-checkbox>
        </div>
      </div>
    </div>
    <div class="flex flex-row flex-center space-between sort-footer">
      <div class="flex flex-row sort-operation">
        <icon-hover-and-active
          ref="sort_up_btn"
          :class-name="'img-wrapper'"
          :default-url="require('@/components/CanvasComponent/pearsonDiagram/icons/sortby_up_default.png')"
          :hover-url="require('@/components/CanvasComponent/pearsonDiagram/icons/sortby_up_hover.png')"
          :active-url="require('@/components/CanvasComponent/pearsonDiagram/icons/sortby_up_click.png')"
          :hold="true"
          :btn-title="'ascending'"
          class="sort-btn-Order"
          @clickFn="changeOrder(true)"
        />
        <icon-hover-and-active
          ref="sort_down_btn"
          :class-name="'img-wrapper'"
          :default-url="require('@/components/CanvasComponent/pearsonDiagram/icons/sortby_down_default.png')"
          :hover-url="require('@/components/CanvasComponent/pearsonDiagram/icons/sortby_down_hover.png')"
          :active-url="require('@/components/CanvasComponent/pearsonDiagram/icons/sortby_down_click.png')"
          :hold="true"
          :btn-title="'descending'"
          class="sort-btn-Desorder"
          @clickFn="changeOrder(false)"
        />
      </div>
      <div
        :style="{'background-color': selected ? '#4159d1': ''}"
        class="sort-check"
        @click="getFinalFeature"
      >OK</div>
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
export default {
  name: 'FeatureSort',
  components: {
    IconHoverAndActive
  },
  props: {
    nums: {
      type: Array | Object,
      default: () => []
    },
    features: {
      type: Array,
      default: () => []
    },
    allFeatures: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      searchInput: '',
      selection: [],
      selected: '',
      order: 1
    }
  },

  watch: {
    features: {
      handler(newVal, oldVal) {
        if (newVal.length !== oldVal.length) {
          this.selected = ''
          this.searchInput = ''
        } else {
          for (const val of newVal) {
            if (oldVal.indexOf(val) < 0) {
              this.selected = ''
              this.searchInput = ''
              break
            }
          }
        }
        this.showFeature()
      }
    }
  },

  beforeMount() {
    this.showFeature()
  },

  methods: {
    showFeature() {
      const that = this
      let final = this.checkPos(JSON.parse(JSON.stringify(this.features)))
      const objs = []
      if (final.length > 0) {
        final = final.filter(val => {
          return val.match(that.searchInput)
        })
      }
      for (const item of final) {
        const v = {
          checked: false,
          label: item,
          key: item
        }
        if (item === this.selected) {
          v.checked = true
        }
        objs.push(v)
      }
      this.selection = objs
      this.$nextTick(() => {
        if (that.order === 1) {
          that.$refs.sort_up_btn.setActive()
        } else {
          that.$refs.sort_down_btn.setActive()
        }
      })
      return objs
    },

    checkPos(features) {
      const final = []
      for (const item of this.allFeatures) {
        if (features.indexOf(item) >= 0) {
          final.push(item)
        }
      }
      return final
    },

    clearSearch() {
      this.searchInput = ''
      this.showFeature()
    },

    searching(value) {
      this.showFeature()
    },

    chooseing() {
      let change = ''
      for (const item of this.selection) {
        if (this.selected && item.label === this.selected) {
          item.checked = false
        }
        if (item.checked) {
          change = item.label
        }
      }
      this.selected = change
    },

    changeOrder(bool) {
      this.order = bool ? 1 : -1
      if (bool) {
        this.$refs.sort_down_btn.restart()
      } else {
        this.$refs.sort_up_btn.restart()
      }
    },

    getFinalFeature() {
      let list = []
      if (!this.selected) {
        const final = this.checkPos(JSON.parse(JSON.stringify(this.features)))
        this.$emit('sort', final)
        this.$emit('close')
      } else {
        const final = [this.selected]
        const fixed = num => {
          if (num) {
            return parseFloat(num).toFixed(6)
          } else {
            return '-'
          }
        }
        const s = this.selected.replace(/\(.+\)/, '')
        for (const item of this.features) {
          if (item === this.selected) {
            continue
          }
          const i = item.replace(/\(.+\)/, '')
          let content = ''
          if (this.nums[s]) {
            content = fixed(this.nums[s][i])
          } else if (this.nums[i]) {
            content = fixed(this.nums[i][s])
          } else {
            content = '-'
          }
          list.push({ key: item, val: content })
        }
        list = list.sort((a, b) => {
          if (a.val === '-' && b.val === '-') {
            return 0
          } else if (a.val === '-') {
            return 1
          } else if (b.val === '-') {
            return -1
          } else {
            return parseFloat(a.val) > parseFloat(b.val)
              ? this.order
              : parseFloat(a.val) === parseFloat(b.val)
                ? 0
                : -1 * this.order
          }
        })
        for (const v of list) {
          final.push(v.key)
        }
        this.$emit('sort', final)
        this.$emit('close')
      }
    },

    stopClick(ev) {
      ev.stopPropagation()
      return false
    },

    redefined() {
      this.selected = ''
      this.order = true
      this.$refs.sort_up_btn.setActive()
      this.$refs.sort_down_btn.restart()
    }
  }
}
</script>

<style scoped lang="scss">
.sortby-constainer {
	position: absolute;
	top: 40px;
	right: 70px;
	max-width: 68%;
	max-height: 70%;
	min-width: 200px;
	overflow: hidden;
	background-color: #fff;
	border-radius: 2px;
	box-shadow: 0px 4px 12px 4px rgba(83, 76, 119, 0.26);
	padding: 15px;
	z-index: 1;
	.sort-content {
		.sort-title {
			color: #7f7d8e;
			font-size: 17px;
			margin-bottom: 5px;
			.selection-close {
				cursor: pointer;
			}
		}
		.sort-search {
			margin-bottom: 10px;
			.el-input {
				max-width: 100%;
				width: 100%;
			}
			.search-icon {
				width: 15px;
				height: 15px;
				position: absolute;
				top: 0;
				bottom: 0;
				margin: auto;
			}
			.el-input__clear {
				padding-right: 5px;
			}
		}
		.sort-list {
			height: 200px;
			overflow: auto;
			.list-item {
				padding: 8px;
				padding-left: 12px;
				background-color: #fff;
				&:nth-child(2n + 0) {
					background-color: #fafbfc;
				}
			}
		}
	}
	.sort-footer {
		padding-top: 10px;
		margin-top: 5px;
		border-top: 2px solid #ebedf0;
		.sort-btn-Order {
			width: 36px;
			height: 24px;
			margin-right: 12px;
		}
		.sort-btn-Desorder {
			width: 36px;
			height: 24px;
		}
		.sort-check {
			width: 66px;
			height: 24px;
			background-color: #c6c8cc;
			color: #fff;
			text-align: center;
			line-height: 24px;
			cursor: pointer;
		}
	}
}
</style>
