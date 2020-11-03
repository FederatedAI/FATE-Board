
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

import { createHeader, each } from '../fn/uitls'

const PAGESIZE = 6

function createHeaderList(list) {
  const headerList = []
  headerList.push(createHeader('trueLabel', 'true label/cluster label', {
    pageFixed: true, renderHeader(h, { column, $index }) {
      return h('p', {
        class: 'mult-title'
      }, [
        h('span', {
          class: 'true-label'
        }, 'true label'),
        h('span', {
          class: 'split-inline'
        }),
        h('span', {
          class: 'predict-label'
        }, 'cluster label')
      ])
    }
  }))
  for (const val of list) {
    headerList.push(createHeader(val.toString(), 'cluster' + val.toString()))
  }
  return headerList
}

function precentage(origin, total) {
  return ((origin / total) * 100).toFixed(4) + '%'
}

function createRow(list, rowData, total) {
  const row = {}
  for (let i = 0; i < list.length; i++) {
    const showAddPrecentage = (rowData[i]).toString().match(/[a-zA-Z]+/)
    row[list[i].prop] = rowData[i] + (!showAddPrecentage ? ` (${precentage(rowData[i], total)})` : '')
  }
  return row
}

function getTotal(rowData) {
  return rowData.reduce((total, row) => {
    return row.reduce((total, num) => {
      if (!num.toString().match(/[a-zA-Z]+/)) {
        return total + num
      } else {
        return total
      }
    }, total)
  }, 0)
}

function createRows(header, rowData) {
  const tableData = []
  const total = getTotal(rowData)
  each(rowData, (row) => {
    tableData.push(createRow(header, row, total))
  })
  return tableData
}

function combineData(trueLabel, other) {
  const finalData = []
  each(other, (otherRow, index) => {
    finalData.push(['label' + trueLabel[index], ...otherRow])
  })
  return finalData
}

function getTable(trueLabel, predictLabel, data) {
  const header = createHeaderList(predictLabel)
  const originData = combineData(trueLabel, data)
  const rows = createRows(header, originData)
  return {
    type: 'table',
    props: {
      header,
      data: rows,
      pageSize: PAGESIZE,
      headerPagination: true,
      outerPagination: false,
      export: 'Contingency Matrix'
    }
  }
}

function createFilterForm(predictLabel, trueLabel, originList) {
  // const headerPage = {
  //   type: 'headerPagination',
  //   props: {
  //     pageSize: PAGESIZE,
  //     list: originList,
  //     title: 'cluster label:'
  //   }
  // }
  const tableSelection = {
    type: 'f-tableFilter',
    props: {
      clusterLabel: predictLabel,
      trueLabel: trueLabel
    }
  }
  const form = {
    type: 'form',
    props: {
      form: [
        {
          type: 'title',
          props: {
            content: 'Contingency Matrix'
          }
        },
        // headerPage,
        tableSelection
      ],
      inrow: true
    }
  }
  return form
}

function contingencyMatrix(data, param) {
  const group = []
  for (const key in data) {
    const meta = data[key].meta
    const predicted_labels = meta.predicted_labels
    const result_table = meta.result_table
    const true_labels = meta.true_labels
    const table = getTable(true_labels, predicted_labels, result_table)
    const filters = createFilterForm(predicted_labels, true_labels, table.props.header)
    group.push(filters)
    group.push(table)
  }
  return group
}

export default contingencyMatrix
