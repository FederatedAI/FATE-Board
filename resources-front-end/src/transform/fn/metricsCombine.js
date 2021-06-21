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

import { each } from './uitls'
import { getTransformMetricFn } from '../index'
import { METRIC_TYPES } from './const'
import { createAsyncComponent } from './common'

const createAsyncOption = (name, props, method, transform, exportName, detail) => ({
  name,
  props,
  method,
  transform,
  export: exportName,
  detail: detail
})

function addOptionsForTabs(lines) {
  const options = {
    label: 'Performance Summary'
  }
  const children = Object.keys(lines)
  if (children.length > 1) {
    options.children = (() => {
      const final = []
      each(children, val => {
        final.push({
          label: val,
          value: `ps_${val}`
        })
      })
      return final
    })()
  } else {
    options.value = `ps_${children[0]}`
  }
  return options
}

function addChartForTabs(combine, xAyis) {
  const options = []
  each(combine, (val, key) => {
    options.push(createAsyncOption(
      `ps_${key}`,
      {
        metrics: { [key]: val },
        xAyis
      },
      null,
      getTransformMetricFn(METRIC_TYPES.PERFORMANCE_SUM),
      'performance_summary',
      true
    ))
  })
  return options
}

function toAsync(combine, xAxis) {
  const form = {
    type: 'form',
    props: {
      form: [
        {
          type: 'f-tabs',
          props: {
            tabs: [addOptionsForTabs(combine)],
            needRefresh: false
          }
        }
      ]
    }
  }
  const options = addChartForTabs(combine, xAxis)
  return [form, createAsyncComponent(options, false)]
}

export function combineForPerformanceSum(othersTable) {
  const tableContent = !othersTable.props ? othersTable[1].props : othersTable.props // 获取table的相关信息
  const data = tableContent.data // 当前只对performanceScore的表有内容归纳处理。
  const res = {}
  const xAxis = []
  let doNotHaveSum = false
  each(data, item => {
    if (!doNotHaveSum) {
      const np = item.metric_namespace
      res[np] = res[np] || {
        'auc': { data: [], meta: { curve_name: 'auc' }},
        'ks': { data: [], meta: { curve_name: 'ks' }}
      }
      if (!item.auc || !item.ks) {
        doNotHaveSum = true
      }
      const mn = item.metric_name.toLowerCase()
      if (!(mn.match('fold') && mn.match('iteration'))) {
        res[np]['auc'].data.push([item.metric_name, item.auc])
        res[np]['ks'].data.push([item.metric_name, item.ks])
        xAxis.push(item.metric_name)
      }
    }
  })
  return !doNotHaveSum ? toAsync(res, xAxis) : []
}
