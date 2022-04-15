<template>
  <div class="combination__container">
    <template v-for="(item,index) in cList">
      <component
        :ref="'comp' + index"
        :is="item.component"
        :options="item.options"
        :key="index"
        @reporter="groupDataReporter"
      />
    </template>
    <div v-if="cList.length === 0" class="template_nodata">No Data</div>
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

let needToCount = 0
let currentArgs = ''
let currentTotal = 0
function groupNeedToGetReport(cList, getNames) {
  const count = []
  const checkList = currentArgs.needExport.join('|')
  for (let i = 0, l = cList.length; i < l; i++) {
    const list = getNames('comp' + i)
    for (const val of list) {
      if (checkList.match(val)) {
        count.push('comp' + i)
        break
      }
    }
  }
  needToCount = count.length
  return count
}
export default {
  name: 'ReportNav',
  mixins: [basicOperation],
  props: {
    cList: {
      type: Array,
      default: () => []
    },
    visiable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      reporters: []
    }
  },
  watch: {
    visiable() {
      this.resize()
    }
  },
  methods: {
    getNames() {
      const res = []
      this.cList.forEach((item, index) => {
        const mid = this.refOpera('comp' + index, 'getNames')
        if (mid.length > 0) {
          res.push(...mid)
        }
      })
      return res
    },
    getVariableMap() {
      const res = []
      this.cList.forEach((item, index) => {
        const mid = this.refOpera('comp' + index, 'getVariableMap')
        if (mid.length > 0) {
          res.push(...mid)
        }
      })
      return Array.from(new Set(res))
    },
    allSteps(args) {
      currentArgs = args
      currentTotal = 0
      const getNames = comp => {
        return this.refOpera(comp, 'getNames') || []
      }
      const list = groupNeedToGetReport(this.cList, getNames)
      list.forEach(item => {
        this.refOpera(item, 'allSteps', args)
      })
    },
    hasIv() {
      let res = false
      for (let i = 0, l = this.cList.length; i < l; i++) {
        const mid = this.refOpera('comp' + i, 'hasIv')
        if (mid) {
          res = mid
          break
        }
      }
      return res
    },
    handleFilterLogic(filters) {
      let res = false
      for (let i = 0, l = this.cList.length; i < l; i++) {
        const mid = this.refOpera('comp' + i, 'handleFilterLogic', filters)
        if (mid) {
          res = mid
          break
        }
      }
      return res
    },
    groupDataReporter(res) {
      currentTotal += 1
      this.reporters.push(...res.group)
      if (currentTotal === needToCount) {
        this.$emit('reporter', this.reporters)
        this.reporters = []
      }
    },
    resize() {
      this.$nextTick(() => {
        if (this.visiable) {
          setTimeout(() => {
            this.cList.forEach((item, index) => {
              this.refOpera('comp' + index, 'resize')
            })
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../styles/position';
.combination__container {
	width: 100%;
	height: 100%;
	position: relative;
}

.template_nodata {
	@include flex(column, center, center);
	width: 100%;
	min-height: 200px;
	font-size: 1.45em;
	font-weight: bold;
}
</style>

