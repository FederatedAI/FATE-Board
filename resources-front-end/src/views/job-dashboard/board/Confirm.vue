<template>
  <el-dialog :visible.sync="shown" :before-close="onClose" width="510px">
    <div class="dialog-main-content">{{ title }}</div>
    <div class="dialog-sub-content">{{ content }}</div>
    <div class="flex justify-center" style="margin-top:72px;">
      <button
        :class="{'hoverbtn': willcheck === 1}"
        class="dialog-button"
        @mouseover="willcheck = 1"
        @mouseout="willcheck = 0"
        @click="onConfirm"
      >Sure</button>
      <button
        :class="{'hoverbtn': willcheck === 2}"
        class="dialog-button"
        style="margin-left: 23px;"
        @mouseover="willcheck = 2"
        @mouseout="willcheck = 0"
        @click="onCancel"
      >cancel</button>
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

export default {
  data() {
    return {
      shown: false,
      title: '',
      content: '',
      willcheck: 1
    }
  },
  watch: {
    $route() {
      // close confirm dialog when route change
      if (this._reject) {
        this.onCancel()
      }
    }
  },
  methods: {
    confirm(title, content) {
      if (this._reject) {
        this._reject(new Error('Repeated calls'))
      }
      return new Promise((resolve, reject) => {
        this.title = title
        this.content = content
        this.shown = true
        this.willcheck = 1
        this._resolve = resolve
        this._reject = reject
      })
    },
    onClose(done) {
      this.onCancel()
      done()
    },
    onCancel() {
      this._reject(false)
      this.clean()
    },
    onConfirm() {
      this._resolve()
      this.clean()
    },
    clean() {
      this.title = ''
      this.content = ''
      this.willcheck = 1
      this.shown = false
      this._resolve = null
      this._reject = null
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-main-content {
	font-family: 'Lato';
	font-size: 18px;
	color: #534c77;
	text-align: center;
	font-weight: bold;
	margin-bottom: 25px;
}

.dialog-sub-content {
	font-family: 'Lato';
	font-size: 12px;
	color: #bbbbc8;
	text-align: center;
}

.dialog-button {
	width: 135px;
	height: 32px;
	border-radius: 2px;
	border: 0px;
	font-family: 'Lato';
	font-weight: bold;
	font-size: 12px;
	text-align: center;
	cursor: pointer;
	outline: none;
	color: #7f7d8e;
	background-color: #e8e8ef;
	&:active {
		color: #ffffff;
		background-color: #3135a6;
	}
}

.hoverbtn {
	color: #ffffff;
	background-color: #494ece;
}
</style>
