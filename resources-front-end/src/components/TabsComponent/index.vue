<template>
  <div class="tab_component-container">
    <div :class="{'front-inrow': inrow, 'front-inrow-left': inrow === 'left' }">
      <slot name="header">
        <ctitle :title="title" class="no-border padding-right" />
      </slot>
      <slot :data="options" name="tabs">
        <div>
          <span
            v-for="(item, index) in options"
            :key="index"
            :class="{'selected': currentLabel === item.label}"
            class="tab_selection"
            @click="tabChoose(item)"
          >{{ item.label }}</span>
        </div>
      </slot>
    </div>
    <slot :data="content" name="content">
      <div>
        <cgroup
          v-for="(item, key) in content"
          :ref="`comp${key}`"
          :key="key"
          :options="item"
          :class="{'tab-container_item':true, 'tab-container_item-show':currentValue === key}"
          class="no-border no-padding"
          @reporter="combineData"
        />
      </div>
    </slot>
  </div>
</template>

<script>
import basicOperation from '@/mixin/BasicOperation'
export default {
  name: 'Tabs',
  components: {
    ctitle: () => import('../FormComponent/Text/Title'),
    cgroup: () => import('../ComponentGroup')
  },
  mixins: [basicOperation],
  props: {
    options: {
      type: Array,
      default: () => []
    },
    content: {
      type: Object,
      default: () => {}
    },
    inrow: {
      type: Boolean | String,
      default: 'left'
    },
    title: {
      type: String,
      default: ''
    },
    needRefresh: {
      type: Boolean,
      default: false
    },
    sameSelection: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      currentLabel: '',
      currentValue: '',
      gotData: -1,
      listData: [],
      originLabel: '',
      tabExchangeIndex: -1,
      argsCheck: '',
      inited: {}
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.setDefault()
    })
  },

  methods: {
    tabChoose(tab) {
      // 选择标签内容展示相应元素。
      const _t = this
      return new Promise((resolve, reject) => {
        const oldSelected = this.refOpera(`comp${this.currentValue}`, 'getSelected')
        this.currentLabel = tab.label
        this.currentValue = tab.value
        this.originLabel = tab
        this.$nextTick(() => {
          setTimeout(() => {
            if (_t.needRefresh && !_t.inited[_t.currentLabel]) {
              _t.inited[_t.currentLabel] = true
              _t.refOpera(`comp${_t.currentValue}`, 'resize')
            }
            if (_t.sameSelection) {
              _t.refOpera(`comp${_t.currentValue}`, 'setDefault', oldSelected)
            }
            resolve()
          }, 10)
        })
      })
    },
    setDefault() {
      this.currentLabel = this.options[0].label
      this.currentValue = this.options[0].value
      this.originLabel = this.options[0]
    },
    getNames() {
      const list = []
      const keys = Object.keys(this.content)
      keys.forEach((val, key) => {
        list.push(...this.refOpera('comp' + val, 'getNames'))
      })
      return list
    },
    allSteps(args) {
      if (!this.argsCheck && args) this.argsCheck = args
      if (this.gotData < 0) this.gotData = this.options.length
      const _this = this
      this.tabExchangeIndex += 1
      if (this.options[this.tabExchangeIndex]) {
        this.tabChoose(this.options[this.tabExchangeIndex]).then(() => {
          this.$nextTick(() => {
            _this.refOpera(
              'comp' + _this.currentValue,
              'allSteps',
              args || this.argsCheck
            )
          })
        })
      }
    },
    getVariableMap() {
      const list = []
      const keys = Object.keys(this.content)
      keys.forEach((val, key) => {
        list.push(...this.refOpera('comp' + val, 'getVariableMap'))
      })
      return list
    },
    combineData(data) {
      this.gotData -= 1
      this.listData.push(...data['group'])
      if (this.gotData === 0) {
        this.$emit('reporter', { group: this.listData }, 'group')
        this.listData = []
        this.gotData = -1
        this.tabExchangeIndex = -1
        this.argsCheck = null
        this.tabChoose(this.originLabel)
      } else {
        this.allSteps()
      }
    },
    resize() {
      this.$nextTick(() => {
        for (const key in this.content) {
          this.refOpera('comp' + key, 'resize')
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../styles/position';
.tab_component-container {
	.front-inrow {
		@include flex(row, space-between, center);
	}
	.front-inrow-left {
		@include flex(row, flex-start, center);
	}
	.tab_selection {
		font-size: 14px;
		padding: 5px 15px;
		border-radius: 2px;
		color: #494ece;
		background-color: #eee;
		margin-right: 2px;
		cursor: pointer;
	}
	.padding-right {
		padding-right: 12px;
	}
	.selected {
		color: white;
		background-color: #5e7feb;
	}
	.tab-container_item {
		display: none;
	}
	.tab-container_item-show {
		display: block;
	}
	.no-border {
		border: 0px;
	}
	.no-padding {
		padding-bottom: 0px;
		padding-top: 0px;
	}
}
</style>
