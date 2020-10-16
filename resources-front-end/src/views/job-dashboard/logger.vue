<template>
  <section class="log-section flex flex-col">
    <div class="flex flex-row flex-start">
      <div
        v-for="(item, index) in tips"
        :key="index"
        :class="{'tip-choose-active': currentTip === item}"
        class="tip-choose flex flex-row"
        @click="changeTip(item)"
      >
        <span class="tip-content">{{ item }}</span>
        <span v-if="maxLength[item] > 0" :class="item" class="tip-count">{{ maxLength[item] }}</span>
      </div>
    </div>
    <div v-loading="loading" class="log-containers">
      <ul
        v-for="(type, index) in tips"
        :ref="'logContent'+type"
        :key="index"
        :style="{'z-index': currentTip === type ? 2 : 1}"
        class="log-contents"
        @mousewheel="getCache"
        @DOMMouseScroll="getCache"
      >
        <li v-for="(content) in logs[type]" :key="content.lineNum" class="flex flex-row">
          <span class="log-lineNum">{{ content.lineNum }}</span>
          <span class="log-content">{{ content.content }}</span>
        </li>
      </ul>
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

import { initWebSocket } from '@/utils'
import { queryLog, queryLogSize } from '@/api/job'
export default {
  name: 'Logger',

  props: {
    tips: {
      type: Array,
      default: () => ['error', 'warning', 'info', 'debug']
    },
    jobId: {
      type: String,
      default: ''
    },
    partyId: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'waiting'
    },
    firstTip: {
      type: String,
      default: 'info'
    }
  },

  data() {
    return {
      // MaxSize of log
      maxLength: {},
      logs: {},
      needReq: {},
      websockets: {},
      correctMax: {},
      currentTip: '',
      loading: true,
      cacheCheck: false // 函数防抖
    }
  },

  watch: {
    status(oldValue, newValue) {
      if (this.status.toLowerCase().match(/(success|complete|fail|cancel)/)) {
        this.queryAllLogSize().then(res => {
          for (const type of this.tips) {
            this.closeWebsocket(type)
          }
        })
      }
    }
  },

  created() {
    this.$init()
  },

  mounted() {
    setTimeout(() => {
      this.loading = false
    }, 1500)
  },

  methods: {
    async $init() {
      for (const key of this.tips) {
        this.maxLength[key] = 0
        this.logs[key] = []
        this.needReq[key] = {}
        this.websockets[key] = {}
        this.correctMax[key] = false
      }
      this.currentTip = this.firstTip
      if (!this.status.toLowerCase().match(/(success|complete|fail|cancel)/)) {
        this.initAllSocket()
      } else {
        await this.queryAllLogSize()
        this.queryAllLog()
      }
    },

    async _request(
      param,
      req,
      exchange = (data, meta) => {
        return { data, meta }
      }
    ) {
      const def = {
        job_id: this.jobId,
        party_id: this.partyId,
        role: this.role
      }
      param = Object.assign(def, param)
      const res = await req(param)
      return exchange(res.data, res.meta)
    },

    async queryLogSize(type) {
      await this._request(
        {
          type
        },
        queryLogSize,
        (data, meta) => {
          this.maxLength[type] = data
          this.correctMax[type] = true
        }
      )
    },

    async queryAllLogSize() {
      for (const type of this.tips) {
        await this.queryLogSize(type)
      }
      return true
    },

    async queryLog(type, begin, end, exchange) {
      await this._request(
        {
          componentId: 'default',
          begin,
          end,
          type
        },
        queryLog,
        (data, meta) => {
          if (typeof exchange === 'function') {
            data = exchange(data)
          }
          this.mixin(type, data)
        }
      )
      return true
    },

    mixin(type, newList) {
      const needRequest = []
      let list = this.logs[type]
      if (list.length === 0 && newList.length === 0) {
        return false
      }
      if (list.length === 0 && newList && newList.length > 0) {
        list = newList
      }
      if (newList && list[0].lineNum > newList[newList.length - 1].lineNum) {
        const needBetween = {}
        needBetween.start = newList[newList.length - 1].lineNum + 1
        needBetween.end = list[0].lineNum - 1
        if (needBetween.start < needBetween.end) needRequest.push(needBetween)
        list.splice(0, 0, ...newList)
      } else if (
        newList &&
				list[list.length - 1].lineNum < newList[0].lineNum
      ) {
        const needBetween = {}
        needBetween.start = list[list.length - 1].lineNum + 1
        needBetween.end = newList[0].lineNum - 1
        if (needBetween.start < needBetween.end) needRequest.push(needBetween)
        list.splice(list.length, 0, ...newList)
      } else if (
        newList &&
				newList[0].lineNum > list[0].lineNum &&
				newList[newList.length - 1].lineNum > list[list.length - 1].lineNum
      ) {
        list.splice(
          list.length,
          0,
          newList.splice(list[list.length].lineNum - newList[0].lineNum + 1)
        )
      } else if (
        newList &&
				newList[0].lineNum < list[0].lineNum &&
				newList[newList.length - 1].lineNum < list[list.length - 1].lineNum
      ) {
        list.splice(
          0,
          0,
          newList.splice(
            0,
            newList.length -
							(newList[newList.length - 1].lineNum - list[0].lineNum + 1)
          )
        )
      } else if (
        newList &&
				newList[0].lineNum < list[0].lineNum &&
				newList[newList.length - 1].lineNum > list[list.length - 1].lineNum
      ) {
        list = newList
      }
      this.logs[type] = list
      if (list[0].lineNum !== 1) {
        needRequest.push({
          start: 1,
          end: list[0].lineNum - 1
        })
      }
      if (this.maxLength[type] > 0 && list[0].length < this.maxLength[type]) {
        needRequest.push({
          start: list[list.length - 1].lineNum,
          end: this.maxLength[type]
        })
      }
      this.needReq[type] = needRequest
    },

    async queryAllLog() {
      const maxReq = 1000
      for (const type of this.tips) {
        if (this.maxLength[type] > 0) {
          const end = this.maxLength[type]
          const start = this.end - maxReq < 1 ? 1 : this.end - maxReq
          await this.queryLog(type, start, end)
        }
      }
    },

    async queryCache(type, before = true) {
      const max = 1000
      if (before) {
        if (
          this.maxLength[type] > 0 &&
					this.logs[type].length > 0 &&
					this.logs[type][0].lineNum > 1
        ) {
          const end = this.logs[type][0].lineNum - 1
          const begin = end - max > 1 ? end - max : 1
          await this.queryLog(type, begin, end)
        }
      }
    },

    initWebsocket(type) {
      this.websockets[type] = initWebSocket(
        `/log/${this.jobId}/${this.role}/${this.partyId}/default/${type}`,
        res => {
          // console.log(item, 'success')
        },
        res => {
          const data = JSON.parse(res.data)
          // console.log(item, data)
          this.mixin(type, data)
          /* eslint-disable */
					if (
						!this.status.toLowerCase().match(/(success|complete|fail|cancel)/)
					) {
						const end =
							this.logs[type].length > 0
								? this.logs[type][this.logs[type].length - 1].lineNum
								: 0
						if (this.maxLength[type] < end) {
							this.maxLength[type] = end
						}
					} else {
						this.closeWebsocket(type)
					}
					if (data.length > 0) {
						this.$forceUpdate()
					}
				}
			)
		},

		closeWebsocket(type) {
			if (
				this.correctMax[type] &&
				this.status.toLowerCase().match(/(success|complete|fail|cancel)/)
			) {
				if (
					this.logs[type][this.logs[type].length - 1] ===
						this.maxLength[type] &&
					this.websockets[type]
				) {
					this.websockets[type].close()
				}
			}
		},

		initAllSocket() {
			for (const type of this.tips) {
				this.initWebsocket(type)
			}
		},

		changeTip(type) {
			this.currentTip = type
			this.$nextTick(() => {
				this.getCache()
			})
		},

		async getCache(ev) {
			if (ev) {
				ev.stopPropagation()
			}
			if (this.cacheCheck) {
				return false
			}
			const delta = ev ? ev.wheelDelta || ev.detail * -24 : 1
			const dom = this.$refs['logContent' + this.currentTip][0]
			const st = dom.scrollTop
			const oh = dom.scrollHeight
			if (
				ev &&
				((delta > 0 && st <= delta) ||
					(delta < 0 && oh - dom.clientHeight - st <= -1 * delta))
			) {
				dom.scrollTop = delta > 0 ? 0 : oh
				ev.preventDefault()
			}
			if (st < oh * 0.1 && delta > 0) {
				this.cacheCheck = true
				await this.queryCache(this.currentTip)
				this.$forceUpdate()
				this.$nextTick(() => {
					this.cacheCheck = false
					const nh = dom.scrollHeight
					dom.scrollTop = st + (nh - oh)
				})
			}
		}
	}
}
</script>

<style scoped lang="scss">
.log-section {
	width: calc(100% - 48px);
	height: calc(100% - 93px);
	position: absolute;
	background: #fff;
	.tip-choose {
		display: flex;
		align-items: center;
		font-weight: 500;
		$h: 26px;
		margin-right: 24px;
		padding: 0 5px 0 0;
		line-height: $h;
		border-radius: $h;
		cursor: pointer;
		.tip-content {
			padding: 0 8px 0 0;
			font-size: 14px;
			color: #6a6c75;
		}
		.tip-count {
			min-width: 16px;
			height: 16px;
			padding: 0 5px;
			border-radius: 2px;
			line-height: 16px;
			text-align: center;
			color: #fff;
		}
		.error {
			background: #ff4f38;
		}
		.warning {
			background: #fccf19;
		}
		.info {
			background: #0ec7a5;
		}
		.debug {
			background: #4159d1;
		}
		&:hover {
			.tip-content {
				color: #4159d1;
				text-decoration: underline;
			}
		}
	}
	.tip-choose-active {
		.tip-content {
			color: #4159d1;
		}
	}
	.log-containers {
		height: 100%;
		padding: 0px 12px 0px 0px;
		margin-top: 15px;
		overflow: auto;
		width: 100%;
		position: relative;
		.log-contents {
			height: 100%;
			overflow-y: auto;
			overflow-x: hidden;
			position: absolute;
			width: 100%;
			background: #fff;
			.log-lineNum {
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
	}
}
</style>
