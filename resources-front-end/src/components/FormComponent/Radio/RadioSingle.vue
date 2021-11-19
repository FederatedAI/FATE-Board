<template>
  <div class="box__container">
    <el-radio
      :label="value"
      :disabled="disabled"
      :class="{ 'box__check': Object.keys(group).length > 0 }"
      @change="choosedRadio"
    >{{ label }}</el-radio>
    <groups
      v-if="Object.keys(group).length > 0"
      ref="cusGroup"
      :form="group.form"
      :disabled="disabled"
      :default="true"
      :class-name="group.className"
      class="box__group"
      @change="groupChange"
      @form="groupForm"
      @search="groupSearch"
    />
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
export default {
  name: 'CusSingleRadio',
  components: {
    groups: () => import('../Group')
  },
  mixins: [basicOperation],
  props: {
    label: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    group: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Object | Array,
      default: () => {}
    },
    single: {
      type: Boolean,
      default: true
    },
    className: {
      type: String,
      default: ''
    },
    unique: {
      type: String,
      default: 'radioSingle'
    }
  },
  data() {
    return {
      choosed: false,
      propResult: '',
      formResult: '',

      disabled: false
    }
  },
  watch: {
    choosed() {
      this.boxChange()
    }
  },
  methods: {
    boxChange() {
      this.boxDisable()
      if (this.choosed) {
        if (Object.keys(this.group).length === 0) {
          this.propResult = this.value
        }
        this.change(this.propResult)
      }
    },
    boxDisable() {
      if (this.choosed && Object.keys(this.group).length !== 0) {
        this.refOpera('cusGroup', 'able')
      } else if (Object.keys(this.group).length !== 0) {
        this.refOpera('cusGroup', 'disable')
      }
    },
    groupChange(res) {
      this.propResult = res
      this.change(this.propResult)
    },
    groupForm(res) {
      this.formResult = res
      this.confirm(this.formResult)
    },
    confirm(value) {
      this.$emit('form', value)
    },
    groupSearch(res) {
      this.$emit('search', res)
    },
    getParam() {
      return this.formResult
    },
    disable() {
      this.disabled = true
      this.refOpera('cusGroup', 'disable')
    },
    able() {
      this.disabled = false
      this.refOpera('cusGroup', 'able')
    },
    setDefault(setting) {
      const config = setting && setting[this.unique]
      this.$set(this, 'choosed', config && config.radio || false)
      if (Object.keys(this.group).length > 0) {
        return this.refOpera('cusGroup', 'setDefault', config)
      }
      return true
    },
    getSelected() {
      return {
        [this.unique]: Object.assign({}, this.refOpera('cusGroup', 'getSelected'), { 'radio': this.choosed })
      }
    },
    choosedRadio() {
      if (this.single) {
        this.choosedChange()
      }
    },
    choosedChange() {
      this.choosed = !this.choosed
    },
    chooseBox() {
      this.choosed = true
    },
    unchooseBox() {
      this.choosed = false
    },
    allSteps() {
      let steps
      if (this.$refs['cusGroup']) {
        steps = this.refOpera('cusGroup', 'allSteps')
        if (steps) {
          for (const key in steps) {
            steps[key].title = this.label + '_' + steps[key].title
          }
        }
        return steps
      } else {
        steps = {}
        steps[this.value] = this.label
      }
      return steps
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../styles/position';
.box__container {
	@include flex(row, flex-end, center);
	height: 30px;
	.box__check {
		margin-right: 10px;
	}
}
</style>
