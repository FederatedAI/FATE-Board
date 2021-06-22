<template>
  <div class="cus-slider__container">
    <span v-if="label" class="cus-slider__title">{{ label }}:</span>
    <el-slider
      v-model="sliderValue"
      :show-input="!range"
      :input-size="'mini'"
      :show-tooltip="true"
      :max="max"
      :min="min"
      :step="step"
      :range="range"
      :marks="marks"
      :style="styles"
      v-bind="$attrs"
      class="cus-slider__slider"
      @change="formatSlider"
    />
    <el-tooltip v-if="tip" :content="tip" class="item" effect="dark" placement="right">
      <i class="el-icon-question" />
    </el-tooltip>
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

import FloatFormat from '../mixin/FloatFormat'
export default {
  name: 'CusSlider',
  mixins: [FloatFormat],
  props: {
    label: {
      type: String,
      default: ''
    },
    value: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 1
    },
    min: {
      type: Number,
      default: 0
    },
    step: {
      type: Number,
      default: 0.01
    },
    marks: {
      type: Object,
      default: () => {}
    },
    tip: {
      type: String,
      default: ''
    },
    range: {
      type: Boolean,
      default: false
    },
    styles: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      sliderValue: this.value
    }
  },
  watch: {
    min() {
      this.sliderCheck()
    },
    max() {
      this.sliderCheck()
    }
  },
  created() {
    this.sliderCheck()
  },
  methods: {
    formatSlider(value) {
      if (!Array.isArray(value)) {
        this.sliderValue = this._nearby(value, this.step)
      }
      this.change()
    },

    change() {
      this.$emit('range', this.sliderValue)
    },

    setDefault() {
      this.change()
      return true
    },

    sliderCheck() {
      this.sliderValue = !this.range ? this.value : [this.min, this.max]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../styles/position';
.cus-slider__container {
	@include flex(row, flex-start, center);
	.cus-slider__slider {
		min-width: 350px;
		margin: 0 25px;
	}
}
</style>
