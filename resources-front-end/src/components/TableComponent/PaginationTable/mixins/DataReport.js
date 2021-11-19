
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

import { deepClone } from '@/utils'

const ORIGIN = 'origin'
const TO = 'modified'

// const KEY = 'prop'
// const COMPARE = 'compare'

function checkAll(header, allDatas, cb, ...args) {
  let res = {}
  if (!Array.isArray(allDatas)) {
    for (const key in allDatas) {
      res[key] = cb(header, addIndex(allDatas[key]), ...args)
    }
  } else {
    res = {
      default: cb(header, addIndex(allDatas), ...args)
    }
  }
  return res
}

function addIndex(list) {
  list.forEach((item, index) => {
    item.index = index
  })
  return list
}

function toReportable(header, data, exporName) {
  const res = []
  const exchange = {}
  const order = []
  for (const val of header) {
    exchange[val.prop] = {
      label: val.label || val.prop,
      format: val.formatter
    }
    order.push(val.label || val.prop)
  }
  for (const val of data) {
    const mid = {}
    for (const key in val) {
      if (key in exchange) {
        const midKey = exchange[key].label
        mid[midKey] = !val[key].toString().toLowerCase().match('total') && exchange[key].format ? exchange[key].format(val) : val[key]
        if (mid[midKey] === '' || mid[midKey] === null || mid[midKey] === 'null' || mid[midKey] === undefined) {
          mid[midKey] = ' '
        }
      }
    }
    res.push(mid)
  }
  return {
    [exporName + '.csv' || 'tableData.csv']: {
      data: res,
      header: order
    }
  }
}

function combineData(data, header, exporName) {
  const res = {}
  for (const key in data) {
    res[key] = toReportable(header[key] || header['default'], data[key], exporName)
  }
  return res
}

function toOneLevel(origin) {
  const res = []
  for (const val of origin) {
    if (val.children) {
      const mid = toOneLevel(val.children)
      for (const item of mid) {
        res.push(Object.assign({}, item, {
          label: val.label + '_' + item.label
        }))
      }
    } else {
      res.push(Object.assign({}, val))
    }
  }
  return res
}

function shakingDisable(list) {
  const res = []
  for (const val of list) {
    let hasDisable = false
    for (const key in val) {
      if (key.toLowerCase().match('_disable') && val[key]) {
        hasDisable = true
        break
      }
    }
    if (!hasDisable) {
      res.push(val)
    }
  }
  return res
}

function eachCheck(list, compare) {
  const res = []
  if (list.length > 0) {
    for (const val of list) {
      if (compare(val)) {
        res.push(val)
      }
    }
  }
  return res
}

const dataRequest = {
  methods: {
    getCanDownload() {
      return this.name
    },

    tableImplyTo(_header, list, imply) {
      let deleted = []
      const imp = deepClone(imply)
      const isArr = Array.isArray(imp)
      list.forEach((item) => {
        for (const implying in imp) {
          const val = imp[implying]

          if (Array.isArray(val)) {
            let checked = false
            for (let i = 0, l = val.length; i < l; i++) {
              const c = val[i]
              if (!c[TO]) {
                val.splice(i, 1)
                i--
                l--
                if (val.length === 0) {
                  deleted.push(implying)
                }
              } else if (item[implying] && item[implying] && item[implying].match(c[ORIGIN]) && item[implying] === val[ORIGIN]) {
                item[implying] = item[implying].replace(c[ORIGIN], c[TO])
                checked = true
                break
              }
            }
            if (checked) {
              break
            }
          } else if (typeof val === 'object') {
            if (!val[TO]) {
              deleted.push(implying)
            } else {
              for (const key in item) {
                const title = _header.find(val => val.prop === key)
                if (item[key] &&
                  item[key].match &&
                  item[key].match(val[ORIGIN]) &&
                  (item[key] === val[ORIGIN] || title.matching)
                ) {
                  item[key] = item[key].replace(val[ORIGIN], val[TO])
                }
              }
            }
          }
        }
        if (deleted.length > 0) {
          for (let l = deleted.length, i = l - 1; i >= 0; i--) {
            const key = deleted[i]
            if (isArr) {
              imp.splice(parseInt(key), 1)
            } else {
              delete imp[key]
            }
          }
          deleted = []
        }
      })
    },

    filterWithProp(list, prop, compare) {
      if (list.length === 0) {
        return []
      }
      const checking = (item, comp) => {
        if (typeof compare !== 'object') {
          return item === comp
        } else {
          const toNum = typeof item !== 'number' ? parseFloat(item) : item
          if (!comp.min || !toNum > comp.min) {
            return false
          }
          if (!comp.max || !toNum < comp.max) {
            return false
          }
          if (!comp.maxEqual || !toNum <= comp.maxEqual) {
            return false
          }
          if (!comp.minEqual || !item >= comp.minEqual) {
            return false
          }
          return true
        }
      }
      const res = []
      if (typeof compare !== 'function') {
        for (let i = 0; i < list.length; i++) {
          const val = list[i]
          if (checking((prop === 'index') ? i : val[prop], compare)) {
            res.push(val)
          }
        }
      }
      return res
    },

    filterWithProps(_header, list, compare) {
      if (list.length === 0) {
        return []
      }
      if (!compare || (Array.isArray(compare) && compare.length === 0)) {
        return list
      }
      list = shakingDisable(list)
      let res = list
      if (typeof compare === 'function') {
        res = eachCheck(list, compare)
      } else if (Array.isArray(compare)) {
        compare.forEach((item) => {
          res = eachCheck(res, item)
        })
      } else if (typeof compare === 'object') {
        if (compare['index']) {
          res = this.filterWithProp(list, 'index', compare['index'])
        }
        for (const key in compare) {
          if (key !== 'index') {
            res = this.filterWithProp(res, key, compare[key])
          }
        }
      }
      return res
    },

    filterForAllProperty(allDatas, compare, header) {
      return checkAll(header, allDatas, this.filterWithProps, compare)
    },

    tablesImplyTo(allDatas, imply, header) {
      return checkAll(header, allDatas, this.tableImplyTo, imply)
    },

    tablesHeaderTo(allHeaders, allDatas) {
      if (Array.isArray(allDatas) && Array.isArray(allHeaders)) {
        return {
          default: toOneLevel(allHeaders)
        }
      }
      const res = {}
      let properties = []
      if (Array.isArray(allDatas)) {
        properties = allHeaders.disable || allHeaders.disabled ? Object.keys(allHeaders.disable || allHeaders.disabled) : []
      } else {
        properties = Object.keys(allDatas)
      }
      res.default = toOneLevel(Array.isArray(allHeaders) ? allHeaders : allHeaders.header)
      for (const val of properties) {
        res[val] = toOneLevel(this.getHeaderList(Array.isArray(allHeaders) ? { header: allHeaders } : allHeaders, val))
      }
      return res
    },

    getTableFiltersValue(imply, compare) {
      let resData = Array.isArray(this.data) ? deepClone(this.currentDatas) : deepClone(this.data)
      resData = this.checkFormatData(resData)
      if (compare && Object.keys(compare).length > 0) {
        resData = this.filterForAllProperty(resData, compare, this.header)
      }
      if (imply) {
        this.tablesImplyTo(resData, imply, this.header)
      }
      if (Array.isArray(resData)) {
        resData = {
          default: resData
        }
      }
      const resHeader = this.tablesHeaderTo(this.header, this.data)
      return combineData(resData, resHeader, this.export)
    },

    checkFormatData(dataList) {
      if (Array.isArray(dataList)) {
        dataList = this.$refs.originTable.checkData(dataList, Array.isArray(this.header) ? this.header : this.header.header)
        dataList = this.sortMethod(dataList, this.currentSortColumn, this.currentOrder)
        for (const item of dataList) {
          for (const key in item) {
            if (item[key + '_disable']) {
              item[key] += '(removed)'
            }
          }
        }
      } else {
        for (const val in dataList) {
          dataList[val] = this.$refs.originTable.checkData(dataList[val], Array.isArray(this.header) ? this.header : this.header.header)
          dataList[val] = this.sortMethod(dataList[val], this.currentSortColumn, this.currentOrder)
          for (const item of dataList[val]) {
            for (const key in item) {
              if (item[key + '_disable']) {
                item[key] += '(removed)'
              }
            }
          }
        }
      }
      return dataList
    },

    checkinDataWithFilters(compare) {
      // this.filterForAllProperty(deepClone(this.data), compare).length > 0
    },

    allSteps(args) {
      if (this.export && args.needExport.join('|').match(this.export + '.csv')) {
        const res = this.getTableFiltersValue(args.imply, args.compare)
        return res
      } else {
        return false
      }
    },
    getNames() {
      if (this.export) {
        return [this.export + '.csv']
      }
    },
    getVariableMap(list) {
      const res = []
      list = list || this.data
      for (const key in list) {
        const item = list[key]
        if (Array.isArray(item)) {
          res.push(...this.getVariableMap(item))
        } else if (item[this.mapVariable]) {
          res.push(item[this.mapVariable])
        }
      }
      return res.length > 0 ? Array.from(new Set(res)) : res
    },
    hasIv() {
      let has = false
      const list = Array.isArray(this.header) ? this.header : this.header.header
      for (const val of list) {
        if (val.label.match('iv')) {
          has = true
          break
        }
      }
      return has
    },
    handleFilterLogic(filters) {
      let resData = deepClone(this.data)
      if (filters && Object.keys(filters).length > 0) {
        resData = this.filterForAllProperty(resData, filters, this.header)
      }
      let res = resData
      if (typeof resData === 'object') {
        res = false
        for (const key in resData) {
          if (resData[key].length > 0) {
            res = true
            break
          }
        }
      }
      return res
    }
  }
}

export default dataRequest
