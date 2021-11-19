
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

function nearBy(impl, target) {
  const compare = JSON.parse(JSON.stringify(impl))
  compare.sort((a, b) => {
    if (a[0] > b[0]) {
      return 1
    } else {
      return -1
    }
  })
  let res = ''
  for (let i = 0; i < compare.length; i++) {
    const val = compare[i]
    if (val[0] > target) {
      if (i === 0) {
        res = val[1]
      } else {
        res = compare[i - 1][1]
      }
      break
    } else if (val[0] === target) {
      res = val[1]
      break
    }
  }
  if (!res) {
    res = compare[compare.length - 1][1]
  }
  return res
}

function toformatExp(val, size) {
  const origin = parseFloat(val).toExponential().split('.')
  const little = origin[1] ? origin[1].split('e') : false
  if (little === false || !size) {
    return origin
  } else {
    if (size && little[0].length > size) {
      little[0] = little[0].slice(0, size)
    }
    origin[1] = little.join('e')
  }
  return origin.join('.')
}

const dataFormat = {
  data() {
    return {
      range: 0
    }
  },
  methods: {
    checkData(datas, headers) {
      const res = JSON.parse(JSON.stringify(datas))
      for (const val of res) {
        for (const key in val) {
          let listProps = null
          if (headers) {
            listProps = headers.find(l => l.prop === key)
            if (listProps && listProps.noFormat) {
              continue
            }
          }
          if (listProps || !headers) {
            if (Array.isArray(val[key])) {
              val[key] = nearBy(val[key], this.range)
            }
            const toNum = parseFloat(val[key])
            if (typeof val[key] === 'number' || val[key].toString().match(/[0-9]+e/)) {
              if (typeof val[key] === 'number') {
                const sp = toNum.toString().split('.')
                if (sp[1] && sp[1].length > 6) {
                  val[key] = parseFloat(val[key].toFixed(6))
                }
              }
              continue
            }
            if (toNum && toNum.toString() === val[key].toString()) {
              const data = toNum.toString().split('.')
              if (this.size && data[1] && data[1].length > this.size) {
                const size = typeof this.size === 'number' ? this.size : 6
                data[1] = data[1].slice(0, size)
                val[key] = data.join('.')
              }
              if (data[0].replace('/[-+]/', '').length >= 8) {
                val[key] = toformatExp(val[key], this.size)
              }
              if (val[key] === 0) {
                val[key] = this.zeroFormat
              }
            } else if (val[key] === '' || val[key] === null) {
              val[key] = this.nullFormat
            }
          }
        }
      }
      return res
    },

    linkageRange(param) {
      this.range = param
    }
  }
}

export default dataFormat
