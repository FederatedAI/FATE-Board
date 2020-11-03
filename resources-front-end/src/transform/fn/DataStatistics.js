
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

import { createHeader } from './common.js'

const getHeaders = (statistics) => {
  const header = [createHeader('variable', 'variable', { sortable: true, pageFixed: true })]
  statistics.forEach(s => {
    header.push(createHeader(s, s, { sortable: true, showOverflowTooltip: true }))
  })
  header.unshift({ type: 'index', label: 'index' })
  return header
}

const fn = function(modelData) {
  if (modelData.msg.toString().toLowerCase().match('no data')) {
    return []
  }
  const { data, meta } = modelData.data
  const tableData = []
  meta && meta.meta_data && meta.meta_data.staticColumns.forEach((column, index) => {
    const tableItem = {}
    tableItem['variable'] = column
    data.selfValues.results.forEach(item => {
      tableItem[item.valueName] = item.values[index]
      tableItem[item.valueName] = item.values[index]
    })
    tableData.push(tableItem)
  })
  return (tableData.length > 0) ? [{
    component: () => import('@/components/ComponentGroup'),
    options: [{
      type: 'form',
      props: {
        form: [
          {
            type: 'search'
          }
        ]
      }
    },
    {
      type: 'table',
      props: {
        data: tableData,
        header: getHeaders(meta.meta_data.statistics),
        zeroFormat: '0',
        headerPagination: true
      }
    }]
  }] : []
}

export default fn
