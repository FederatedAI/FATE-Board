
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

export default function(summary, quantilePR, isEvaluation) {
  const header = [
    createHeader('metric_name', ''),
    createHeader('metric_namespace', 'dataset', { sortable: !isEvaluation })
  ]

  // const headerMap = new Map()

  const tableData = flattenToTable(summary, (subitem, metric_name, item, metric_namespace, index) => {
    if (index === 0) {
      each(subitem.data, ([name]) => {
        header.push(createHeader(name, name, { sortable: !isEvaluation }))
      })
    }
    // console.log(subitem, metric_name, item, metric_namespace)
    const obj = {
      metric_name: metric_name.replace(item.metric_namespace + '_', ''),
      metric_namespace
    }
    return Object.assign(obj, fromEntries(subitem.data))
  })

  const form = {
    type: 'form',
    props: {
      form: [
        {
          type: 'title',
          props: {
            title: isEvaluation ? 'Evaluation Scores' : 'Performance Scores'
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
      export: isEvaluation ? 'evaluation_scores' : 'performance_scores'
    }
  }

  const group = [
    form,
    table
  ]

  if (quantilePR) {
    header.push(
      createHeader('precision', 'precision'),
      createHeader('recall', 'recall')
    )
    form.props.form.splice(1, 1, {
      type: 'f-range',
      props: {
        label: 'Quantile',
        max: 1,
        min: 0,
        step: 0.05,
        value: 0.5,
        tip: 'Update Precision and Recall under the new quantile condition'
      }
    })
    each(tableData, row => {
      const item = quantilePR[row.metric_namespace] && quantilePR[row.metric_namespace][`${row.metric_name}_quantile_pr`]
      if (item && item.meta) {
        const meta = item.meta
        Object.assign(row, {
          thresholds: meta.thresholds,
          precision: meta.p_scores.map(([, i], index) => [index * 0.05, i]),
          recall: meta.r_scores.map(([, i], index) => [index * 0.05, i])
        })
      }
    })
  }

  return group
}
