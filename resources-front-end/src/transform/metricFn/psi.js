
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

import { getPSIbarOptions } from '@/utils/chart-options/PSIbar'
import { formatFloat } from '../../utils'
import { divide, multiply } from 'lodash'

function accDivCoupon(arg1, arg2) {
  try {
    let t1 = arg1.toString().split('.')
    t1 = t1.length > 1 ? t1[1].length : 0
    let t2 = arg2.toString().split('.')
    t2 = t2.length > 1 ? t2[1].length : 0
    const r1 = Number(arg1.toString().replace('.', ''))
    const r2 = Number(arg2.toString().replace('.', ''))
    let result = multiply(divide(r1, r2), Math.pow(10, t2 - t1))
    if (result.toString().length > 8) {
      result = parseFloat(result.toFixed(arg1.toString().length + 2))
    }
    return result
  } catch (e) {
    // console.log()
  }
}

function accMul(arg1, arg2, lens) {
  try {
    let m = 0
    let len = lens.toString().split('.').length > 1 ? lens.toString().split('.')[1].length : 0
    if (len < 2) len = 2
    const s1 = arg1.toFixed(len)
    const s2 = arg2.toFixed(len)
    m += s1.split('.').length > 1 ? s1.split('.')[1].length : 0
    m += s2.split('.').length > 1 ? s2.split('.')[1].length : 0
    let result = Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m)
    const reslist = result.toString().split('.')
    if (result.toString().split('.').length > 1) {
      if (!reslist[1].match(/([0-9])/)) {
        result = parseInt(result)
      }
    }
    return result
  } catch (e) {
    // TODO: console
  }
}

function getBiggest(vals) {
  let biggest = 0
  for (const val of vals) {
    if (val > biggest) {
      biggest = val
    }
  }
  const fx = biggest.toString().split('.')
  let FixedTo = fx.length > 1 ? (fx[1].match(/^0+/) ? fx[1].match(/^0+/)[0].length : 0) : 0
  if (FixedTo) {
    FixedTo += 2
  } else {
    FixedTo = 2
  }
  let midd = parseFloat(biggest.toFixed(FixedTo))
  while (midd < biggest) {
    midd = parseFloat((midd + accDivCoupon(1, Math.pow(10, FixedTo))).toFixed(FixedTo))
  }
  biggest = parseFloat(((Math.ceil((midd * Math.pow(10, FixedTo)) / 5) * 5) / Math.pow(10, FixedTo)).toFixed(FixedTo))
  if (biggest === 0) {
    biggest = 0.1
  }
  return biggest
}

function formatter(value) {
  if (isNaN(+value)) {
    value = 0
  }
  return (value * 100).toFixed(4) + '%'
}

const summaryHeader = [{
  type: 'index',
  label: 'index',
  width: 100
}, {
  label: 'predict_score',
  prop: 'predict_score'
}, {
  label: 'Expected %',
  prop: 'expected',
  formatter(row) {
    return formatter(row.expected)
  }
}, {
  label: 'Actual %',
  prop: 'actual',
  formatter(row) {
    if (row._total) {
      return ''
    }
    return formatter(row.actual)
  }
}, {
  label: 'PSI',
  prop: 'psi'
}]

const quantileHeader = [{
  type: 'index',
  label: 'index',
  width: 100
}, {
  label: 'predict_score',
  prop: 'predict_score'
}, {
  label: 'train',
  children: [{
    label: 'instance_count(%total)',
    prop: 'expected_interval',
    formatter(row) {
      return row.expected_interval + ' (' + formatFloat(row.expected) + ')'
    }
  }, {
    label: 'event_ratio',
    prop: 'train_event',
    formatter(row) {
      return formatter(row.train_event)
    }
  }]
}, {
  label: 'validation',
  children: [{
    label: 'instance_count(%total)',
    prop: 'actual_interval',
    formatter(row) {
      return row.actual_interval + ' (' + formatFloat(row.actual) + ')'
    }
  }, {
    label: 'event_ratio',
    prop: 'val_event',
    formatter(row) {
      return formatter(row.val_event)
    }
  }]
}]

const formTitle = title => ({
  type: 'form',
  props: {
    form: [
      {
        type: 'title',
        props: {
          title
        }
      }
    ]
  }
})

function PSIExchange(metricData) {
  if (!metricData.meta) {
    const fisrtKey = Object.keys(metricData)[0]
    metricData = metricData[fisrtKey]
  }
  const meta = metricData.meta
  const totalPSI = meta.total_psi
  const list = []

  for (let i = 0; i < meta.intervals.length; i++) {
    list.push({
      predict_score: meta.intervals[i],
      expected: meta.expected_percentage[i],
      expected_interval: meta.expected_interval[i],
      actual_interval: meta.actual_interval[i],
      actual: meta.actual_percentage[i],
      psi: meta.psi_scores[i],
      train_event: meta.train_pos_perc[i],
      val_event: meta.validate_pos_perc[i]
    })
  }

  const pic = getPSIbarOptions()
  pic.series.push({
    name: 'Expected',
    type: 'bar',
    data: meta.expected_percentage,
    itemStyle: {
      color: '#5E7FEB'
    },
    barMaxWidth: 15,
    pairType: meta.name
  })
  pic.series.push({
    name: 'Actual',
    type: 'bar',
    data: meta.actual_percentage,
    itemStyle: {
      color: '#0Ec7a5'
    },
    barMaxWidth: 15,
    pairType: meta.name
  })
  pic.series.push({
    name: 'PSI',
    type: 'line',
    yAxisIndex: 1,
    data: meta.psi_scores,
    itemStyle: {
      color: '#FF9E1F'
    },
    pairType: meta.name
  })
  pic.legend.data = ['Expected', 'Actual', 'PSI']
  pic.xAxis.data = meta.intervals
  pic.yAxis[0].name = 'Expected, Actual'
  const biggestY0 = getBiggest([...meta.expected_percentage, ...meta.actual_percentage])
  pic.yAxis[0].max = biggestY0
  const betY0 = accDivCoupon(biggestY0, 5)
  pic.yAxis[0].interval = betY0
  pic.yAxis[0].axisLabel.formatter = (value) => { return `${accMul(value, 100, betY0)} %` }
  pic.yAxis[1].name = 'PSI'
  const biggestY1 = getBiggest(meta.psi_scores)
  pic.yAxis[1].max = biggestY1
  const betY1 = accDivCoupon(biggestY1, 5)
  pic.yAxis[1].interval = betY1
  pic.yAxis[1].axisLabel.formatter = (value) => { return `${accMul(value, 1, betY1)}` }
  pic.tooltip.formatter = (param) => {
    let str = param[0].name + '<br/>'
    param.forEach((item) => {
      str += `${item.seriesName}: ${item.seriesName !== 'PSI' ? (item.data * 100).toFixed(4) + '%' : item.data}<br/>`
    })
    return str
  }
  const summaryPic = pic

  const quantilePic = getPSIbarOptions()
  quantilePic.series.push({
    name: 'train_%total',
    type: 'bar',
    data: meta.expected_percentage,
    itemStyle: {
      color: '#5E7FEB'
    },
    barMaxWidth: 15,
    pairType: meta.name
  })
  quantilePic.series.push({
    name: 'val_%total',
    type: 'bar',
    data: meta.actual_percentage,
    itemStyle: {
      color: '#0Ec7a5'
    },
    barMaxWidth: 15,
    pairType: meta.name
  })
  quantilePic.series.push({
    name: 'train_event_ratio',
    type: 'line',
    yAxisIndex: 1,
    data: meta.train_pos_perc,
    itemStyle: {
      color: '#FF9E1F'
    },
    pairType: meta.name
  })
  quantilePic.series.push({
    name: 'val_event_ratio',
    type: 'line',
    yAxisIndex: 1,
    data: meta.validate_pos_perc,
    itemStyle: {
      color: '#FF4F38'
    },
    pairType: meta.name
  })
  quantilePic.legend.data = ['train_%total', 'val_%total', 'train_event_ratio', 'val_event_ratio']
  quantilePic.xAxis.data = meta.intervals
  quantilePic.yAxis[0].name = '%total'
  const biggest2Y0 = getBiggest([...meta.expected_percentage, ...meta.actual_percentage])
  quantilePic.yAxis[0].max = biggest2Y0
  quantilePic.yAxis[0].interval = accDivCoupon(biggest2Y0, 5)
  quantilePic.yAxis[0].axisLabel.formatter = (value) => { return `${accMul(value, 100, biggest2Y0)} %` }
  quantilePic.yAxis[1].name = 'event_ratio'
  const biggest2Y1 = getBiggest([...meta.train_pos_perc, ...meta.validate_pos_perc])
  quantilePic.yAxis[1].max = biggest2Y1
  quantilePic.yAxis[1].interval = accDivCoupon(biggest2Y1, 5)
  quantilePic.yAxis[1].axisLabel.formatter = (value) => {
    return `${accMul(value, 100, biggest2Y1)} %`
  }
  quantilePic.tooltip.formatter = (param) => {
    let str = param[0].name + '<br/>'
    param.forEach((item) => {
      str += `${item.seriesName}: ${(item.data * 100).toFixed(4) + '%'}<br/>`
    })
    return str
  }

  return {
    summaryTable: list.concat([
      {
        actual: 'total',
        psi: 'Total PSI: ' + totalPSI,
        _total: true
      }
    ]),
    summaryPic,
    quantileTable: list,
    quantilePic
  }
}

function fn(metricData) {
  let data4Table1 = {}
  let data4Table2 = {}
  let set4Chart1 = {}
  let set4Chart2 = {}
  const options = []
  const keys = metricData ? Object.keys(metricData) : []
  for (let i = 0, l = keys.length; i < l; i++) {
    const mid = PSIExchange(metricData[keys[i]])
    if (l > 1) {
      data4Table1[keys[i]] = mid.summaryTable
      data4Table2[keys[i]] = mid.quantileTable
      set4Chart1[keys[i]] = mid.summaryPic
      set4Chart2[keys[i]] = mid.quantilePic
      options.push({
        label: keys[i].replace('_psi', ''),
        value: keys[i]
      })
    } else {
      data4Table1 = mid.summaryTable
      data4Table2 = mid.quantileTable
      set4Chart1 = mid.summaryPic
      set4Chart2 = mid.quantilePic
    }
  }
  const group = [
    formTitle('PSI Summary'),
    {
      type: 'table',
      props: {
        header: summaryHeader,
        data: data4Table1,
        pageSize: 'all',
        zeroFormat: '0',
        export: 'psi'
      }
    },
    {
      type: 'chart',
      props: {
        setting: set4Chart1,
        export: 'psi',
        detail: false
      }
    },
    formTitle('Quantile Distribution'),
    {
      type: 'table',
      props: {
        header: quantileHeader,
        data: data4Table2,
        pageSize: 'all',
        zeroFormat: '0',
        export: 'quantile_distribution'
      }
    },
    {
      type: 'chart',
      props: {
        setting: set4Chart2,
        export: 'quantile_distribution',
        detail: false
      }
    }
  ]

  if (options.length > 0) {
    group.splice(1, 0, {
      type: 'form',
      props: {
        form: [{
          type: 'f-select',
          props: {
            options: options
          }
        }]
      }
    })
  }

  return group
}
export default fn
