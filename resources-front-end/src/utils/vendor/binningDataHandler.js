
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

import { formatFloat, deepClone } from '../index'
import stackBarOptions from '@/utils/chart-options/stackBar'

function formatFloatWithDefault(num, role) {
  if (role === 'host') {
    return formatFloat(num) || '-'
  } else {
    return formatFloat(num)
  }
}

export default function(data, header, type, partyId, role, Currentrole) {
  if (data && Object.keys(data).length > 0) {
    const sourceData = []
    let options = []
    const variableData = {}
    const stackBarData = {}
    const woeData = {}
    let indexData = 0
    for (const key in data) {
      const tableData = []
      let min = -9999
      const formatterArr = []
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
        tableData.push({
          binning,
          'anonym in guest': 'bin_' + index,
          event_count: formatFloatWithDefault(data[key].eventCountArray[index], Currentrole),
          event_ratio: formatFloatWithDefault(data[key].eventRateArray[index], Currentrole),
          non_event_count: formatFloatWithDefault(data[key].nonEventCountArray[index], Currentrole),
          non_event_ratio: formatFloatWithDefault(data[key].nonEventRateArray[index], Currentrole),
          woe: formatFloatWithDefault(data[key].woeArray[index], Currentrole),
          iv: formatFloatWithDefault(data[key].ivArray[index], Currentrole)
        })
        formatterArr.push({
          formatterBinning,
          event_count: formatFloatWithDefault(data[key].eventCountArray[index], Currentrole),
          event_ratio: formatFloatWithDefault(data[key].eventRateArray[index], Currentrole),
          non_event_count: formatFloatWithDefault(data[key].nonEventCountArray[index], Currentrole),
          non_event_ratio: formatFloatWithDefault(data[key].nonEventRateArray[index], Currentrole),
          woe: formatFloatWithDefault(data[key].woeArray[index], Currentrole)
        })
      })
      variableData[key] = tableData
      const eventOptions = deepClone(stackBarOptions)
      const woeOptions = deepClone(stackBarOptions)
      eventOptions.tooltip.formatter = (params) => {
        const obj = formatterArr[params[0].dataIndex]
        let str = `${obj.formatterBinning}<br>`
        for (const val of params) {
          if (val.seriesName === 'event count') {
            str += `Event Count: ${obj.event_count}<br>
            Event Ratio: ${obj.event_ratio}<br>`
          } else if (val.seriesName === 'non-event count') {
            str += `Non-Event Count: ${obj.non_event_count}<br>
            Non-Event Ratio: ${obj.non_event_ratio}<br>`
          }
        }
        return str
      }
      // woeOptions.tooltip.trigger = 'item'
      woeOptions.tooltip.formatter = (params) => {
        const obj = formatterArr[params[0].dataIndex]
        return `${obj.formatterBinning}<br>Woe: ${obj.woe}<br>`
      }
      eventOptions.series.push({
        name: 'event count',
        type: 'bar',
        data: data[key].eventCountArray,
        stack: 'event',
        barMinWidth: '12',
        barMaxWidth: '15',
        itemStyle: {
          color: '#4159D1'
        }
      })

      eventOptions.series.push({
        name: 'non-event count',
        type: 'bar',
        data: data[key].nonEventCountArray,
        stack: 'event',
        barMinWidth: '12',
        barMaxWidth: '15',
        itemStyle: {
          color: '#0EC7A5'
        }
      })
      for (let i = 1; i <= data[key].eventCountArray.length; i++) {
        eventOptions.xAxis.data.push(i)
        woeOptions.xAxis.data.push(i)
      }
      stackBarData[key] = eventOptions

      woeOptions.series.push({
        name: 'woe',
        type: 'bar',
        data: data[key].woeArray,
        barMinWidth: '12',
        barMaxWidth: '15',
        itemStyle: {
          color: '#4159D1'
        }
      })
      woeOptions.series.push({
        // name: 'woe ',
        type: 'line',
        tooltip: {
          show: false
        },
        data: data[key].woeArray,
        // barWidth: '20%',
        lineStyle: {
          color: '#0EC7A5'
        }
      })
      woeData[key] = woeOptions
      sourceData.push({
        variable: (() => {
          if (Currentrole === role) {
            return key
          } else {
            return role + '_' + partyId + '_' + indexData
          }
        })(),
        anonymInGuest: (() => {
          if (Currentrole === role) {
            return role + '_' + partyId + '_' + indexData
          } else {
            return key
          }
        })(),
        iv: formatFloat(data[key].iv),
        // woe: data[key].woe,
        binding: (() => {
          if (type === 'guest') {
            for (let i = 0; i < header.length; i++) {
              if (key === header[i]) return i
            }
          } else {
            return key || '-'
          }
        })(),
        monotonicity: data[key].isWoeMonotonic ? data[key].isWoeMonotonic.toString() : 'false',
        partyid: partyId,
        role
      })
      options.push({
        value: key,
        label: (() => {
          if (Currentrole === role) {
            return key
          } else {
            return role + '_' + partyId + '_' + key.match(/[0-9]+/)[0]
          }
        })()
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
      woeData
    }
  } else {
    return null
  }
}
