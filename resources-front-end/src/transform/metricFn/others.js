
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

import { getMetricsData } from '@/api/chart'
import { getTransformMetricFn } from '../index'
import { each, isEmpty } from '../fn/uitls'
import { wrapGroupComponent } from '../fn/common'
import { METRIC_TYPES } from '../fn/const'

const SORTLIST = [METRIC_TYPES.CLUSTERING_EVALUATION_SUMMARY, METRIC_TYPES.DISTANCE_MEASURE, METRIC_TYPES.CONTINGENCY_MATRIX]

async function handler(metricsData, params) {
  const response = await getMetricsData({
    metrics: metricsData.options,
    ...params
  })
  const separateResult = data => {
    const result = {}
    each(data, (metrics, metric_namespace) => {
      each(metrics, (metric, metric_name) => {
        const type = metric.meta.metric_type
        if (!result[type]) {
          result[type] = {}
        }
        if (!result[type][metric_namespace]) {
          result[type][metric_namespace] = {}
        }
        Object.assign(result[type][metric_namespace], {
          [metric_name]: metric
        })
      })
    })
    return result
  }

  const result = separateResult(response.data)
  let group = []
  let summary = {}
  let quantilePR = {}
  const confusionMatrix = {}
  const others = []
  each(result, (res, metric_type) => {
    if (metric_type === METRIC_TYPES.EVALUATION_SUMMARY) {
      summary = res
    } else if (metric_type === METRIC_TYPES.QUANTILE_PR) {
      quantilePR = res
    } else if (metric_type === METRIC_TYPES.F1_SCORE) {
      confusionMatrix[METRIC_TYPES.F1_SCORE] = res
    } else if (metric_type === METRIC_TYPES.CONFUSION_MAT) {
      confusionMatrix[METRIC_TYPES.CONFUSION_MAT] = res
    } else if (metric_type === METRIC_TYPES.SAMPLE_TABLE) {
      const fn = getTransformMetricFn(metric_type)
      const component = fn(res)
      others.push({ title: METRIC_TYPES.SAMPLE_TABLE, content: wrapGroupComponent(component) })
    } else if (metric_type === METRIC_TYPES.PSI) {
      const fn = getTransformMetricFn(metric_type)
      let mid = {}
      for (const key in res) {
        mid = Object.assign(mid, res[key])
      }
      const component = fn(mid)
      others.push({ title: METRIC_TYPES.PSI, content: wrapGroupComponent(component) })
    } else if (metric_type === METRIC_TYPES.OVR) {
      const fn = getTransformMetricFn(metric_type)
      const component = fn(res, metric_type)
      others.push({ title: 'One_vs_Rest Evaluation', content: wrapGroupComponent(component) })
    } else {
      each(res, (data, name_space) => {
        if (typeof data !== 'string') {
          const fn = getTransformMetricFn(metric_type)
          const component = fn(data, params)
          others.push({ title: metric_type, content: wrapGroupComponent(component) })
        }
      })
    }
  })

  if (!isEmpty(summary)) {
    const fn = getTransformMetricFn(METRIC_TYPES.EVALUATION_SUMMARY)
    const component = fn(summary, !isEmpty(quantilePR) ? quantilePR : undefined, params.isEvaluation)
    group.push({ title: METRIC_TYPES.EVALUATION_SUMMARY, content: wrapGroupComponent(component) })
  }

  if (!isEmpty(confusionMatrix)) {
    const fn = getTransformMetricFn(METRIC_TYPES.CONFUSION_MAT)
    const component = fn(confusionMatrix.CONFUSION_MAT, confusionMatrix.F1_SCORE)
    group.push({ title: METRIC_TYPES.CONFUSION_MAT, content: wrapGroupComponent(component) })
  }

  group.push(...others)
  group = group.sort((a, b) => {
    const aI = SORTLIST.indexOf(a.title)
    const bI = SORTLIST.indexOf(b.title)
    if (aI < 0 || bI < 0) {
      return 0
    } else if (aI > bI) {
      return 1
    } else {
      return -1
    }
  })
  const resultList = []
  for (const val of group) {
    resultList.push(val.content)
  }
  return resultList
}

export default handler
