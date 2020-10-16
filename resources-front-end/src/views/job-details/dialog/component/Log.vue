<template>
  <div style="height: calc(100vh - 190px)">
    <log :logs="logs" @scroll-top="handleScrollTop" />
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

import Log from '@/components/Log'
import ReconnectingWebSocket from '@/utils/ReconnectingWebSocket'

const getDefaults = data => {
  return {
    logs: null,
    logSize: 0,
    logType: '',
    ...data
  }
}

export default {
  components: {
    Log
  },
  props: {
    componentName: {
      type: String,
      default: ''
    },
    jobId: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      default: ''
    },
    partyId: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return getDefaults()
  },
  watch: {
    logSize(val) {
      if (val) {
        this.onPull(false)
      }
    },
    componentName: {
      handler() {
        if (this.visible) {
          this.clearData()
          this.closeSocket()
          this.initLogSocket()
        }
      },
      immediate: true
    },
    visible: 'visibleHandler'
  },
  beforeDestroy() {
    this.closeSocket()
  },
  methods: {
    initLogSocket() {
      if (!this.ws) {
        const { jobId, role, partyId, componentName } = this
        if (!jobId || !role || !partyId || !componentName) {
          console.warn(`Missing required parameters`)
        }
        this.ws = new ReconnectingWebSocket(
          `/log/new/${jobId}/${role}/${partyId}/${componentName}`
        )
        this.ws.addEventListener('message', event => {
          this.handleLogMessage(JSON.parse(event.data))
        })
      }
      return this.ws
    },
    handleLogMessage(data) {
      const type = data.type
      switch (type) {
        case 'logSize':
          this.handleLogSizeResponse(data.data)
          break
        case 'componentInfo':
          this.insertLogs(data)
          break
        default:
          break
      }
    },
    handleLogSizeResponse(data) {
      const entries = Object.entries(data)[0]
      this.logType = entries[0]
      this.logSize = entries[1]
    },
    handleScrollTop() {
      this.onPull()
    },
    onPull(backward = true) {
      const count = this.logSize
      const size = 50
      const logs = this.logs || []
      let begin
      let end
      if (!logs.length) {
        end = count
        begin = Math.max(end - size, 1)
      } else {
        if (backward) {
          end = logs[0].lineNum - 1
          begin = Math.max(1, end - size)
        } else {
          begin = logs[logs.length - 1].lineNum + 1
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
					    type: this.logType,
					    begin,
					    end
					  })
					)
      } else {
        this.logs = []
      }
    },
    insertLogs(data) {
      const { data: target } = data
      const logs = this.logs || []
      let result = []
      if (logs.length) {
        result = result.concat(logs, target)
        result.sort((a, b) => {
          return a.lineNum - b.lineNum
        })
        let len = result.length
        let lineNum
        while (--len > -1) {
          if (lineNum === result[len].lineNum) {
            result.splice(len, 1)
          } else {
            lineNum = result[len].lineNum
          }
        }
      } else {
        result = target
      }
      result = result.map(item => Object.freeze(item))
      this.logs = result
    },
    getLogsRange(arr) {
      return [arr[0].lineNum, arr[arr.length - 1].lineNum]
    },
    visibleHandler(isVisible) {
      if (isVisible) {
        this.initLogSocket()
      } else {
        this.clearData()
        this.closeSocket()
      }
    },
    clearData() {
      Object.assign(this, getDefaults())
    },
    closeSocket() {
      this.ws && this.ws.close()
      this.ws = null
    }
  }
}
</script>

<style>
</style>
