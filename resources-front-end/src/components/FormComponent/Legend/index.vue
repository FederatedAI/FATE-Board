<template>
  <section class="legend__container">
    <div class="legend__display">
      <div
        v-for="(item, index) in currentList.slice(0, withOutDialog)"
        :key="index"
        class="legend__cp"
        @click.stop="chooseItem(index)"
      >
        <span
          v-for="(val, key) in item"
          :key="key"
          :style="labelDisplay(val.color)"
          :title="val.label"
          class="legend__label"
        >{{ val.label }}</span>
      </div>
      <div v-if="currentList.length > withOutDialog" class="legend__cp" @click="showDialog">
        <span
          v-for="(item, index) in currentList[0]"
          :key="index"
          :style="labelDisplay(unchooseColor[index])"
          class="legend__lable"
        >...</span>
      </div>
      <div class="legend__cp">
        <icon-hover-and-active
          :class-name="'page-arrow'"
          :default-url="icons.normal.unfold"
          :hover-url="icons.hover.unfold"
          :active-url="icons.active.unfold"
          @clickFn="showDialog"
        />
      </div>
    </div>

    <div v-show="dialogShowing" class="legend__dialog" @click.stop>
      <header class="legend__d-header">
        <div class="legend__d-operation">
          <span class="legend__d-text">Total: {{ currentList.length }}</span>
          <span class="legend__d-text">Selected: {{ currentChoosed.length }}</span>
          <span class="legend__d-text legend__d-clear" @click.stop="clearAll(false)">Clear</span>
        </div>
        <span class="legend__d-hide">
          <icon-hover-and-active
            :class-name="'page-arrow'"
            :default-url="icons.normal.fold"
            :hover-url="icons.hover.fold"
            :active-url="icons.active.fold"
            @clickFn="hideDialog"
          />
        </span>
      </header>
      <main class="legend__d-main">
        <div
          v-for="(item, index) in currentList"
          :key="index"
          class="legend__cp"
          @click.stop="chooseItem(index)"
        >
          <span
            v-for="(val, key) in item"
            :key="key"
            :style="labelDisplay(val.color)"
            class="legend__label showAll"
          >{{ val.label }}</span>
        </div>
      </main>
    </div>
  </section>
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
import { mapGetters } from 'vuex'

export default {
  name: 'CustomeLegend',
  components: {
    IconHoverAndActive
  },
  props: {
    choose: {
      type: Array,
      default: () => []
    },
    filter: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Boolean | Number,
      default: 12
    }
  },
  data() {
    return {
      filters: this.filter,
      currentList: [],

      defColor: [
        [
          '#494ece',
          '#00d269',
          '#ff8103',
          '#00dfcf',
          '#f23ba9',
          '#0080ff',
          '#c13ce1',
          '#ffcd03',
          '#7c56ff',
          '#a7cf02',
          '#00d3ff',
          '#ff1414'
        ],
        [
          '#6e78fc',
          '#66e4a5',
          '#ffb36f',
          '#6df1e7',
          '#e576c2',
          '#66b3ff',
          '#dd83f2',
          '#ffea84',
          '#b692f6',
          '#e1f397',
          '#77e3ff',
          '#ff5a5a'
        ]
      ],
      unchooseColor: ['#bbbbc8', '#E6E6E6'],
      chooseColor: [],

      selectedColor: 0,
      withOutDialog: 5,
      dialogShowing: false,
      currentChoosed: []
    }
  },
  computed: {
    ...mapGetters(['icons']),
    filterLimit() {
      let mid = 0
      for (const val of this.currentList) {
        if (val.length > mid) {
          mid = val.length
        }
      }
      const checkBigger = len => {
        return this.currentList.length * mid >= len
          ? len
          : this.currentList.length * mid
      }
      const limits =
				typeof this.filters === 'number'
				  ? checkBigger(this.filters)
				  : checkBigger(12)
      return Math.floor(limits / mid)
    }
  },
  watch: {
    choose: {
      handler() {
        this.toDisplay()
        this.colorInit()
        this.currentChoosed = []
      }
    }
  },
  beforeMount() {
    this.toDisplay()
    this.colorInit()
  },
  mounted() {
    this.$nextTick(() => {
      document.addEventListener('click', this.hideDialog)
    })
  },
  beforeDestroy() {
    document.removeEventListener('click', this.hideDialog)
  },
  methods: {
    toDisplay() {
      const res = []
      const originList = [...this.choose]
      for (const val of originList) {
        const middle = []
        const list = Array.isArray(val) ? val : [val]
        for (let i = 0; i < list.length; i++) {
          const item = list[i]
          if (item.group) {
            for (let j = 0; j < item.items.length; j++) {
              const it = item.items[j]
              middle.push({
                label: typeof item === 'string' ? it : it.label,
                value: typeof item === 'string' ? it : it.value,
                group: item.group,
                color: this.unchooseColor[
                  this.colorSelect(this.unchooseColor.length, j)
                ]
              })
            }
          } else {
            middle.push({
              label: typeof item === 'string' ? item : item.label,
              value: typeof item === 'string' ? item : item.value,
              group: typeof item === 'string' ? item : item.value,
              color: this.unchooseColor[
                this.colorSelect(this.unchooseColor.length, i)
              ]
            })
          }
        }
        res.push(middle)
      }
      this.currentList = res
    },

    colorSelect(len, index) {
      return index % len
    },

    showDialog() {
      this.dialogShowing = true
    },
    hideDialog() {
      this.dialogShowing = false
    },

    labelDisplay(color) {
      return {
        backgroundColor: color
      }
    },

    clearAll(notReq) {
      const len = this.currentChoosed.length
      for (let i = 0; i < len; i++) {
        this.clearItem(this.currentChoosed[0])
      }
      if (!notReq) {
        this.request()
      }
    },

    clearItem(index) {
      const pos = this.currentChoosed.indexOf(index)
      if (pos >= 0) {
        this.currentChoosed.splice(pos, 1)
      }
      const list = this.currentList[index]
      list.forEach((item, index) => {
        if (index === 0 && this.filters) {
          this.selectedColor.push(this.chooseColor[0].indexOf(item.color))
        }
        item.color = this.unchooseColor[
          this.colorSelect(this.unchooseColor.length, index)
        ]
      })
    },

    chooseItem(index, changed = true) {
      if (this.currentChoosed.indexOf(index) >= 0) {
        this.clearItem(index)
      } else {
        if (this.filters) {
          const limit = this.filterLimit
          if (this.currentChoosed.length >= limit) {
            this.clearItem(this.currentChoosed[0])
          }
        }
        this.currentChoosed.push(index)
        const list = this.currentList[index]
        for (let i = 0; i < list.length; i++) {
          const val = list[i]
          const colorIndex = this.colorSelect(this.chooseColor.length, i)
          val.color = this.filters
            ? this.chooseColor[colorIndex][this.selectedColor[0]]
            : this.chooseColor[colorIndex][0]
        }
        if (this.filters) {
          this.selectedColor.splice(0, 1)
        }
      }
      if (changed) {
        this.request()
      }
    },

    colorInit() {
      const limit =
				this.filterLimit > this.defColor[0].length
				  ? this.defColor[0].length
				  : this.filterLimit
      const res = []
      for (const val of this.defColor) {
        if (this.filters) {
          const middle = []
          for (let i = 0; i < limit; i++) {
            middle.push(val[i])
          }
          res.push(middle)
        } else {
          res.push(val[0])
        }
      }
      this.chooseColor = res
      if (this.filters) {
        this.selectedColorInit()
      }
    },

    selectedColorInit() {
      const res = []
      for (let i = 0; i < this.chooseColor[0].length; i++) {
        res.push(i)
      }
      this.selectedColor = res
    },

    setDefault(param) {
      if (!param) {
        for (let i = 0; i < this.filterLimit; i++) {
          if (i < this.currentList.length) {
            this.chooseItem(i, false)
          }
        }
      } else {
        this.setProperty(param)
      }
      this.request()
      return true
    },

    change() {
      const res = this.getProperty()
      this.$emit('change', res)
    },

    confirm() {
      const res = this.getProperty(true)
      this.$emit('form', res)
    },

    request() {
      this.confirm()
      this.change()
    },

    getProperty(form = false) {
      const res = []
      for (const val of this.currentList) {
        const group = []
        if (this.unchooseColor.indexOf(val[0].color) < 0) {
          for (const item of val) {
            if (!form) {
              res.push(item.value)
            } else {
              if (group.indexOf(item.color) < 0) {
                group.push(item.color)
              }
            }
          }
          if (form) {
            res.push({
              group: {
                name: val[0].group,
                color: group
              },
              items: val
            })
          }
        }
      }
      return res
    },

    setProperty(param) {
      this.clearAll(true)
      for (const val of param) {
        for (let i = 0; i < this.currentList.length; i++) {
          const item = this.currentList[i]
          if (item[0].group === val.group.name) {
            this.chooseItem(i, false)
          }
        }
      }
    },

    allSteps() {
      const res = {}
      this.currentList.forEach((item, index) => {
        item.items.forEach((val, i) => {
          res[val.value] = {
            title: val.label
          }
        })
      })
      return res
    },

    contentTo(items) {
      let res = ''
      for (const val of items) {
        if (val.length > 0) res += '<br>'
        res += val.label
      }
      return res
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../styles/position';
@import '../../../styles/common_style';
.legend__container {
	position: relative;
	margin-bottom: 5px;
}
.legend__display {
	@include flex(row, flex-end, center);
	position: absolute;
	right: 12px;
	top: -35px;
	z-index: 2001;
	.legend__cp {
		@include flex(column, flex-start, center);
		margin-right: 12px;
		cursor: pointer;
		&:last-child {
			margin-right: 0px;
		}
		.legend__label {
			padding: 2px 4px;
			border-radius: 2px;
			color: #fff;
			margin-bottom: 2px;
			width: 100%;
			text-align: center;
      max-width: 150px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
			&:last-child {
				margin-bottom: 0px;
			}
		}
	}
}

.legend__dialog {
	position: absolute;
	top: -47px;
	right: 0px;
	padding: 12px;
	@include shadow(#aaa);
	background-color: #fff;
	z-index: 2005;
	min-width: 400px;
	max-width: 45%;
	.legend__d-header {
		@include flex(row, space-between, center);
		margin-bottom: 10px;
		.legend__d-operation {
			flex: 1 1 auto;
		}
		.legend__d-text {
			font-size: 110%;
			font-weight: 700;
			margin: 0px 15px 0px 5px;
		}
		.legend__d-clear {
			color: #494ece;
			cursor: pointer;
		}
	}
	.legend__d-main {
		@include flex(row, space-between, center);
		max-height: 500px;
		overflow: auto;
		flex-wrap: wrap;
		.legend__cp {
			@include flex(column, space-between, center);
			flex: 0 0 auto;
			margin: 0px 2px;
			margin-bottom: 12px;
			cursor: pointer;
			min-width: 23%;
			&:last-child {
				margin-right: 0px;
			}
			.legend__label {
				width: 100%;
				padding: 2px 4px;
				border-radius: 2px;
				color: #fff;
				margin-bottom: 2px;
				text-align: center;
				&:last-child {
					margin-bottom: 0px;
				}
			}
		}
	}
}
</style>
