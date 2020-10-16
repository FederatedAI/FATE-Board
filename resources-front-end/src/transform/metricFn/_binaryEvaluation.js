
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

import { getEvaluationCurveOptions } from '@/utils/chart-options/evaluation-curve'
import { fromEntries } from '@/utils'
import { each, groupBy, sortByName } from '../fn/uitls'
import { METRIC_TYPES } from '../fn/const'

export default function(metricData) {
  const group = []
  each(metricData, (originCurves, metric_namespace) => {
    const pairGroup = groupBy(originCurves, 'meta.pair_type')
    sortByName(pairGroup, '[0]')
    const options = []
    const setting = getEvaluationCurveOptions()
    const thresholdsArr = {}
    each(pairGroup, ([pairType, curves]) => {
      const recallCurves = curves.find(item => item.meta.metric_type === METRIC_TYPES.RECALL_BINARY_EVALUATION)
      const precisionCurves = curves.find(item => item.meta.metric_type === METRIC_TYPES.PRECISION_BINARY_EVALUATION)
      thresholdsArr[recallCurves.meta.curve_name] = recallCurves.meta.thresholds
      thresholdsArr[precisionCurves.meta.curve_name] = recallCurves.meta.thresholds

      const recallCurvesData = fromEntries(recallCurves.data)
      const precisionCurvesData = fromEntries(precisionCurves.data)

      const points = {}
      Object.keys(recallCurvesData).forEach(key => {
        const p = Array(2)
        p[0] = recallCurvesData[key]
        p[1] = precisionCurvesData[key]
        if (points[p[0]]) {
          if (p[1] > points[p[0]][1]) {
            points[p[0]] = p
          }
        } else {
          points[p[0]] = p
        }
      })

      const data = Object.values(points).sort((a, b) => a[0] - b[0])

      const series = {
        name: recallCurves.meta.curve_name,
        type: 'line',
        smooth: false,
        symbolSize: 1,
        itemStyle: {
          opacity: 1
        },
        lineStyle: {
          opacity: 1
        },
        data,
        pairType: recallCurves.meta.pair_type
      }
      options.push(series)
    })

    setting.xAxis.name = 'recall'
    setting.yAxis.name = 'precision'
    setting.tooltip.formatter = params => {
      let str = ''
      params.forEach((obj, index) => {
        const thresholdValue = thresholdsArr[obj.seriesName][obj.dataIndex]
        if (thresholdValue || thresholdValue === 0) {
          str += `Thresholds(${obj.seriesName}): ${thresholdValue}<br>`
        }
        const value = Array.isArray(obj.data) ? obj.data[1] : obj.data
        str += `Precision(${obj.seriesName}):${value}<br>`
        str += `Recall(${obj.seriesName}):${obj.axisValue}<br>`
      })
      return str
    }
    group.push({
      type: 'chart',
      props: {
        group: pairGroup.map(([pairType]) => pairType),
        options,
        setting,
        legend: 'custom'
      }
    })
  })
  return group.length > 1 ? group : group[0]
}

