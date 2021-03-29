
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
import { each, upperFirst, sortByName } from '../fn/uitls'
import { curveFormatter } from '../fn/common'

const mergeSetting = (source, target) => {
  for (const s in source) {
    if (Object.hasOwnProperty.call(source, s)) {
      if (target[s]) {
        if (typeof source[s] === 'object') {
          source[s] = Object.assign(source[s], target[s])
        } else {
          source = target[s]
        }
      }
    }
  }
}

const shortCurveName = name => {
  return name && name.replace(/(train_|validate_)/g, '').replace(/(train\.|validate\.)/g, 'fold_')
}

export default function(chartName, settingOpts = {}, seriesOpts = {}, formatter, legend = 'custom') {
  return function(metricData) {
    const group = []
    each(metricData, (curves, metric_namespace) => {
      const options = []
      const setting = getEvaluationCurveOptions()
      const thresholdsArr = {}
      each(curves, curve => {
        const { data, meta } = curve
        const name = shortCurveName(meta.curve_name)
        setting.xAxis.name = meta.unit_name
        thresholdsArr[meta.curve_name] = (meta.thresholds)
        const series = {
          name,
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
          pairType: shortCurveName(meta.curve_name)
        }
        Object.assign(series, seriesOpts)
        options.push(series)
      })
      mergeSetting(setting, settingOpts)
      if (formatter === true) {
        setting.tooltip.formatter = curveFormatter('Threshold', upperFirst(chartName), thresholdsArr)
      } else if (typeof formatter === 'function') {
        setting.tooltip.formatter = formatter({
          thresholds: thresholdsArr
        })
      }
      sortByName(options, 'name')
      group.push({
        type: 'chart',
        props: {
          options,
          setting,
          legend: legend
        }
      })
    })
    return group.length > 1 ? group : group[0]
  }
}
