
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

import { each, makeArray } from './uitls'
import { getMetricData, getMetrics } from '@/api/chart'
import { formatFloat } from '@/utils'
import metricsArrange from './metricsArrange'
import { deepClone } from '@/utils'
import isFunction from 'lodash/isFunction'

const makeMetricsDataRequest = (name, namespace, partyId, role, componentName, jobId) => {
  const param = {
    component_name: componentName,
    job_id: jobId,
    metric_name: name,
    metric_namespace: namespace,
    party_id: partyId,
    role: role
  }
  return param
}

export const getAllMetricsRequest = (metrics, partyId, role, componentName, jobId) => {
  const allMetricsRequest = []
  each(metrics, (metricsNames, namespace) => {
    each(metricsNames, name => {
      allMetricsRequest.push(makeMetricsDataRequest(name, namespace, partyId, role, componentName, jobId))
    })
  })
  return allMetricsRequest
}

export const sendMetricsDataRequest = (param) => {
  const data = getMetricData(param)
  return data
}

export const textTransform = (data) => {
  const content = []
  data.forEach(item => {
    content.push(`${item[0]}: ${item[1]}`)
  })
  return content
}

export const createFormComponent = (type, name, props, other) => {
  return {
    type,
    name,
    props,
    ...other
  }
}

export const createHeader = (label, prop, other) => {
  if (prop != null && typeof value === 'object') {
    other = prop
  }
  return {
    label,
    prop: prop || label,
    ...other
  }
}

export const createOption = (label, value) => {
  return {
    label,
    value: value || label
  }
}

export const formOption = (type, props) => {
  return {
    type: type,
    props: props
  }
}

export const createTables = (tables, type) => {
  const result = []
  if (!tables) return
  each(tables, (t) => {
    if (type === 'text') {
      result.push(formOption('text', {
        content: t.tableName
      }))
    } else if (type === 'title') {
      result.push(formOption('title', {
        title: t.tableName
      }))
    }
    result.push(
      formOption('table', {
        header: t.theader,
        data: t.tbody
      }))
  })
  return result
}

export const wrapGroupComponent = options => ({
  component: () => import('@/components/ComponentGroup'),
  options
})

export const curveFormatter = (xName, yName, thresholdsArr = {}) => {
  return (params) => {
    let str = ''
    params.forEach((obj, index) => {
      let xValue = ''
      if (thresholdsArr[obj.seriesName]) {
        xValue = thresholdsArr[obj.seriesName][obj.dataIndex]
      }
      if (xValue || xValue === 0) {
        str += `${xName}(${obj.seriesName}): ${xValue}<br>`
      }
      const value = Array.isArray(obj.data) ? obj.data[1] : obj.data
      str += `${yName}(${obj.seriesName}): ${value}<br>`
    })
    return str
  }
}

const getHeaders = () => [
  {
    type: 'index',
    label: 'index',
    width: 100
  },
  {
    prop: 'variable',
    label: 'variable',
    sortable: true
  },
  {
    prop: 'weight',
    label: 'weight',
    sortable: true
  }
]
const createItem = (variable, weight) => ({ variable, weight: formatFloat(weight) })
const createTextItem = (iters, isConverged) => [
  {
    type: 'text',
    props: {
      content: 'iterations: {iters}',
      data: {
        '{iters}': iters
      },
      className: 'small-form-text'
    }
  },
  {
    type: 'text',
    props: {
      content: 'converged: {isConverged}',
      data: {
        '{isConverged}': isConverged
      },
      className: 'small-form-text'
    }
  }
]

export const wrapForm = (form, rest) => {
  return {
    type: 'form',
    props: {
      form,
      ...rest
    }
  }
}

export function oneVsRestResultHandler(responseData, role, hasStepwise) {
  const { oneVsRestResult } = responseData
  const mod = oneVsRestResult.completedModels
  const classed = oneVsRestResult.oneVsRestClasses
  const isHost = role.toLowerCase() === 'host'
  const isGuest = role === 'guest'
  const modLen = mod.length
  const tables = {}
  const options = makeArray(modLen)
  const iters = {}
  const converged = {}
  const group = []
  each(mod, (val, i) => {
    const oWeight = val.weight
    const header = val.header
    const temp = []
    each(header, h => {
      temp.push(createItem(h, oWeight[h]))
    })
    if (!isHost) {
      temp.push(createItem('intercept', val.intercept))
    }
    const name = `model_${i}${isGuest ? `:${classed[i]}` : ''}`
    options[i] = name
    iters[name] = val.iters
    converged[name] = val.isConverged
    tables[name] = temp
  })

  let formItems = []
  if (options.length) {
    formItems = [
      {
        type: 'f-select',
        name: 'select',
        props: {
          label: 'one_vs_rest model',
          options: options.map(item => ({ label: item.replace(/\:.+/, ''), value: item }))
        },
        connect: ['modelText', 'iterations', 'converged']
      },
      {
        type: 'text',
        name: 'modelText',
        props: {
          content: 'model label: {modelLabel}',
          data: {
            '{modelLabel}': val => val.replace(/\:.+/, '')
          },
          inner: true
        }
      },
      {
        type: 'text',
        name: 'iterations',
        props: {
          content: 'iterations: {iterations}',
          data: {
            '{iterations}': val => iters[val]
          },
          inner: true
        }
      },
      {
        type: 'text',
        name: 'converged',
        props: {
          content: 'converged: {converged}',
          data: {
            '{converged}': val => converged[val]
          },
          inner: true
        }
      }, {
        type: 'search'
      }
    ]

    group.push(wrapForm(formItems))
  }

  if (hasStepwise) {
    formItems.splice(1, 0, {
      type: 'text',
      props: {
        content: 'The Final Model Information:'
      }
    })
  }

  group.push({
    type: 'table',
    props: {
      data: tables,
      header: getHeaders(),
      export: 'model_summary'
    }
  })

  return group
}

export function weightHandler(responseData) {
  const { weight, intercept, needOneVsRest } = responseData
  const table = []
  const group = []
  each(weight, (val, key) => {
    table.push(createItem(key, val))
  })
  if (!needOneVsRest) {
    table.push(createItem('intercept', intercept))
    const { isConverged, iters } = responseData
    const texts = createTextItem(iters, isConverged)
    group.push(
      wrapForm([...texts, {
        type: 'search'
      }])
    )
  }
  group.push({
    type: 'table',
    props: {
      header: getHeaders(),
      data: table,
      export: 'model_summary'
    }
  })
  return group
}

const defaultRefreshing = async({ name, originParam }) => {
  const response = await getMetrics(originParam.props)
  const arrange = metricsArrange(response.data)
  let option
  if (name.startsWith('loss')) {
    option = arrange.find(arra => arra.name === 'loss')
  } else if (name.startsWith('dbi')) {
    option = arrange.find(arr => arr.name === 'dbi')
  } else {
    option = arrange.find(arra => arra.name === 'curves')
  }
  option = option.options[name]
  const final = deepClone(originParam)
  final.props.metrics = option
  return final
}

export const createAsyncComponent = (options, refreshing = true) => ({
  type: 'async',
  props: {
    options,
    refresh: refreshing ? async(params) => {
      if (isFunction(refreshing)) {
        refreshing(params)
      } else {
        await defaultRefreshing(params)
      }
    } : ''
  }
})
