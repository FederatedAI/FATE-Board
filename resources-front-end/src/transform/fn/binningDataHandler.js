
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

import { formatFloat } from '@/utils/index'
import { getStackBarOptions } from '@/utils/chart-options/stackBar'
import { isEmpty } from './uitls'
import multiply from 'lodash/multiply'

function formatFloatWithDefault(value, role, flag) {
  if (flag) {
    return '-'
  } else {
    if (role === 'host') {
      return '-'
    } else if (value === undefined || value === null) {
      return '-'
    } else {
      return formatFloat(value)
    }
  }
}

export default function(data, header, type, partyId, role, Currentrole, skipStatic = false) {
  if (!isEmpty(data)) {
    const sourceData = []
    let options = []
    const variableData = {}
    const stackBarData = {}
    const woeData = {}
    const eventOptions = {}
    const woeOptions = {}

    let indexData = 0
    for (const key in data) {
      const tableData = []
      const formatterArr = []
      let min = -9999
      const iterationArr = data[key].ivArray.length > 0 ? data[key].ivArray : data[key].splitPoints
      iterationArr.forEach((item, index, self) => {
        let point = formatFloat(data[key].splitPoints[index])
        if (!point && point !== 0) {
          point = formatFloat(data[key].splitPoints[index - 1])
        }
        let binning = 'bin_' + index
        let formatterBinning = 'bin_' + index
        if ((point || point === 0) && !(Currentrole === 'guest' && type === 'host')) {
          if (min === -9999) {
            binning = `${key} <= ${point}`
            formatterBinning = `(-∞,${point}]`
          } else if (index === self.length - 1) {
            binning = `${key} > ${min}`
            formatterBinning = `(${min}, +∞)`
          } else {
            binning = `${min} < ${key} <= ${point}`
            formatterBinning = `(${min},${point}]`
          }
          min = point
        }
        const event_ratio = multiply(formatFloatWithDefault(data[key].eventRateArray[index], Currentrole, skipStatic), 100)
        const non_event_ratio = multiply(formatFloatWithDefault(data[key].nonEventRateArray[index], Currentrole, skipStatic), 100)
        tableData.push({
          binning,
          'anonym in guest': 'bin_' + index,
          event_count: formatFloatWithDefault(data[key].eventCountArray[index], Currentrole, skipStatic),
          event_ratio: event_ratio ? event_ratio.toFixed(4) + '%' : '',
          non_event_count: formatFloatWithDefault(data[key].nonEventCountArray[index], Currentrole, skipStatic),
          non_event_ratio: non_event_ratio ? non_event_ratio.toFixed(4) + '%' : '',
          woe: formatFloatWithDefault(data[key].woeArray[index], Currentrole, skipStatic),
          iv: formatFloatWithDefault(data[key].ivArray[index], Currentrole, skipStatic)
        })
        formatterArr.push({
          formatterBinning,
          event_count: formatFloatWithDefault(data[key].eventCountArray[index], Currentrole, skipStatic),
          event_ratio: formatFloatWithDefault(data[key].eventRateArray[index], Currentrole, skipStatic),
          non_event_count: formatFloatWithDefault(data[key].nonEventCountArray[index], Currentrole, skipStatic),
          non_event_ratio: formatFloatWithDefault(data[key].nonEventRateArray[index], Currentrole, skipStatic),
          woe: formatFloatWithDefault(data[key].woeArray[index], Currentrole, skipStatic)
        })
      })
      variableData[key] = tableData
      const eventSeries = []
      eventSeries.push({
        name: 'event_count',
        type: 'bar',
        data: data[key].eventCountArray,
        stack: 'event',
        barMinWidth: '12',
        barMaxWidth: '15',
        itemStyle: {
          color: '#4159D1'
        }
      })

      eventSeries.push({
        name: 'non_event_count',
        type: 'bar',
        data: data[key].nonEventCountArray,
        stack: 'event',
        barMinWidth: '12',
        barMaxWidth: '15',
        itemStyle: {
          color: '#0EC7A5'
        }
      })
      const arr = data[key].eventCountArray.map((_, i) => (i + 1))
      const _eventOptions = getStackBarOptions()
      const _woeOptions = getStackBarOptions()
      _eventOptions.xAxis.data = [...arr]
      _woeOptions.xAxis.data = [...arr]

      _eventOptions.tooltip.formatter = (params) => {
        const obj = formatterArr[params[0].dataIndex]
        const str = [`${obj.formatterBinning}<br>`]
        for (const val of params) {
          if (val.seriesName === 'event_count') {
            str.push(`Event_Count: ${obj.event_count}<br>
            Event_Ratio: ${(parseFloat(obj.event_ratio) * 100).toFixed(4) + '%'}<br>`)
          } else if (val.seriesName === 'non_event_count') {
            str.push(`Non_Event_Count: ${obj.non_event_count}<br>
            Non_Event_Ratio: ${(parseFloat(obj.non_event_ratio) * 100).toFixed(4) + '%'}<br>`)
          }
        }
        str.sort((a, b) => {
          if (a.match('Event_Count') && b.match('Non_Event_Count')) {
            return 1
          } else if (a.match('Non_Event_Count') && b.match('Event_Count')) {
            return -1
          } else {
            return 0
          }
        })
        return str.join('')
      }
      // _woeOptions.tooltip.trigger = 'item'
      _woeOptions.tooltip.formatter = (params) => {
        const obj = formatterArr[params[0].dataIndex]
        return `${obj.formatterBinning}<br>Woe: ${obj.woe}<br>`
      }

      eventOptions[key] = _eventOptions
      woeOptions[key] = _woeOptions

      stackBarData[key] = data[key].eventCountArray.length > 0 && data[key].nonEventCountArray.length > 0 ? eventSeries : {}
      const woeSeries = []
      woeSeries.push({
        name: 'woe',
        type: 'bar',
        data: data[key].woeArray,
        barMinWidth: '12',
        barMaxWidth: '15',
        itemStyle: {
          color: '#4159D1'
        }
      })
      woeSeries.push({
        type: 'line',
        tooltip: {
          show: false
        },
        data: data[key].woeArray,
        lineStyle: {
          color: '#0EC7A5'
        }
      })
      woeData[key] = data[key].woeArray.length > 0 ? woeSeries : {}
      sourceData.push({
        variable: (() => {
          return key
        })(),
        anonymInGuest: (() => {
          if (Currentrole === role) {
            const inName = key.match(/[0-9]+/) ? key.match(/[0-9]+/)[0] : indexData
            return role + '_' + partyId + '_' + inName
          } else {
            return key
          }
        })(),
        iv: formatFloatWithDefault(data[key].iv, Currentrole, skipStatic),
        binding: (() => {
          if (type === 'guest') {
            for (let i = 0; i < header.length; i++) {
              if (key === header[i]) return i
            }
          } else {
            return key || '-'
          }
        })(),
        monotonicity: skipStatic ? '-' : (Currentrole === 'host' ? '-' : (data[key].isWoeMonotonic ? data[key].isWoeMonotonic.toString() : 'false')),
        partyid: partyId,
        role,
        binning_count: data[key].splitPoints.length || data[key].ivArray.length
      })
      options.push({
        value: key,
        label: key
      })
      indexData++
    }

    sourceData.sort((a, b) => {
      const matchIndexA = a.variable.match(/[0-9]+$/)
      const matchIndexB = b.variable.match(/[0-9]+$/)
      if (matchIndexA && matchIndexB) {
        if (parseInt(a.variable.match(/[0-9]+$/)[0]) > parseInt(b.variable.match(/[0-9]+$/)[0])) {
          return 1
        } else {
          return -1
        }
      } else {
        return 0
      }
    })
    const optionFinal = []
    for (const val of sourceData) {
      for (let i = 0; i < options.length; i++) {
        if (val.variable === options[i].label || val.variable === options[i].value) {
          optionFinal.push(...options.splice(i, 1))
          break
        }
      }
    }
    options = optionFinal
    return {
      sourceData,
      options,
      variableData,
      stackBarData,
      woeData,
      eventOptions,
      woeOptions
    }
  } else {
    return null
  }
}
