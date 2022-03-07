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

const DEFAULTS = {
  autoOpen: true, // 自动连接
  reconnectInterval: 1000, // 重连尝试间隔
  maxReconnectInterval: 3000, // 最大重连间隔时间
  timeoutInterval: 2000, // 每次连接的超时时间
  maxReconnectAttempts: 5, // 最大重连尝试
  reconnectDecay: 1.5,
  heartCheck: true
}
// 重连次数
// 重连间隔时间
// 自动打开
// 兼容ie9的写法
// function generateEvent(s, originEvent, detail) {
//   const evt = document.createEvent('CustomEvent')
//   evt.originEvent = originEvent
//   evt.initCustomEvent(s, false, false, detail)
//   return evt
// }
function generateEvent(s, originEvent, detail) {
  const evt = new CustomEvent(s, { detail })
  evt.originEvent = originEvent
  return evt
}

function getHeartCheckObj(ws) {
  return {
    timeout: 60000,
    timer: null,
    reset: function() {
      clearTimeout(this.timer)
      this.start()
    },
    start: function() {
      this.timer = setTimeout(() => {
        ws.send(JSON.stringify(''))
      }, this.timeout)
    },
    stop: function() {
      clearTimeout(this.timer)
    }
  }
}

function isHttps() {
  return window.location.protocol === 'https:'
}

export default class ReconnectingWebSocket {
  static CONNECTING = WebSocket.CONNECTING
  static OPEN = WebSocket.OPEN
  static CLOSING = WebSocket.CLOSING
  static CLOSE = WebSocket.CLOSE
  static PROTOCOL = isHttps() ? 'wss://' : 'ws://'
  static baseUrl = `${ReconnectingWebSocket.PROTOCOL}${location.host}`
  constructor(url, protocols, options = {}) {
    this.url = url
    this.protocols = protocols
    this.options = Object.assign({}, DEFAULTS, options)

    this.ws = null
    this.timeouted = false
    this.reconnectAttempts = 0
    this.readyState = WebSocket.CONNECTING
    this.forcedClose = false
    const eventTarget = document.createElement('div')
    this.eventTarget = eventTarget

    this.addEventListener = eventTarget.addEventListener.bind(eventTarget)
    this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget)
    this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget)

    if (this.options.autoOpen) {
      setTimeout(() => {
        this.open(false)
      })
    }
  }
  open(reconnectAttempt) {
    const { dispatchEvent } = this
    const { reconnectInterval, timeoutInterval, reconnectDecay, maxReconnectAttempts, maxReconnectInterval, heartCheck } = this.options
    console.log(this.reconnectAttempts)
    if (this.reconnectAttempts) {
      if (maxReconnectAttempts && this.reconnectAttempts > maxReconnectAttempts) {
        return
      }
    } else {
      dispatchEvent(generateEvent('connecting'))
      this.reconnectAttempts = 0
    }
    if (!this.ws) {
      this.ws = new WebSocket(ReconnectingWebSocket.baseUrl + this.url, this.protocols)
    }

    const ws = this.ws
    let _heartCheck = null
    if (heartCheck) {
      _heartCheck = getHeartCheckObj(ws)
    }

    // 连接超时判断
    const timeout = setTimeout(() => {
      // 超时逻辑
      this.timeouted = true
      this.ws.close()
      this.timeouted = false
    }, timeoutInterval)
    ws.onopen = event => {
      // 清除超时计时器
      clearTimeout(timeout)
      this.protocols = ws.protocols
      this.readyState = WebSocket.OPEN
      const evt = generateEvent('open', event)
      evt.isReconnect = reconnectAttempt
      reconnectAttempt = false
      // 更改状态
      dispatchEvent(generateEvent('open', event))
      _heartCheck && _heartCheck.start()
    }

    ws.onclose = event => {
      clearTimeout(timeout)
      _heartCheck && _heartCheck.stop()
      this.ws = null
      // 是否强制关闭
      if (this.forcedClose) {
        this.readyState = WebSocket.CLOSED
        dispatchEvent(generateEvent('close', event))
      } else {
        this.readyState = WebSocket.CONNECTING
        const evt = generateEvent('connecting')
        evt.code = event.code
        evt.reason = event.reason
        evt.wasClean = event.wasClean
        dispatchEvent(evt)
        if (!reconnectAttempt && !this.timeouted) {
          dispatchEvent(generateEvent('close', event))
        }
        const timeout = reconnectInterval * Math.pow(reconnectDecay, this.reconnectAttempts)
        setTimeout(() => {
          this.reconnectAttempts++
          this.open(true)
        }, Math.min(timeout, maxReconnectInterval))
      }
    }

    ws.onmessage = event => {
      const e = generateEvent('message', event)
      e.data = event.data
      dispatchEvent(e)
      _heartCheck && _heartCheck.reset()
    }

    ws.onerror = event => {
      dispatchEvent(generateEvent('error', event))
    }
  }
  send(data) {
    if (this.ws) {
      return this.ws.send(data)
    }
  }
  close(code = 1000, reason) {
    this.forcedClose = true
    if (this.ws) {
      this.ws.close(code, reason)
    }
  }
}
