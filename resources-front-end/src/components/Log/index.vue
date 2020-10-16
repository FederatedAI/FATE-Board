<template>
  <div class="log-content">
    <div v-if="!logs" class="log-tip">
      <span>loading...</span>
    </div>
    <div v-else-if="!logs.length" class="log-tip">
      <span>no data</span>
    </div>
    <scroll
      v-else
      ref="scroller"
      :items="logs"
      :min-item-size="20"
      emit-scroll
      class="log-contents"
      @scroll-top="$emit('scroll-top')"
      @scroll="onScroll"
      @hook:mounted="afterScrollMount"
    >
      <div slot-scope="{ item }" :id="item.lineNum" class="flex flex-row">
        <span class="log-lineNum">{{ item.lineNum }}</span>
        <span class="log-content">{{ item.content }}</span>
      </div>
    </scroll>
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

import Scroll from '@/components/VirtualScroll'

export default {
  components: {
    Scroll
  },
  props: {
    logs: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      bottom: 0
    }
  },
  watch: {
    logs(val, oldVal) {
      if (!val) return
      if (oldVal) {
        if (oldVal.length < val.length) {
          const firstItem = val[0].lineNum
          const firstOldItem = oldVal[0].lineNum
          const lastItem = val[val.length - 1].lineNum
          const lastOldItem = oldVal[oldVal.length - 1].lineNum
          let index
          if (firstItem < firstOldItem && lastItem === lastOldItem) {
            index = firstOldItem
            this.scrollTo(val.findIndex(item => item.lineNum === index))
          } else if (lastItem > lastOldItem && firstItem === firstOldItem) {
            if (this.bottom > 0) {
              return
            }
            this.afterScrollMount()
          }
        }
      } else {
        this.afterScrollMount()
      }
    }
  },
  methods: {
    afterScrollMount() {
      this.$refs.scroller && this.$refs.scroller.scrollToBottom()
    },
    scrollTo(index) {
      this.$refs.scroller && this.$refs.scroller.scrollToItem(index)
    },
    onScroll(detail) {
      this.bottom = detail.bottom
    },
    setSpace(content) {
      return content
      // return content.replace(/\s/g, '&nbsp;')
    }
  }
}
</script>

<style lang="scss" scoped>
.log-content {
	height: 100%;
	white-space: pre-wrap;
	font-family: 'lucon', 'Lucida Console', Monaco, monospace, 'Arial';
}
.log-contents {
	height: 100%;
	overflow-y: auto;
	overflow-x: hidden;
	position: absolute;
	width: 100%;
	background: #fff;
	.log-lineNum {
		font-family: 'lucon', 'Lucida Console', Monaco, monospace, 'Arial';
		color: #c6c8cc;
		min-width: 50px;
		margin-right: 20px;
		font-size: 12px;
		text-align: left;
		line-height: 20px;
	}
	.log-content {
		color: #999ba3;
		font-size: 12px;
		text-align: left;
		text-indent: initial;
		line-height: 20px;
	}
}
.log-tip {
	width: 100%;
	text-align: center;
	color: #999ba3;
}
</style>
