<template>
  <div class="form-tabs">
    <div v-if="processedTabs.length >= 2" class="form-tabs-top">
      <ul class="form-tabs-top__nav">
        <li
          v-for="(tab, index) in processedTabs"
          :key="index"
          :class="{ active: tab.active }"
          class="top-tab-item"
          @click="handleSwitchTab(tab)"
        >{{ tab.label }}</li>
      </ul>
    </div>
    <div v-if="currentTab" class="form-tabs-sub">
      <div class="form-tabs-top__hd">{{ currentTab.label }}</div>
      <div class="form-tabs-sub__nav">
        <div
          v-for="(subTab, index) in currentTab.children"
          :key="index"
          :class="{ active: subTab.active }"
          class="sub-tab-item"
          @click="handleSwitchTab(subTab)"
        >{{ subTab.label }}</div>
      </div>
      <refresh v-if="needRefresh" @refresh="$emit('refresh')" />
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

import basicOperation from '@/mixin/BasicOperation'
import Refresh from '../Refresh'

export default {
  name: 'Tabs',
  components: {
    Refresh
  },
  mixins: [basicOperation],
  props: {
    tabs: {
      type: Array,
      default: () => []
    },
    value: {
      type: String,
      default: ''
    },
    needRefresh: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      processedTabs: []
    }
  },
  computed: {
    currentTab() {
      return this.processedTabs.find(t => t.active)
    }
  },
  watch: {
    tabs: {
      handler(val) {
        if (val && val.length) {
          this.processTabs(val)
        }
      },
      immediate: true
    },
    value: {
      handler(val) {
        this.handleSwitchTab(val)
      },
      immediate: true
    }
  },
  created() {
    const value = this.getCurrentValue()
    this.change(value)
  },
  beforeDestroy() {
    clearTimeout(this.timer)
  },
  methods: {
    processTabs(tabs) {
      this.processedTabs = tabs.map((tab, index) => {
        const { children, ...rest } = tab
        const t = {
          ...rest,
          active: index === 0,
          parent: null
        }
        if (children && children.length) {
          t.children = children.map((child, index) => {
            return {
              ...child,
              parent: t,
              active: index === 0
            }
          })
        }
        return t
      })
    },
    handleSwitchTab(tab) {
      if (!tab) return
      const tabs = this.processedTabs
      const stack = []
      stack.push(...tabs)
      let t
      while (stack.length) {
        t = stack.shift()
        if (t === tab) {
          break
        }
        if (t.children && t.children.length) {
          stack.unshift(...t.children)
        }
      }
      let root = { children: this.processedTabs }
      let parent = t.parent || root
      let current = t

      while (parent) {
        parent.active = true
        if (parent.children) {
          parent.children.forEach(child => {
            child.active = child === current
          })
        }
        current = parent
        if (parent.parent) {
          parent = parent.parent
        } else if (root && parent !== root) {
          parent = root
          root = null
        } else {
          parent = null
        }
      }
      const value = this.getCurrentValue()
      this.change(value)
    },
    getCurrentValue() {
      let currentTab = this.currentTab
      let value
      while (currentTab) {
        const children = currentTab.children
        if (children) {
          currentTab = children.find(child => child.active)
        } else {
          value = currentTab.value
          return value
        }
      }
    },
    allSteps() {
      const res = {}
      this.processedTabs.forEach((item, index) => {
        if (item.children) {
          item.children.forEach((val, i) => {
            res[val.value] = {
              title: item.label + '_' + val.label
            }
          })
        }
      })
      return res
    },
    setDefault() {
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
.form-tabs-top {
	display: flex;
	flex: row nowrap;
	align-items: center;
	font-size: 20px;
	color: #3e4052;
	margin-bottom: 15px;
	cursor: pointer;
	&__hd {
		margin-right: 10px;
	}
	&__nav {
		display: flex;
	}
}

.top-tab-item {
	margin-right: 20px;
	padding: 5px 0;
	border-bottom: 2px solid transparent;
	font-weight: bold;
	font-size: 16px;
	cursor: pointer;
	&.active {
		border-color: #494ece;
		color: #494ece;
	}
}
.form-tabs-sub {
	display: flex;
	flex: row nowrap;
	align-items: center;
}

.form-tabs-top__hd {
	font-size: 24px;
	color: #3e4052;
	font-weight: bold;
}

.form-tabs-sub__nav {
	display: flex;
	flex: row nowrap;
	align-items: center;
	margin-right: 10px;
}

.sub-tab-item {
	height: 18px;
	width: 76px;
	text-align: center;
	line-height: 18px;
	font-size: 12px;
	background-color: #ebedf0;
	color: #4159d1;
	cursor: pointer;
	&.active {
		background-color: #4159d1;
		color: #fff;
	}
}
</style>
