
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

import { formatFloat } from '@/utils'
import { getEvaluationCurveOptions } from '@/utils/chart-options/evaluation-curve'
import { each, groupBy, sortByName } from '../fn/uitls'

const createSerie = (name, data, other) => {
  return {
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
    ...other
  }
}

const getFormatterObj = (tpr, fpr, pairType, thresholds) => ({
  tpr,
  fpr,
  pairType,
  thresholds
})

const shortCurveName = name => {
  return name && name.replace(/(train_|validate_)/g, '').replace(/(train\.|validate\.)/g, 'fold_')
}

const toolTipFormatter = (arr) => {
  return (params) => {
    let str = ''
    arr.forEach((ksObj, ksIndex) => {
      const listCheck = []
      const thresholdValue = ksObj.thresholds[params[0].dataIndex]
      if ((thresholdValue || thresholdValue === 0)) {
        for (const val of params) {
          if (val.seriesName.match(shortCurveName(ksObj.pairType)) && (val.seriesName.match(ksObj.tpr) || val.seriesName.match(ksObj.fpr))) {
            listCheck.push(val)
          }
        }
        if (listCheck.length) {
          str += `Threshold: (${ksObj.pairType})${thresholdValue}<br>`
        }
        let ksflag = false
        let v1 = 0
        let v2 = 0
        listCheck.forEach(obj => {
          if (obj.seriesName === ksObj.tpr) {
            str += `${ksObj.tpr}: ${obj.data[1]}<br>`
            v1 = obj.data[1]
            ksflag = true
          }
          if (obj.seriesName === ksObj.fpr) {
            str += `${ksObj.fpr}: ${obj.data[1]}<br>`
            v2 = obj.data[1]
          }
        })
        if (ksflag) {
          const ks = v1 - v2
          str += `KS: ${Math.abs(formatFloat(ks))}<br>`
        }
      }
    })
    return str
  }
}

export default function(data) {
  const settings = getEvaluationCurveOptions()
  settings.yAxis.name = 'tpr, fpr'
  let options = []
  const KSFormaterArr = []
  const group = []
  const pairTypes = []
  each(data, (ksData) => {
    const groupData = groupBy(ksData, 'meta.pair_type')
    sortByName(groupData, '[0]', true)
    each(groupData, ([pair_type, data]) => {
      const [data1, data2] = data
      const serie1 = createSerie(shortCurveName(data1.meta.curve_name), data1.data, { pairType: pair_type })
      const serie2 = createSerie(shortCurveName(data2.meta.curve_name), data2.data, { pairType: pair_type })
      const series = [serie1, serie2]
      let maxDValue = 0
      let maxDYValue1 = 0
      let maxDYValue2 = 0
      let maxDXValue = 0
      const _data2 = data2.data
      each(data1.data, (p, ind) => {
        const diffValue = Math.abs(p[1] - _data2[ind][1])
        if (diffValue > maxDValue) {
          maxDValue = diffValue
          maxDXValue = p[0]
          maxDYValue1 = p[1]
          maxDYValue2 = _data2[ind][1]
        }
      })

      series.push(createSerie('', [
        [maxDXValue, maxDYValue1],
        [maxDXValue, maxDYValue2]
      ], {
        symbol: 'none', lineStyle: {
          type: 'dashed',
          opacity: 1
        },
        pairType: pair_type
      }))

      options.push(...series)
      pairTypes.push(pair_type)

      let formatterParams
      if (serie1.name.endsWith('_tpr')) {
        formatterParams = [serie1.name, serie2.name, pair_type, data1.meta.thresholds]
      } else {
        formatterParams = [serie2.name, serie1.name, pair_type, data2.meta.thresholds]
      }
      const formatterObj = getFormatterObj.apply(null, formatterParams)
      KSFormaterArr.push(formatterObj)
    })
  })

  settings.tooltip.formatter = toolTipFormatter(KSFormaterArr)
  options = options.sort((a, b) => {
    if (b.name && a.name && b.name.match('tpr') && a.name.match('fpr')) {
      return 1
    } else if (!a.name) {
      return 1
    } else {
      return -1
    }
  })

  group.push({
    type: 'chart',
    props: {
      options,
      setting: settings,
      legend: 'custom',
      group: pairTypes
    }
  })

  return group.length > 1 ? group : group[0]
}
