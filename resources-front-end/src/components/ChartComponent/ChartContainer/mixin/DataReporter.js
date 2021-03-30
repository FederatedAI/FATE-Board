
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

function getList(origin, key) {
  const res = []
  const list = Array.isArray(origin) ? origin : [origin]
  for (const val of list) {
    res.push(val[key] ? val[key] : '')
  }
  return res
}

const dataReporter = {
  data() {
    return {
      oldProperty: ''
    }
  },
  methods: {
    getPicture(setting) {
      let res = ''
      if (!setting) {
        res = this.refOpera('chartInstance', 'getPicture')
      } else {
        res = this.drawingAndGet(setting)
      }
      return res
    },
    drawingAndGet(setting) {
      const pics = this.refOpera('chartInstance', 'drawAndGet', setting)
      return pics
    },
    getPicData() {
      const series = this.currentOptions.series
      const res = []
      const order = []
      const xAxis = getList(this.currentOptions.xAxis, 'name')
      const yAxis = getList(this.currentOptions.yAxis, 'name')
      const xVariable = this.currentOptions.xAxis.data
      // const xName = series.xAyis
      for (const key in series) {
        const val = series[key]
        if (val.name) {
          const yindex = series.yAxisIndex || 0
          if (Array.isArray(val.data)) {
            let index = 0
            for (const vl of val.data) {
              const isArr = Array.isArray(vl)
              res.push({
                ' ': val.name,
                [xAxis[0] || 'xAxis']: isArr ? vl[0] : xVariable[index],
                [yAxis[yindex] || 'yAxis']: isArr ? vl[1] : vl
              })
              order.push(...[' ', xAxis[0] || 'xAxis', yAxis[yindex].replace(', ', '') || 'yAxis'])
              index++
            }
          }
        }
      }
      return {
        data: res,
        header: Array.from(new Set(order))
      }
    },
    allSteps(args) {
      const checklist = args.needExport.join('|').toLowerCase()
      const mid = checklist.match(this.export + '.png') ? this.getPicture() : null
      const detail = (checklist.match(this.export + '_detail') && this.detail) ? this.getPicData() : null
      this.$emit('reporter', {
        [this.property || this.export]: {
          [this.export + '.png' || 'chart.png']: mid,
          [this.export + '_detail.csv' || 'detail.csv']: detail
        }
      }, 'chart')
    },
    getNames() {
      const res = []
      if (this.export) {
        res.push(this.export + '.png')
      }
      if (this.export && this.detail) {
        res.push(this.export + '_detail.csv')
      }
      return res
    },
    getVariableMap() {
      let variableMap = ''
      if (!Array.isArray(this.options) || this.options.length > 0) {
        variableMap = Array.isArray(this.options) ? { default: this.options } : this.options
      } else {
        if (this.setting.series) {
          variableMap = {
            default: this.setting.series
          }
        } else {
          variableMap = {}
          for (const key in this.setting) {
            const item = this.setting.key
            variableMap[key] = item.series
          }
        }
      }
      const list = []
      const fetch = (obj) => {
        const res = []
        const list = Array.isArray(obj) ? obj : [obj]
        list.forEach((item) => {
          const checked = item.name.match(/\\n(.+)\S<=/)
          res.push(checked)
          if (item.children) {
            res.push(...fetch(item.children))
          }
        })
        return res
      }
      for (const key in variableMap) {
        const items = Array.isArray(variableMap[key]) ? variableMap[key] : [variableMap[key]]
        for (const item of items) {
          const it = item.data
          const mid = Array.isArray(it) ? it : [it]
          mid.forEach((i) => {
            if (typeof i === 'object' && !Array.isArray(i)) {
              list.push(...fetch(i))
            }
          })
        }
      }
      return Array.from(new Set(list))
    }
  }
}

export default dataReporter
