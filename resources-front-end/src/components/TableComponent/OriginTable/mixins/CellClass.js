
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

const cellClass = {
  methods: {
    cellClassName({ row, column, rowIndex }) {
      let cellClass = 'ctable__cell'
      if (column.type === 'index' || column.label === 'index' || row._deep) {
        cellClass += ' ctabel__cell-deep'
      }
      for (const val of this.header) {
        if (column.property === val.prop) {
          if (val.normal_deep) {
            cellClass += ' ctable__cell-normal-deep'
          }
          if (val.much_deep) {
            cellClass += ' ctable__cell-much-deep'
          }
          break
        }
      }
      if (row[column.property + '_disable']) {
        cellClass += ' ctable__cell-disable'
      }
      let has = false
      for (const key in row) {
        if (row[key] && row[key].toString().match(/(total|Total|summary|Summary)/)) {
          has = true
          break
        }
      }
      if (has) {
        cellClass += ' ctable__summary'
      }
      return cellClass
    },

    headerCellClassName({ column }) {
      let cellClass = 'ctable__header-cell'
      for (const val of this.header) {
        if (column.property === val.prop) {
          if (val.normal_deep) {
            cellClass += ' ctable__normal-deep'
          }
          if (val.much_deep) {
            cellClass += ' ctable__much_deep'
          }
          break
        }
      }
      return cellClass
    }
  }
}
export default cellClass
