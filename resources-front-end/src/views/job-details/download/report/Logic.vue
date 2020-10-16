<template>
  <div class="logic">
    <el-form :show-message="false" inline size="mini">
      <el-form-item>
        <el-checkbox :value="checked" @change="handleUpdate($event, 'checked')">
          <div class="label">{{ label }}</div>
        </el-checkbox>
      </el-form-item>
      <el-form-item :error="error">
        <el-select :value="operator" style="width: 90px" @change="handleUpdate($event, 'operator')">
          <el-option v-for="(op, index) in operators" :key="index" v-bind="op" />
        </el-select>
      </el-form-item>
      <el-form-item :error="error">
        <el-input
          :value="condition"
          :placeholder="placeholder"
          class="condition"
          @input="handleInput"
          @change="handleChange"
        />
      </el-form-item>
    </el-form>
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

const OPERATORS = {
  greater: '>',
  less: '<',
  equal: '=',
  greaterOrEqual: '≥',
  lessOrEqual: '≤',
  notEqual: '≠',
  in: 'in',
  notIn: 'not in'
}

export default {
  name: 'Logic',
  props: {
    checked: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    variableType: {
      type: String,
      default: 'int'
    },
    operator: {
      type: String,
      default: 'greater',
      validator: val => OPERATORS[val]
    },
    condition: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      error: undefined
    }
  },
  computed: {
    operators() {
      return Object.entries(OPERATORS).map(([key, value]) => {
        return {
          value: key,
          label: value
        }
      })
    },
    placeholder() {
      const { label, variableType, isRangeType } = this
      let like = isRangeType ? [1, 4, 5] : [1]
      like = variableType === 'int' ? like : like.map(val => val / 100)
      return `enter ${isRangeType ? `${label} range` : `an ${label}`} like: ${
        like[0]
      }${like[1] ? `,${like[1]}~${like[2]}` : ''}`
    },
    isRangeType() {
      return this.operator === 'in' || this.operator === 'notIn'
    }
  },
  methods: {
    handleUpdate(val, prop) {
      this.$emit(`update:${prop}`, val)
      this.$emit('updated')
    },
    handleInput(val) {
      val = val.replace(/[，、。/\\。；;]/g, ',')
      val = val.replace(/(-{1,2})|——/g, '~')
      this.handleUpdate(val, 'condition')
    },
    handleChange(val) {
      this.$nextTick(() => {
        this.validate(this.condition)
      })
    },
    validate(val) {
      if (this.checked && val) {
        this.error = this.isRangeType
          ? this.validateRange(val)
          : this.validateNumber(val)

        this.$emit('error', this.error)
      }
    },
    validateNumber(val) {
      if (/^[+-]?(0|([1-9]\d*))(\.\d+)?$/.test(val)) {
        return
      }
      return `Invalid number ${val}`
    },
    validateRange(val) {
      const rangeArr = val.split(',')
      const errorArr = []
      rangeArr.forEach(range => {
        if (range) {
          let arr = []
          if (range.indexOf('~') < 0) {
            this.validateNumber(range) && errorArr.push(range)
          } else {
            arr = range.split('~')
            if (arr.length > 2) {
              errorArr.push(range)
            } else {
              const allValid = arr.every(num => !this.validateNumber(num))
              if (!allValid || +arr[0] >= +arr[1]) {
                errorArr.push(range)
              }
            }
          }
        }
      })
      return errorArr.length
        ? `Invalid range ${errorArr.join('...')}`
        : undefined
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/common/color';
.condition {
	width: 360px;
	max-width: 360px;
	/deep/ .el-input__inner {
		height: 24px;
		background: $gray-lighter;
		border: 2px solid transparent;
	}
	@at-root .is-error & {
		/deep/ {
			.el-input__inner,
			.el-input__inner:focus {
				border-color: #f56c6c;
				border-radius: 2px;
			}
		}
	}
	@at-root .is-success & {
		/deep/ {
			.el-input__inner,
			.el-input__inner:focus {
				border-color: transparent;
			}
		}
	}
}

.label {
	// min-width: 80px;
	color: $gray;
	margin-right: 15px;
}
/deep/ .el-form-item {
	margin-bottom: 10px;
}
</style>
