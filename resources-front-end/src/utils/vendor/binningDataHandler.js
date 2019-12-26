import { formatFloat, deepClone } from '../index'
import stackBarOptions from '@/utils/chart-options/stackBar'

export default function(data, header, type, partyId, role) {
  if (data && Object.keys(data).length > 0) {
    const sourceData = []
    const options = []
    const variableData = {}
    const stackBarData = {}
    const woeData = {}
    Object.keys(data).forEach(key => {
      const tableData = []
      let min = -9999
      const formatterArr = []
      const iterationArr = data[key].ivArray.length > 0 ? data[key].ivArray : data[key].splitPoints
      iterationArr.forEach((item, index, self) => {
        let point = data[key].splitPoints[index]
        if (!point && point !== 0) {
          point = data[key].splitPoints[index - 1]
        }
        let binning = '-'
        let formatterBinning = '-'
        if (point || point === 0) {
          if (min === -9999) {
            binning = `${key} <= ${point}`
            formatterBinning = `(-∞,${point}]`
          } else if (index === self.length - 1) {
            binning = `${key} > ${point}`
            formatterBinning = `(${point},+∞)`
          } else {
            binning = `${min} < ${key} <= ${point}`
            formatterBinning = `(${min},${point}]`
          }
          min = point
        }
        tableData.push({
          binning,
          event_count: data[key].eventCountArray[index] || '0',
          event_ratio: formatFloat(data[key].eventRateArray[index]),
          non_event_count: data[key].nonEventCountArray[index] || '0',
          non_event_ratio: formatFloat(data[key].nonEventRateArray[index]),
          woe: formatFloat(data[key].woeArray[index]),
          iv: formatFloat(data[key].ivArray[index])
        })
        formatterArr.push({
          formatterBinning,
          event_count: data[key].eventCountArray[index] || '0',
          event_ratio: formatFloat(data[key].eventRateArray[index]),
          non_event_count: data[key].nonEventCountArray[index] || '0',
          non_event_ratio: formatFloat(data[key].nonEventRateArray[index]),
          woe: formatFloat(data[key].woeArray[index])
        })
      })
      variableData[key] = tableData
      const eventOptions = deepClone(stackBarOptions)
      const woeOptions = deepClone(stackBarOptions)
      eventOptions.tooltip.formatter = (params) => {
        const obj = formatterArr[params[0].dataIndex]
        return `${obj.formatterBinning}<br>Event Count: ${obj.event_count}<br>
                Event Ratio: ${obj.event_ratio}<br>Non-Event Count: ${obj.non_event_count}<br>
                Non-Event Ratio: ${obj.non_event_ratio}<br>`
      }
      woeOptions.tooltip.trigger = 'item'
      woeOptions.tooltip.formatter = (params) => {
        const obj = formatterArr[params.dataIndex]
        return `${obj.formatterBinning}<br>Woe: ${obj.woe}<br>`
      }
      eventOptions.series.push({
        name: 'event count',
        type: 'bar',
        data: data[key].eventCountArray,
        stack: 'event'
        // barWidth: '20%',
      })

      eventOptions.series.push({
        name: 'non-event count',
        type: 'bar',
        data: data[key].nonEventCountArray,
        stack: 'event'
        // barWidth: '20%',
      })
      for (let i = 1; i <= data[key].eventCountArray.length; i++) {
        eventOptions.xAxis.data.push(i)
        woeOptions.xAxis.data.push(i)
      }
      stackBarData[key] = eventOptions

      woeOptions.series.push({
        name: 'woe',
        type: 'bar',
        data: data[key].woeArray
        // barWidth: '20%',
      })
      woeOptions.series.push({
        // name: 'woe ',
        type: 'line',
        tooltip: {
          show: false
        },
        data: data[key].woeArray
        // barWidth: '20%',
      })
      woeData[key] = woeOptions
      sourceData.push({
        variable: key,
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
        label: key
      })
    })
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
