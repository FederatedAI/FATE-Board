<template>
  <section>
    <el-radio-group v-if="Array.isArray(options)" v-model="selected" class="radio-group__container">
      <c-box
        v-for="(item, index) in options"
        :key="index"
        :ref="item.value"
        :label="item.label"
        :value="item.value"
        :group="item.group || {}"
        :single="false"
        :unique="item.value"
        class="radio-group__box"
        @change="boxChange(arguments, item.value)"
        @form="boxForm(arguments, item.value)"
        @search="boxSearch"
      />
    </el-radio-group>
    <c-box
      v-else
      :ref="options.value"
      :label="options.label"
      :value="options.value"
      :group="options.group || {}"
      :unique="options.value"
      @change="boxChange(arguments, options.value)"
      @form="boxForm(arguments, options.value)"
      @search="boxSearch"
    />
  </section>
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
  name: 'CusRadio',
  components: {
    cBox: () => import('./RadioSingle')
  },
  mixins: [basicOperation],
  props: {
    options: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Array | Object,
      default: () => []
    },
    disabled: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Boolean | Array,
      default: false
    },
    unique: {
      type: String,
      default: 'CusRadio'
    }
  },
  data() {
    return {
      propResult: {},
      formResult: {},
      selected: '',
      canSend: false
    }
  },
  watch: {
    propResult: {
      handler() {
        this.change()
      },
      deep: true
    },
    formResult: {
      handler() {
        this.confirm()
      },
      deep: true
    },
    selected: {
      handler() {
        const list = this.toArr(this.options)
        for (const val of list) {
          if (val.value === this.selected) {
            this.refOpera(val.value, 'chooseBox')
          } else {
            this.refOpera(val.value, 'unchooseBox')
          }
        }
        this.change()
      },
      deep: true
    }
  },
  methods: {
    boxChange(res, label) {
      this.$set(this.propResult, label, res[0])
    },
    boxForm(res, label) {
      this.$set(this.formResult, label, res[0])
    },
    boxSearch(res) {
      this.$emit('search', res)
    },
    checkCanSend() {
      if (!this.canSend) {
        let canSend = true
        if (Array.isArray(this.options)) {
          for (const val of this.options) {
            if (!this.propResult[val.value]) {
              canSend = false
              break
            }
          }
        } else {
          if (!this.propResult[this.options.value]) {
            canSend = false
          }
        }
        this.canSend = canSend
      }
    },
    change() {
      this.checkCanSend()
      if (this.canSend) {
        const getProperty = () => {
          const res = []
          for (const key in this.filterBySelect(this.propResult)) {
            if (key === this.selected) {
              const val = this.propResult[key]
              if (Array.isArray(val)) {
                res.push(...val)
              } else {
                res.push(val)
              }
            }
          }
          return res
        }
        this.$emit('change', getProperty())
      }
    },
    confirm() {
      this.$emit('form', {
        select: this.selected,
        value: this.filterBySelect(this.formResult)
      })
    },
    filterBySelect(obj) {
      if (this.selected) {
        return obj
      } else {
        return {}
      }
    },
    disable() {
      const list = this.toArr(this.options)
      for (const val of list) {
        this.refOpera(val.value, 'disable')
      }
    },
    able() {
      const list = this.toArr(this.options)
      for (const val of list) {
        this.refOpera(val.value, 'able')
      }
    },
    getParam() {
      return this.formResult
    },
    setDefault(setting) {
      const config = setting && setting[this.unique]
      const list = this.toArr(this.options)
      if (!setting) {
        this.selected = !setting ? this.options[0].value : null
      } else {
        for (const key in config) {
          if (config[key].radio === true) {
            this.selected = key
            break
          }
        }
      }
      for (const val of list) {
        if (!this.refOpera(val.value, 'setDefault', config)) {
          return false
        }
        if (!setting) {
          if (val.value === this.selected) {
            this.refOpera(val.value, 'chooseBox')
          }
          this.refOpera(val.value, 'boxDisable')
        }
      }
      return true
    },
    getSelected() {
      const list = this.toArr(this.options)
      let result = {}
      for (const val of list) {
        result = Object.assign(result, this.refOpera(val.value, 'getSelected'))
      }
      return {
        [this.unique]: result
      }
    },
    allSteps() {
      const list = this.toArr(this.options)
      const res = {}
      list.forEach((item, index) => {
        const eachSteps = this.refOpera(item.value, 'allSteps')
        Object.assign(res, eachSteps)
      })
      return res
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../styles/position';
.radio-group__container {
	@include flex(row, flex-start, center);
	.radio-group__box {
		margin-right: 30px;
	}
	.radio-group__box:last-child {
		margin-right: 0px;
	}
}
</style>
