<template>
  <div :class="className" class="input__container">
    <span v-if="label" class="input__label">{{ label + ':' }}</span>

    <el-input
      ref="cusInput"
      v-model="inputed"
      :size="size"
      :placeholder="$attrs['placeholder'] || placeholder"
      :clearable="clearable"
      :disabled="disabled"
      :class="inputClassName"
      v-bind="$attrs"
      @change="contentChange"
      v-on="$listeners"
    >
      <template slot="suffix">
        <slot name="suffix" />
      </template>
    </el-input>
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
import disableCheck from '@/mixin/DisableCheck'
export default {
  name: 'CusInput',
  mixins: [basicOperation, disableCheck],
  props: {
    label: {
      type: String,
      default: ''
    },
    className: {
      type: String,
      default: ''
    },
    format: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: String | Object,
      default: ''
    },
    inputClassName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      size: 'mini',
      clearable: true,
      placeholder: '',

      inputed: ''
    }
  },
  watch: {
    inputed() {
      // todo: format
    }
  },
  methods: {
    change() {
      this.$emit('change', this.inputed)
    },
    confirm() {
      this.$emit('form', this.inputed)
    },
    contentChange() {
      this.change()
      this.confirm()
    },
    getParam() {
      return this.inputed
    },
    setParam(value) {
      this.inputed = value
    },
    reset() {
      this.inputed = ''
    }
  }
}
</script>

<style lang="scss">
@import '../../../styles/position';
.el-input {
	max-width: 150px;
	height: 24px;
	input {
		width: 100%;
		height: 24px !important;
		padding: 0px 10px;
		background: #f8f8fa;
		border-radius: 2px;
		line-height: 24px;
	}
	.el-input__icon {
		line-height: 24px;
	}
	.el-input-group__append {
		border: 0px;
		border-radius: 2px;
		background: #f8f8fa;
		padding-right: 10px;
		padding-left: 0px;
	}
	.el-select__caret {
		line-height: 24px;
	}
	.el-input__suffix-inner {
		@include flex(row, flex-end, center);
	}
}
</style>
