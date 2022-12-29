
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

import { fromEntries } from '@/utils'
import { createHeader, each, flattenToTable, sortByName } from '../fn/uitls'

export default function(summary, param) {
  const isEvaluation = param.isEvaluation
  const header = [
    createHeader('metric_name', ''),
    createHeader('metric_namespace', 'dataset', { sortable: !isEvaluation })
  ]

  // const headerMap = new Map()
  const tableData = flattenToTable(summary, (subitem, metric_name, item, metric_namespace, index) => {
    if (index === 0) {
      each(subitem.data ? subitem.data : subitem, ([name]) => {
        header.push(createHeader(name, name, { sortable: !(isEvaluation) }))
      })
    }
    // console.log(subitem, metric_name, item, metric_namespace)
    const obj = {
      metric_name: metric_name.replace(item.metric_namespace + '_', ''),
      metric_namespace
    }
    return Object.assign(obj, fromEntries(subitem.data ? subitem.data : subitem))
  })
  console.log(tableData)

  const form = {
    type: 'form',
    props: {
      form: [
        {
          type: 'title',
          props: {
            title: !(typeof isEvaluation === 'string')
              ? (isEvaluation ? 'Evaluation Scores' : 'Performance Scores')
              : isEvaluation
          }
        }
        // {
        //   type: 'search'
        // }
      ]
    }
  }

  sortByName(tableData, 'metric_name')

  const table = {
    type: 'table',
    props: {
      header,
      data: tableData,
      pageSize: 20,
      zeroFormat: '0',
      export: !(typeof isEvaluation === 'string')
        ? (isEvaluation ? 'evaluation_scores' : 'performance_scores')
        : isEvaluation
    }
  }

  const group = [
    form,
    table
  ]

  return group
}

