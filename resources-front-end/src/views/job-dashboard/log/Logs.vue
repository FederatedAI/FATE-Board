<template>
  <div :class="{ 'log-expanded': expandAll }" class="log-wrapper">
    <!-- main tab -->
    <div class="flex flex-row flex-center flex-start">
      <div class="log-type flex flex-row">
        <span
          v-for="(value, key) in mainTabs"
          :key="key"
          :class="{'type-name-active': currentMainTab === key}"
          class="type-name"
          @click="changeMainTab(key)"
        >{{ key | capitalize }} Log</span>
      </div>
      <el-select
        v-if="instanceSelection.length > 1"
        v-model="currentInstanceId"
        :size="'mini'"
      >
        <el-option
          v-for="item in instanceSelection"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <!-- sub tab -->
    <section class="log-section flex flex-col">
      <div class="flex flex-row flex-start">
        <div
          v-for="(item, key) in mainTabs[currentMainTab].tabs"
          :key="key"
          :class="{'tip-choose-active': currentLogType === key}"
          class="tip-choose flex flex-row"
          @click="changeSubTab(key)"
        >
          <span class="tip-content">{{ item }}</span>
          <span v-if="counts[key] > 0" :class="item" class="tip-count">{{ counts[key] }}</span>
        </div>
      </div>
      <div class="log-containers">
        <log
          v-for="type in LOG_TYPES"
          v-show="currentLogType === type"
          :key="type"
          :logs="logs[type + '_' + currentInstanceId]"
          @scroll-top="handleScrollTop(type)"
        />
      </div>
    </section>
    <div ref="checklog" class="log-extend flex flex-center justify-center">
      <icon-hover-and-active
        v-show="expandAll"
        :default-url="icons.normal['dashBoardFold']"
        :hover-url="icons.hover['dashBoardFold']"
        :active-url="icons.active['dashBoardFold']"
        @clickFn="toggle"
      />
      <icon-hover-and-active
        v-show="!expandAll"
        :default-url="icons.normal['dashBoardUnfold']"
        :hover-url="icons.hover['dashBoardUnfold']"
        :active-url="icons.active['dashBoardUnfold']"
        @clickFn="toggle"
      />
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

import { mapGetters } from 'vuex'
import IconHoverAndActive from '@/components/IconHoverAndActive'
import Log from '@/components/Log'
import ReconnectingWebSocket from '@/utils/ReconnectingWebSocket'
import { getInstanceId } from '../../../api/chart'

const LOG_TYPES = [
  'partyError',
  'partyWarning',
  'partyInfo',
  'partyDebug',
  'jobSchedule',
  'jobError'
]

const [
  PARTY_ERROR,
  PARTY_WARNING,
  PARTY_INFO,
  PARTY_DEBUG,
  JOB_SCHEDULE,
  JOB_ERROR
] = LOG_TYPES

const LOG_TYPES_CAT = {
  logSize: 'logSize',
  log: 'log',
  [PARTY_ERROR]: 'log',
  [PARTY_WARNING]: 'log',
  [PARTY_INFO]: 'log',
  [PARTY_DEBUG]: 'log',
  [JOB_SCHEDULE]: 'log',
  [JOB_ERROR]: 'log'
}

function createTabObj(tabs, current, ...args) {
  return {
    tabs,
    current,
    ...args
  }
}

export default {
  components: {
    IconHoverAndActive,
    Log
  },
  filters: {
    capitalize(str) {
      return str.substring(0, 1).toUpperCase() + str.substring(1)
    }
  },
  props: {
    ids: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      currentMainTab: 'algorithm',
      algorithmTab: createTabObj(
        {
          [PARTY_ERROR]: 'error',
          [PARTY_WARNING]: 'warning',
          [PARTY_INFO]: 'info',
          [PARTY_DEBUG]: 'debug'
        },
        PARTY_INFO
      ),
      scheduleTab: createTabObj(
        {
          [JOB_SCHEDULE]: 'info',
          [JOB_ERROR]: 'error'
        },
        JOB_SCHEDULE
      ),
      logs: {},
      counts: {},
      logSizeHasRecevied: false,
      expandAll: false,

      // 高可用支持，多台机器，多份日志展示
      instanceId: [],
      currentInstanceId: '',

      runningInterval: null
    }
  },
  computed: {
    ...mapGetters(['icons']),
    LOG_TYPES() {
      return LOG_TYPES
    },
    mainTabs() {
      return {
        algorithm: this.algorithmTab,
        schedule: this.scheduleTab
      }
    },
    currentLogType() {
      return (
        this.mainTabs[this.currentMainTab] &&
				this.mainTabs[this.currentMainTab].current
      )
    },
    instanceSelection() {
      const list = []
      for (const id of this.instanceId) {
        list.push({
          label: id,
          value: id
        })
      }
      return list
    }
  },
  watch: {
    logSizeHasRecevied(val) {
      if (val) {
        this.onPull(this.currentLogType)
      }
    },
    counts: {
      handler(val, oldVal) {
        for (const key in val) {
          if (val.hasOwnProperty(key)) {
            if (val[key] !== oldVal[key] && key === this.currentLogType) {
              this.onPull(key, false)
            }
          }
        }
      },
      deep: true
    }
  },
  created() {
    this.getInstanceIdFromFlow().then(() => {
      this.initLogSocket()
    })
  },
  beforeDestroy() {
    this.runningInterval && clearInterval(this.runningInterval)
    this.ws && this.ws.close()
  },
  methods: {
    changeMainTab(tab) {
      if (this.currentMainTab === tab) {
        return
      }
      this.currentMainTab = tab
      this.shouldInitLogByType(this.currentLogType)
    },
    changeSubTab(tab) {
      if (this.currentLogType === tab) {
        return
      }
      this.mainTabs[this.currentMainTab].current = tab
      this.shouldInitLogByType(tab)
    },
    shouldInitLogByType(type) {
      return !this.logs[type + '_' + this.currentInstanceId] && this.onPull(type)
    },
    getInstanceIdFromFlow() {
      return getInstanceId().then((res) => {
        const result = []
        for (const [instance] of Object.entries(res.data)) {
          if (instance.host === window.location.host) {
            this.currentInstanceId = instance.instance_id
          }
          result.push(instance.instance_id)
        }
        if (!this.currentInstanceId) {
          this.currentInstanceId = result[0]
        }
        this.instanceId = result
      })
    },
    initLogSocket() {
      if (!this.ws) {
        const { jobId, role, partyId } = this.ids
        if (!jobId || !role || !partyId) {
          console.warn(`Missing required parameters`)
        }
        this.ws = new ReconnectingWebSocket(
          `/log/new/${jobId}/${role}/${partyId}/default`
        )
        this.ws.addEventListener('message', event => {
          const res = { data: JSON.parse(event.data) }
          if (res.data[JOB_ERROR] !== undefined) {
            res.type = 'logSize'
          } else {
            res.type = 'log'
          }
          this.handleLogMessage(res)
        })
        this.ws.addEventListener('open', () => {
          this.intervalPull()
        })
      }
      return this.ws
    },
    handleLogMessage(data) {
      const type = LOG_TYPES_CAT[data.type]
      switch (type) {
        case 'logSize':
          this.handleLogSizeResponse(data.data)
          break
        case 'log':
          this.insertLogs(data.data)
          break
        default:
          break
      }
    },
    handleLogSizeResponse(size) {
      if (!this.logSizeHasRecevied) {
        this.logSizeHasRecevied = true
      }
      this.setLogSize(size)
    },
    setLogSize(size) {
      this.counts = Object.assign({}, this.counts, size)
    },
    onPull(type, backward = true) {
      const count = this.counts[type]
      const size = 50
      const logs = this.logs[type + '_' + this.currentInstanceId] || []
      const instanceId = this.currentInstanceId
      let begin
      let end
      if (!logs.length) {
        end = count
        begin = Math.max(end - size, 1)
      } else {
        if (backward) {
          end = parseFloat(logs[0].lineNum) - 1
          begin = Math.max(1, end - size)
        } else {
          begin = parseFloat(logs[logs.length - 1].lineNum) + 1
          end = count
        }
      }

      if (count > 0) {
        if (end < begin) {
          return
        }
        this.ws &&
					this.ws.send(
					  JSON.stringify({
					    instanceId,
					    type,
					    begin,
					    end
					  })
					)
      } else {
        this.logs[type + '_' + this.currentInstanceId] = []
      }
    },
    onCountPull() {
      const type = 'logSize'
      const instanceId = this.currentInstanceId
      this.ws.send(
        JSON.stringify({
          type,
          instanceId
        })
      )
    },
    intervalPull() {
      if (!this.runningInterval) {
        this.onCountPull()
        this.runningInterval = setInterval(() => {
          this.onCountPull()
        }, 10000)
      }
    },
    insertLogs(data) {
      const { type, data: target } = data
      const logs = this.logs[type + '_' + this.currentInstanceId] || []
      let result = []
      if (logs.length) {
        const targetRange = this.getLogsRange(target)
        const originRange = this.getLogsRange(logs)
        if (targetRange[0] > originRange[1]) {
          result = result.concat(logs, target)
        } else if (targetRange[1] < originRange[0]) {
          result = result.concat(target, logs)
        } else {
          const start = Math.max(targetRange[0], originRange[0])
          const end = Math.min(targetRange[1], originRange[1])
          const startIndex = logs.findIndex(value => Math.abs(parseFloat(value.lineNum) - start) < 0.001)
          const endIndex = logs.findIndex(value => Math.abs(parseFloat(value.lineNum) - end) < 0.001)
          result = logs.slice()
          result.splice(startIndex, endIndex - startIndex + 1, ...target)
        }
      } else {
        result = target
      }
      result = result.map(item => Object.freeze(item))
      this.logs = { ...this.logs, [type + '_' + this.currentInstanceId]: result }
    },
    getLogsRange(arr) {
      return [parseFloat(arr[0].lineNum), parseFloat(arr[arr.length - 1].lineNum)]
    },
    handleScrollTop(type) {
      this.onPull(type)
    },
    toggle() {
      this.expandAll = !this.expandAll
      if (this.expandAll) {
        this.$nextTick(() => {
          this.$el.scrollIntoView()
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.log-expanded {
	height: calc(100% - 28px) !important;
}
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
	}
}
</style>
