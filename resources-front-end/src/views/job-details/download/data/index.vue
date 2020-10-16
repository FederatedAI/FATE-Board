<template>
  <el-dialog
    :visible.sync="visible"
    class="dialog"
    append-to-body
    title="Data Download"
    @open="onOpen"
  >
    <div class="wrap">
      <div class="header">
        <div>Use the script below to download data</div>
        <div ref="btn" :data-clipboard-text="codeContent" class="copy" @click="onClick">{{ btnText }}</div>
      </div>
      <div class="content">
        <div class="code">{{ codeContent }}</div>
      </div>
    </div>
  </el-dialog>
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

import ClipboardJS from 'clipboard'

export default {
  props: {
    code: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      isCopied: false,
      copyFailed: false,
      inited: false,
      codeContent: ''
    }
  },
  computed: {
    btnText() {
      return this.copyFailed ? 'copy faild' : this.isCopied ? 'Copied!' : 'Copy'
    }
  },
  watch: {
    code: {
      handler(val) {
        this.codeContent = val
      },
      immediate: true
    }
  },
  methods: {
    initClipboard() {
      const clipboard = new ClipboardJS(this.$refs.btn)
      clipboard.on('success', () => {
        this.isCopied = true
        this.copyFailed = false
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.isCopied = false
        }, 3000)
      })
      clipboard.on('error', () => {
        this.copyFailed = true
      })
      this.$once('hook:beforeDestory', () => {
        clipboard.destory()
      })
    },
    onClick(event) {
      if (this.isCopied) {
        event.stopImmediatePropagation()
      }
    },
    onOpen() {
      if (!this.inited) {
        this.$nextTick(() => {
          this.initClipboard()
        })
        this.inited = true
      }
    },
    show(code) {
      this.codeContent = code
      this.visible = true
    },
    hide() {
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../common';

.wrap {
	display: flex;
	flex-flow: column;
}

.header {
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-between;
	align-items: center;
	padding: 0 20px;
	font-weight: 700;
}

.content {
	flex: 1;
	min-height: 0;
	padding: 0 20px;
}
.code {
	height: 100%;
	background: rgb(250, 251, 252);
	padding: 10px;
	line-height: 1.6;
	color: rgb(161, 163, 171);
	overflow: hidden;
	white-space: pre-wrap;
}

.copy {
	color: $blue;
	padding: 7px 10px;
	font-weight: bold;
	cursor: pointer;
	user-select: none;
}
</style>
