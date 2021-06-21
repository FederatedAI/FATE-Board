
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

const DataSort = {
  data() {
    return {
      currentSortColumn: '',
      currentOrder: '',
      defaultSortColumn: '',
      defaultOrder: ''
    }
  },
  methods: {
    sortMethod(list, col, order) {
      this.currentSortColumn = order ? (col || this.defaultSortColumn) : this.defaultSortColumn
      this.currentOrder = order || this.defaultOrder
      if (this.currentSortColumn && this.currentOrder) {
        const compareVal = (val1, val2) => {
          if (val1 > val2) {
            return this.currentOrder.match('ascend') ? 1 : -1
          } else {
            return this.currentOrder.match('ascend') ? -1 : 1
          }
        }
        if (this.currentOrder !== null) {
          list.sort((a, b) => {
            let aVal = parseFloat(a[this.currentSortColumn.property])
            let bVal = parseFloat(b[this.currentSortColumn.property])
            aVal = isNaN(aVal) ? a[this.currentSortColumn.property] : aVal
            bVal = isNaN(bVal) ? b[this.currentSortColumn.property] : bVal
            if (aVal === '-' && bVal === '-') {
              return 0
            } else if (b._total && aVal === '-') {
              return -1
            } else if (a._total && bVal === '-') {
              return 1
            } else if (b._total || bVal === '-') {
              return -1
            } else if (a._total || aVal === '-') {
              return 1
            } else {
              return compareVal(aVal, bVal)
            }
          })
        }
      }
      return list
    }
  }
}

export default DataSort
