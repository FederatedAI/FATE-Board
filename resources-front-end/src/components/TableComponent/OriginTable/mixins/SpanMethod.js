
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

function needCompareHeader(list, current) {
  const headers = []
  for (const val of list) {
    if (val.children) {
      headers.push(...needCompareHeader(val.children))
    } else if (val.prop === current || val.label === current) {
      headers.push(val.prop)
      break
    } else if (val.type === 'index' || val.type === 'selection') {
      continue
    } else {
      headers.push(val.prop)
    }
  }
  return headers
}

function compareRows(row1, row2, compareCol) {
  for (const val of compareCol) {
    if (row1[val] !== row2[val]) {
      return false
    }
  }
  return true
}

function totalSpanMethod(row, column, list, end) {
  if (row[column.property] && row[column.property].toString().match(/(total|Total|summary|Summary)/)) {
    let colOrigin = 1
    for (const val of list) {
      if (!val.prop || !row[val.prop]) {
        colOrigin++
      } else if (row[val.prop].toString().match(/(total|Total|summary|Summary)/)) {
        break
      }
    }
    return {
      rowspan: 1,
      colspan: colOrigin
    }
  }
  let has = false
  for (let i = end - 1; i >= 0; i--) {
    const val = list[i]
    if (row[val.prop] && row[val.prop].toString().match(/(total|Total|summary|Summary)/)) {
      has = true
      break
    }
  }
  if (!has && (!column.property || !row[column.property])) {
    return {
      rowspan: 0,
      colspan: 0
    }
  } else {
    return {
      rowspan: 1,
      colspan: 1
    }
  }
}

const SpanMethods = {
  methods: {
    notCombine() {
      return {
        rowspan: 1,
        colspan: 1
      }
    },
    doCombine({ row, column, rowIndex, columnIndex }) {
      if (row._total) {
        return totalSpanMethod(row, column, this.header, columnIndex)
      }
      if (column.type === 'index' || column.type === 'selection') {
        return {
          rowspan: 1,
          colspan: 1
        }
      }
      const compared = needCompareHeader(this.header, column.property)
      const ctd = this.currentTableData
      if (rowIndex > 0 && compareRows(ctd[rowIndex - 1], ctd[rowIndex], compared)) {
        return {
          rowspan: 0,
          colspan: 0
        }
      } else {
        let combineRowCount = 1
        while (ctd[rowIndex + combineRowCount] && compareRows(ctd[rowIndex + combineRowCount], ctd[rowIndex], compared) && !ctd[rowIndex + combineRowCount]._total) {
          combineRowCount++
        }
        return {
          rowspan: combineRowCount,
          colspan: 1
        }
      }
    },
    defaultSpanMethod() {
      if (this.combine) {
        return this.doCombine
      } else {
        return this.notCombine
      }
    }
  }
}

export default SpanMethods
