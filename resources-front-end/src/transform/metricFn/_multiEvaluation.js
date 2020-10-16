
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
import { each } from '../fn/uitls'
import { uniqueArr } from '../../utils'
import { sortByName } from '../fn/uitls'

export default function(metricData) {
  const group = []
  each(metricData, (curves, metric_namespace) => {
    let options = []
    const setting = getEvaluationCurveOptions()
    const thresholdsArr = []
    const pairTypes = []
    each(curves, curve => {
      const { data, meta } = curve
      thresholdsArr.push(meta.thresholds)
      const series = {
        name: meta.curve_name,
        type: 'line',
        smooth: false,
        symbolSize: 1,
        itemStyle: {
          opacity: 1
        },
        lineStyle: {
          opacity: 1
        },
        pairType: meta.pair_type,
        data
      }
      pairTypes.push(meta.pair_type)
      const xArr = []
      const valueArr = []
      data.forEach(p => {
        xArr.push(p[0])
        valueArr.push(p[1])
      })
      const origin = setting.xAxis.data || []
      if (xArr.length > origin.length) {
        setting.xAxis.data = xArr
      }
      series.data = valueArr
      series.name = meta.curve_name + (meta.ordinate_name ? `_${meta.ordinate_name}` : '')
      options.push(series)
    })
    options = options.sort((a, b) => {
      if (a.name && b.name && b.name.toLowerCase().match('precision') && a.name.toLowerCase().match('recall')) {
        return 1
      } else {
        return -1
      }
    })
    sortByName(options, 'pairType')

    setting.xAxis.name = 'class'
    setting.xAxis.type = 'category'
    setting.yAxis.name = 'precision, recall'
    setting.tooltip.formatter = params => {
      let str = ''
      const xValue = params[0].axisValue
      str += `Class: ${xValue}<br>`
      params.forEach(obj => {
        const value = Array.isArray(obj.data) ? obj.data[1] : obj.data
        if (obj.seriesName.toLowerCase().match('precision')) {
          str += `Precision(${obj.seriesName.replace('_Precision', '')}): ${value}<br>`
        } else if (obj.seriesName.toLowerCase().match('recall')) {
          str += `Recall(${obj.seriesName.replace('_Recall', '')}): ${value}<br>`
        }
      })
      return str
    }

    group.push({
      type: 'chart',
      props: {
        options,
        setting,
        legend: 'custom',
        group: uniqueArr(pairTypes)
      }
    })
  })
  return group.length > 1 ? group : group[0]
}
