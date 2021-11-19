
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

import { getMetricsData } from '@/api/chart'
import metricsArrange from './metricsArrange'
import { getTransformMetricFn } from '../index'
import { each } from './uitls'
import { wrapGroupComponent, createAsyncComponent } from './common'
import { explainCurves } from './metricsArrange'
import isObject from 'lodash/isObject'
import contentToChart from '../metricFn/ovrEvaluation'

const createAsyncOption = (name, props, method, transform, exportName, detail) => ({
  name,
  props,
  method,
  transform,
  export: exportName,
  detail
})

function findOutOvr(group) {
  let data = null
  each(group, (item, key1) => {
    const options = item.options
    each(options, (options, key2) => {
      if (options.type === 'group') {
        const props = options.props.options
        each(props, (prop, type) => {
          if (prop.type === 'table') {
            if (prop.props.export === 'OneVsRestEvaluation') {
              data = prop.props.data
              if (Array.isArray(data)) {
                const type = data[0].name.split('_class')[0]
                data = {
                  [type]: data
                }
              }
              return false
            }
          }
        })
        if (data !== null) {
          return false
        }
      }
    })
    if (data !== null) {
      return false
    }
  })
  return data
}

function settingOvr(group, data) {
  group = group || []
  let namespace = new Set()
  each(data, (content, key) => {
    if (isObject(content)) {
      each(content, (value, key1) => {
        if (isObject(value)) {
          each(value, (item, key2) => {
            if (key2 === 'dataset') {
              namespace.add(item)
              return false
            }
          })
        } else if (key1 === 'dataset') {
          namespace.add(value)
          return false
        }
      })
    } else if (key === 'dataset') {
      namespace.add(content)
    }
  })
  namespace = Array.from(namespace)
  const form = group[0] ? group[0].props.form : []
  const newTabs = {
    label: 'One vs Rest',
    children: (() => {
      const res = []
      each(namespace, (val) => {
        res.push({
          label: val,
          value: 'ovr_' + val
        })
      })
      return res
    })()
  }
  if (form[0] && form[0].type === 'f-tabs') {
    const tabs = form[0].props.tabs
    if (tabs[0] && tabs[0].label.toLowerCase() !== 'loss') {
      tabs.push(newTabs)
    }
  } else {
    form.push({
      type: 'f-type',
      ptops: {
        tabs: [newTabs]
      }
    })
    group.push({
      type: 'form',
      props: {
        form
      }
    })
  }
  const content = group[1]
  const options = []
  each(namespace, (ns) => {
    options.push(createAsyncOption(
      'ovr_' + ns,
      {
        tableData: data,
        namespace: ns
      },
      (res) => res,
      contentToChart,
      'one_vs_rest',
      true
    ))
  })
  if (content && content.type === 'async') {
    const setting = content.props.options
    setting.push(...options)
  } else {
    group.push(createAsyncComponent(options))
  }
  return group
}

async function handler(modelData, metricsData, partyId, role, componentName, jobId) {
  const params = {
    party_id: partyId,
    role: role,
    component_name: componentName,
    job_id: jobId,
    isEvaluation: true
  }

  const group = []
  const metricsComponent = []
  let othersHandler
  let ovrData
  if (metricsData && !metricsData.msg.match('no data')) {
    metricsData = metricsArrange(metricsData.data)
    each(metricsData, md => {
      if (md.name === 'others') {
        othersHandler = getTransformMetricFn(md.name)
        othersHandler = othersHandler.bind(null, md, params)
      } else if (md.name === 'curves' || md.name === 'loss') {
        const form = {
          type: 'form',
          props: {
            form: [
              {
                type: 'f-tabs',
                props: {
                  tabs: md.tabs
                }
              }
            ]
          }
        }
        const options = []
        each(md.options, (metrics, name) => {
          console.log(md.name, 'nams')
          options.push(createAsyncOption(
            name,
            {
              metrics: metrics,
              ...params
            },
            getMetricsData,
            getTransformMetricFn(md.name),
            explainCurves(name).name,
            true
          ))
        })
        metricsComponent.push([form, createAsyncComponent(options)])
      }
    })
  }

  if (othersHandler) {
    const others = await othersHandler()

    group.push(...others)
    ovrData = findOutOvr(group)
  }

  if (metricsComponent.length) {
    each(metricsComponent, mc => {
      if (ovrData) {
        mc = settingOvr(mc, ovrData)
      }
      group.push(wrapGroupComponent(mc))
    })
  }

  return group
}

export default handler
