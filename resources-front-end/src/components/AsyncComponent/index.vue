<template>
  <div
    v-loading="loading"
    :class="{
      'async__def-size':loading || displayParam,
      'async-showing': !hiddenCheck
    }"
    class="async__container"
  >
    <keep-alive>
      <cgroup
        ref="asyncGroup"
        :options="displayParam"
        :style="loading ? 'min-height:200px;' : ''"
        class="async__group"
        @refreshed="finishLoading"
        @reporter="asyncReport"
      />
    </keep-alive>
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

// import Request from './request'
import dataFilter from '@/mixin/DataFilters'
import basicOperation from '@/mixin/BasicOperation'
import cgroup from '../ComponentGroup'
import dataReporter from './mixin/DataReportor'
export default {
  name: 'CustomAsyncComponent',
  components: {
    cgroup
  },
  mixins: [dataFilter, basicOperation, dataReporter],
  props: {
    options: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Array | Object,
      default: () => {}
    },
    afterRequestForParent: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Function | String,
      default: () => {}
    },
    refresh: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Function | String,
      default: () => {}
    },
    variableMap: {
      type: Array,
      default: () => []
    },
    needLoad: {
      type: Boolean,
      default: true
    },
    hidden: {
      type: Function,
      default: () => {}
    },
    continue: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      cacheData: new Map(),
      displayParam: [],
      loading: this.needLoad,
      requestParam: Array.isArray(this.options)
        ? [...this.options]
        : Object.assign({}, this.options),
      noNeedToRefresh: false,
      hiddenCheck: true
    }
  },
  computed: {
    getDataParam() {
      if (!Array.isArray(this.requestParam)) {
        return [
          {
            name: 'default',
            opts: this.requestParam
          }
        ]
      } else {
        if (!this.property) {
          return []
        } else {
          const list = Array.isArray(this.property)
            ? this.property
            : [this.property]
          const res = []
          for (const val of list) {
            let optres = ''
            for (const item of this.requestParam) {
              if (item.name === val) {
                optres = item
              }
            }
            res.push({
              name: val,
              opts: optres
            })
          }
          return res
        }
      }
    }
  },
  watch: {
    property: {
      handler() {
        this.init()
      },
      immediate: true
    },
    options: {
      handler() {
        this.requestParam = Array.isArray(this.options)
          ? [...this.options]
          : Object.assign({}, this.options)
      },
      deep: true
    }
  },
  created() {
    this.$nextTick(() => {
      this.init(true)
    })
  },
  methods: {
    init(loading) {
      this.loading = this.needLoad
      this.combine().then(params => {
        // 获取原有的选择信息
        let selected = null
        if (this.continue && !loading) {
          selected = this.refOpera('asyncGroup', 'getSelected')
          this.$nextTick(() => {
            setTimeout(() => {
              this.refOpera('asyncGroup', 'setDefault', selected)
              this.$nextTick(() => {
                this.loading = false
              })
            }, 10)
          })
        }
        this.displayParam = params
        // 设置新的选择信息
      })
    },
    async requesting(opt, name) {
      let result = ''
      if (typeof opt.method === 'string') {
        result = await this[opt.method](opt.props)
      } else if (typeof opt.method === 'function') {
        result = await opt.method(opt.props)
      } else {
        result = opt.props
      }
      let afterTrans = ''
      if (typeof opt.transform === 'string') {
        afterTrans = this[opt.transfrom](result)
      } else {
        afterTrans = opt.transform(result)
      }
      const mid = Array.isArray(afterTrans) ? afterTrans : [afterTrans]
      for (const val of mid) {
        if (val.props) {
          val.props.export = opt.export || ''
          val.props.detail = !!opt.detail
        }
      }
      this.cacheData.set(name, afterTrans)
      this.$emit('afterRequest', {
        name,
        resoponse: result,
        setting: afterTrans,
        operation: this.afterRequestForParent
      })
      return true
    },

    async combine(setting) {
      const newParam = setting || [...this.getDataParam]
      for (let i = 0; i < newParam.length; i++) {
        const val = newParam[i]
        if (val.name) {
          if (!this.cacheData.get(val.name)) {
            await this.requesting(val.opts, val.name)
          }
          const res = this.cacheData.get(val.name)
          this.hiddenCheck = !!this.hidden()
          if (Array.isArray(res)) {
            for (const item of res) {
              if (item.props) item.props.name = val.name
            }
            newParam.splice(i, 1, ...res)
          } else {
            if (res.props) res.props.name = val.name
            newParam.splice(i, 1, res)
          }
        }
      }
      return newParam
    },

    linkageChange(res, noNeedToRefresh) {
      this.noNeedToRefresh = noNeedToRefresh
      this.setProperty(res)
    },

    getCurrentProperty() {
      return this.property
    },

    async linkageRefresh() {
      this.loading = this.needLoad
      const list = Array.isArray(this.property)
        ? this.property
        : this.property
          ? [this.property]
          : ['default']
      for (let i = 0; i < list.length; i++) {
        const val = list[i]
        let origin = ''
        for (const item of this.getDataParam) {
          if (item.name === val) {
            origin = item.opts
            break
          }
        }
        const originData = this.cacheData.get(val)
        this.cacheData.delete(val)
        let newRes = ''
        const params = {
          name: val,
          originParam: origin,
          originData
        }
        if (typeof this.refresh === 'string') {
          newRes = await this[this.refresh](params)
        } else {
          newRes = await this.refresh(params)
        }
        if (!Array.isArray(this.requestParam)) {
          this.requestParam = newRes
        } else {
          for (let j = 0; j < this.requestParam.length; j++) {
            const value = this.requestParam[j]
            if (value.name === val) {
              this.requestParam.splice(j, 1, Object.assign({}, value, newRes))
              break
            }
          }
        }
        this.init()
      }
    },
    finishLoading() {
      this.$nextTick(() => {
        if (!this.continue) {
          this.loading = false
        }
        if (!this.noNeedToRefresh) {
          this.$emit('refreshed')
        } else {
          this.noNeedToRefresh = false
        }
      })
    },
    resize() {
      this.refOpera('asyncGroup', 'resize')
    }
  }
}
</script>

<style lang="scss" scoped>
.async__group {
	border: 0px;
	padding: 0px;
	margin: 0px;
}
</style>
