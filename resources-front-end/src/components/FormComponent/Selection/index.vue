<template>
  <section
    :class="{
      'filter__container': true,
      'filter__left-container': !(Object.keys(others).length > 0)
    }"
    :style="styles"
  >
    <c-select
      v-if="Object.keys(others).length > 0"
      ref="cusSelect"
      :options="others"
      :multiple="multiple"
      :label="boxes ? '' : label"
      :support-filter="supportFilter"
      @change="selectChange"
      @form="selectForm"
    />
    <component
      v-if="boxes"
      ref="cusBox"
      :is="(multiple ? 'cCheckbox' : 'cRadio')"
      :options="boxes"
      @form="boxForm"
      @change="boxChange"
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

import dataFilter from '@/mixin/DataFilters'
import basicOperation from '@/mixin/BasicOperation'

const ORIGIN = 'origin'
const TO = 'modified'

export default {
  name: 'FilterSelection',
  components: {
    cSelect: () => import('../Select'),
    cCheckbox: () => import('../Checkbox'),
    cRadio: () => import('../Radio')
  },
  mixins: [dataFilter, basicOperation],
  props: {
    options: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    supportFilter: {
      type: Boolean,
      default: false
    },
    styles: {
      type: Object | String,
      default: ''
    }
  },
  data() {
    return {
      boxes: '',
      others: '',

      formResult: {},

      midPropResult: [],
      propResult: [],

      levels: 1
    }
  },
  watch: {
    midPropResult() {
      this.refOpera('cusSelect', 'setProperty', this.midPropResult)
    },
    propResult() {
      this.change(this.propResult)
    },
    formResult() {
      this.confirm()
    }
  },
  created() {
    this.getBox()
  },
  methods: {
    getBox() {
      const res = []
      const otherSelection = {}
      let levels = 1
      for (const val of this.options) {
        if (Array.isArray(val.value) && Array.isArray(val.value[0].value)) {
          levels = 3
        } else if (Array.isArray(val.value)) {
          levels = levels < 2 ? 2 : levels
        }
      }
      this.levels = levels
      if (levels > 1) {
        for (const val of this.options) {
          if (Array.isArray(val.value) && Array.isArray(val.value[0].value)) {
            const secondSelect = []
            for (const item of val.value) {
              secondSelect.push({
                label: item.label,
                value: item.label
              })
              otherSelection[item.label] = item.value
            }
            res.push({
              label: val.label,
              value: val.label,
              group: {
                form: [
                  {
                    type: 'f-select',
                    props: {
                      options: secondSelect,
                      multiple: this.multiple
                    }
                  }
                ]
              }
            })
          } else if (
            Array.isArray(val.value) &&
						!Array.isArray(val.value[0].value)
          ) {
            if (levels === 3) {
              otherSelection[val.label] = val.value
              res.push({
                label: val.label,
                value: val.label
              })
            } else {
              res.push({
                label: val.label,
                value: val.label,
                group: {
                  form: [
                    {
                      type: 'f-select',
                      props: {
                        options: val.value,
                        multiple: this.multiple
                      }
                    }
                  ]
                }
              })
            }
          } else {
            res.push({
              label: val.label,
              value: val.value
            })
          }
        }
        this.boxes = res
        this.others = otherSelection
      } else {
        this.others = this.options
      }
    },
    boxForm(res) {
      this.formResult = Object.assign({}, this.formResult, res)
    },
    boxChange(res) {
      if (
        (!Array.isArray(this.others) &&
					Object.keys(this.others).length === 0) ||
				(Array.isArray(this.others) && this.others.length === 0)
      ) {
        this.propResult = res
      } else {
        this.midPropResult = res
      }
    },
    boxSearch(res) {
      this.$emit('search', res)
    },
    selectChange(res) {
      this.propResult = res
    },
    selectForm(res) {
      this.formResult = Object.assign({}, this.formResult, {
        final: res
      })
    },
    confirm() {
      this.$emit('form', this.formResult)
    },
    getParam() {
      return this.formResult
    },
    disable() {
      this.refOpera('cusSelect', 'disable')
      this.refOpera('cusBox', 'disable')
    },
    able() {
      this.refOpera('cusSelect', 'able')
      this.refOpera('cusBox', 'able')
    },
    setDefault() {
      if (this.boxes) {
        if (!this.refOpera('cusBox', 'setDefault')) {
          return false
        }
      } else if (Object.keys(this.others).length > 0) {
        if (!this.refOpera('cusSelect', 'setDefault')) {
          return false
        }
      }
      return true
    },
    allSteps(args, list) {
      const res = {}
      list = Array.isArray(list) ? list : this.options
      list.forEach((item, index) => {
        if (Array.isArray(item.value)) {
          const mid = this.allSteps(args, item.value)
          Object.assign(res, mid)
        } else {
          res[item.value] = {
            title: (() => {
              const data = item.label
              if (args.imply) {
                for (const val of args.imply) {
                  if (data && data === val[ORIGIN]) {
                    return val[TO] || data
                  }
                }
              }
              return item.label
            })()
          }
        }
      })
      return res
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../styles/position';
.filter__container {
	@include flex(row, space-between, center);
	width: 100%;
}
.filter__left-container {
	@include flex(row, flex-end, center);
}
</style>
