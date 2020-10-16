
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

import { createHeader } from './common.js'
import PSIbar from '@/utils/chart-options/PSIbar'
import { deepClone } from '@/utils'

const getSummaryHeaders = () => {
  return [
    { type: 'index', label: 'index' },
    createHeader('variable', 'variable', { sortable: true }),
    createHeader('PSI', 'psi', { sortable: true })
  ]
}

const getVariableHeaders = () => {
  return [
    { type: 'index', label: 'index' },
    createHeader('binning'),
    createHeader('Expected%', 'expected'),
    createHeader('Actual%', 'actual'),
    createHeader('PSI', 'psi')
  ]
}

const xAxisTransform = (x) => {
  const bothReg = /([0-9.-]+)<([0-9a-zA-Z]+)(?:<=)([0-9.-]+)/g
  const leftReg = /([0-9.-]+)<([0-9a-zA-Z]+)/g
  const rightReg = /([0-9a-zA-Z]+)(?:<=)([0-9.-]+)/g
  let regstr
  if ((regstr = bothReg.exec(x)) != null) {
    return '(' + regstr[1] + ',' + regstr[3] + ']'
  }
  if ((regstr = leftReg.exec(x)) != null) {
    return '[' + regstr[1] + ',+∞)'
  }
  if ((regstr = rightReg.exec(x)) != null) {
    return '(-∞,' + regstr[2] + ']'
  }
  return x
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

function accDivCoupon(arg1, arg2) {
  try {
    let t1 = arg1.toString().split('.')
    t1 = t1.length > 1 ? t1[1].length : 0
    let t2 = arg2.toString().split('.')
    t2 = t2.length > 1 ? t2[1].length : 0
    const r1 = Number(arg1.toString().replace('.', ''))
    const r2 = Number(arg2.toString().replace('.', ''))
    return (r1 / r2) * Math.pow(10, t2 - t1)
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

const getPsiChartSetting = (xAxis, expXa, actXa, psiXa) => {
  const xs = Object.keys(xAxis)
  const result = {}
  xs.forEach((x, index) => {
    const common = deepClone(PSIbar)
    common.xAxis.data = xAxis[x]
    const bigExp = getBiggest(expXa[x])
    const bigAct = getBiggest(actXa[x])
    const biggest = bigExp > bigAct ? bigExp : bigAct
    common.yAxis[0].max = biggest
    common.yAxis[0].interval = biggest / 5
    common.yAxis[0].axisLabel.formatter = (value) => { return `${accMul(value, 100, biggest)} %` }
    const biggestPsi = getBiggest(psiXa[x])
    common.yAxis[1].max = biggestPsi
    common.yAxis[1].interval = biggestPsi / 5
    common.yAxis[1].axisLabel.formatter = (value) => { return `${accMul(value, 1, biggestPsi)}` }
    common.tooltip.formatter = (param) => {
      let str = param[0].name + '<br/>'
      param.forEach((item) => {
        str += `${item.seriesName}: ${item.seriesName !== 'PSI' ? (item.data * 100).toFixed(4) + '%' : item.data}<br/>`
      })
      return str
    }
    result[x] = common
  })
  return result
}

const createChartOption = (name, type, data, color, barWidth) => {
  const yAxisIndex = name === 'PSI' ? '1' : '0'
  // data = data.map((item, index) => {
  //   return index > 1 ? item : item * 100
  // })
  return {
    name,
    type,
    data,
    color,
    barWidth,
    yAxisIndex
  }
}

const getPsiY = (x, expectedYAxis, actualYAxis, psiYAxis) => {
  return [
    createChartOption('Expected', 'bar', expectedYAxis[x], '#5E7FEB', '8px'),
    createChartOption('Actual', 'bar', actualYAxis[x], '#0EC7A5', '8px'),
    createChartOption('PSI', 'line', psiYAxis[x], '#FF9F22')
  ]
}

const getPsiChartOptions = (expectedYAxis, actualYAxis, psiYAxis) => {
  const result = {}
  const xs = Object.keys(expectedYAxis)
  xs.forEach(x => {
    result[x] = []
    result[x] = getPsiY(x, expectedYAxis, actualYAxis, psiYAxis)
  })
  return result
}

function formatter(value) {
  if (isNaN(+value)) {
    value = 0
  }
  return (value * 100).toFixed(4) + '%'
}

const fn = (modelData) => {
  if (modelData.msg.match('no data')) {
    return []
  }
  const { featurePsi, totalScore } = modelData.data.data
  const psiSummaryTdata = []
  const psiFeatureTdata = {}
  const psiFeatureOption = []
  const xAxis = {}
  const expectedYAxis = {}
  const actualYAxis = {}
  const psiYAxis = {}
  Object.keys(featurePsi).forEach(feature => {
    const featureName = featurePsi[feature].featureName
    const featureInterval = featurePsi[feature].interval
    psiFeatureTdata[featureName] = []
    xAxis[featureName] = []
    expectedYAxis[featureName] = []
    actualYAxis[featureName] = []
    psiYAxis[featureName] = []
    psiSummaryTdata.push({
      variable: featureName,
      psi: totalScore[featureName]
    })
    psiFeatureOption.push({
      value: featureName,
      label: featureName
    })
    featureInterval.forEach((interval, index) => {
      psiFeatureTdata[featureName].push({
        binning: interval,
        expected: formatter(featurePsi[feature].expectPerc[index]),
        actual: formatter(featurePsi[feature].actualPerc[index]),
        psi: featurePsi[feature].psi[index]
      })
      xAxis[featureName].push(xAxisTransform(interval))
      expectedYAxis[featureName].push(featurePsi[feature].expectPerc[index])
      actualYAxis[featureName].push(featurePsi[feature].actualPerc[index])
      psiYAxis[featureName].push(featurePsi[feature].psi[index])
    })
  })
  return [{
    component: () => import('@/components/ComponentGroup'),
    options: [{
      type: 'table',
      props: {
        data: psiSummaryTdata,
        header: getSummaryHeaders(),
        zeroFormat: '0'
      }
    }]
  },
  {
    component: () => import('@/components/ComponentGroup'),
    options: [{
      type: 'form',
      props: {
        form: [{
          type: 'f-select',
          props: {
            options: psiFeatureOption
          }
        }]
      }
    },
    {
      type: 'table',
      props: {
        data: psiFeatureTdata,
        header: getVariableHeaders(),
        zeroFormat: '0',
        pageSize: -1
      }
    },
    {
      type: 'chart',
      props: {
        setting: getPsiChartSetting(xAxis, expectedYAxis, actualYAxis, psiYAxis),
        options: getPsiChartOptions(expectedYAxis, actualYAxis, psiYAxis)
      }
    }]
  }]
}

export default fn
