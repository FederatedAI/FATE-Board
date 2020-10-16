<template>
  <div :class="className" class="step__container">
    <div class="step__main">
      <span
        v-for="(item, index) in options"
        :key="index"
        :class="{'step__each-active': stepChoosed(item)}"
        class="step__each"
        @click.stop="stepChange(item)"
      >{{ item.label }}</span>
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

export default {
  name: 'Step',
  props: {
    options: {
      type: Array,
      default: () => []
    },
    className: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selected: ''
    }
  },
  watch: {
    selected() {
      this.change()
      this.confirm()
    }
  },
  methods: {
    change() {
      this.$emit('change', this.selected)
    },
    confirm() {
      this.$emit('change', this.selected)
    },
    stepChange(item) {
      this.selected = item.value
    },
    stepChoosed(item) {
      return item.value === this.selected
    },
    toStep(row) {
      if (row > this.options.length) {
        this.selected = this.options[this.options.length].value
      } else if (row <= 0) {
        this.selected = this.options[0].value
      } else {
        this.selected = this.options[row - 1].value
      }
    },
    setDefault() {
      this.toStep(1)
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
.step__main {
	display: flex;
	flex-direction: row;
}
.step__each {
	width: 48px;
	height: 24px;
	font-size: 12px;
	color: #6a6c75;
	background-color: #ebedf0;
	border-radius: 2px;
	margin-right: 10px;
	line-height: 24px;
	text-align: center;
	cursor: pointer;
}
.step__each-active {
	background-color: #4159d1;
	color: #ffffff;
}
</style>
