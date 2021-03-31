
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
import isObject from 'lodash/isObject'

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

function dataCheck(tableData, namespace) {
  const res = {}
  let last = -1
  const itemcheck = (item, name) => {
    const ns = item.dataset
    if (ns === namespace) {
      res[name] = res[name] || {
        auc: {
          data: [], meta: {
            curve_name: name + '_auc'
          }
        }, ks: {
          data: [], meta: {
            curve_name: name + '_ks'
          }
        }
      }
      const final = parseFloat(item.modelLabel)
      if (final > last + 1) {
        if (parseFloat(item.modelLabel) > last + 1) {
          let origin = last + 1
          while (final > origin) {
            res[name].auc.data.push([item.modelLabel, 0])
            res[name].ks.data.push([item.modelLabel, 0])
            origin++
          }
        }
      }
      res[name].auc.data.push([item.modelLabel, item.auc.toFixed(6)])
      res[name].ks.data.push([item.modelLabel, item.ks.toFixed(6)])
      last = parseFloat(item.modelLabel)
    }
  }
  each(tableData, (content, name) => {
    if (isObject(content) && content.dataset) {
      itemcheck(content, name)
    } else {
      each(content, (item, index) => {
        itemcheck(item, name)
      })
    }
  })
  return { content: res }
}

function contentToChart(response) {
  const { tableData, namespace } = response
  const settings = getEvaluationCurveOptions()
  settings.yAxis.name = 'auc, ks'
  settings.xAxis.type = 'category'
  const { content: lineContent } = dataCheck(tableData, namespace)
  settings.xAxis.name = 'model label'
  settings.tooltip.formatter = function(value) {
    const res = {}
    each(value, (item, key) => {
      const isAuc = item.seriesName.match('_auc')
      // const isKs = item.seriesName.match('_ks')
      const model = item.seriesName.replace(/(\_auc|\_ks)/, '')
      res[model] = res[model] || {}
      res[model][isAuc ? 'auc' : 'ks'] = item.data[1]
    })
    let final = ''
    each(res, (item, key) => {
      if (final) final += '<br />'
      final += key + '  '
      each(item, (val, key) => {
        if (final) final += '<br />'
        final += key + ': ' + val
      })
    })
    return final
  }
  const pairTypes = []
  const group = []
  const options = []
  each(lineContent, (content, name) => {
    const seriesAuc = createSerie(content.auc.meta.curve_name, content.auc.data, { pairType: name })
    const seriesKs = createSerie(content.ks.meta.curve_name, content.ks.data, { pairType: name })
    const series = [seriesAuc, seriesKs]
    pairTypes.push(name)
    options.push(...series)
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

export default contentToChart
