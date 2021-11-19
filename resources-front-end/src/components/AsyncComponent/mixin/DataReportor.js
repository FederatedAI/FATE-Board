
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

const dataReportor = {
  props: {
    deepReport: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isSteping: false
    }
  },
  methods: {
    allSteps(args, comp) {
      if (!this.isSteping) {
        this.isSteping = true
        this.refOpera('asyncGroup', 'allSteps', args, comp)
      }
    },
    getNames() {
      const list = Array.isArray(this.options) ? this.options : [this.options]
      const res = []
      list.forEach((item) => {
        if (item.detail && item.export) {
          res.push(item.export + '.png')
          res.push(item.export + '_detail.csv')
        } else if (item.export) {
          res.push(item.export + '.png')
        }
      })
      if (this.deepReport) {
        res.push(...this.refOpera('asyncGroup', 'getNames'))
      }
      return Array.from(new Set(res))
    },
    asyncReport(res, type) {
      this.isSteping = false
      this.$emit('reporter', res, type)
    },
    clearImply() {
      this.$refs.asyncGroup.clearImply()
    },
    getVariableMap() {
      const res = [...this.variableMap]
      if (this.deepReport) {
        res.push(...this.refOpera('asyncGroup', 'getVariableMap'))
      }
      return res
    }
  }
}

export default dataReportor
