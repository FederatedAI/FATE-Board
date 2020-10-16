
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
import { each, isEmpty } from './uitls'
import { getTransformMetricFn } from '../index'
import { METRIC_TYPES } from './const'
import { wrapGroupComponent, createAsyncComponent } from './common'
import arrangeMetric from './metricsArrange'
import { explainCurves } from './metricsArrange'

function bestIterationHandler(group, bestIteration) {
  if (bestIteration > -1) {
    group.unshift({
      type: 'form',
      props: {
        form: [
          {
            type: 'text',
            props: {
              content: `The Final Model: iter ${bestIteration}`
            }
          }
        ]
      }
    })
  }
}

const createAsyncOption = (name, props, method, transform, exportName, detail) => ({
  name,
  props,
  method,
  transform,
  export: exportName,
  detail: detail
})

async function HeteroNNHandler(modelData, metricsData, partyId, role, componentName, jobId) {
  const responseData = modelData.data.data
  const group = []
  const modelComponent = []

  if (responseData) {
    bestIterationHandler(modelComponent, responseData.bestIteration)
  }
  if (!isEmpty(modelComponent)) {
    group.push(wrapGroupComponent(modelComponent))
  }

  const params = {
    party_id: partyId,
    role: role,
    component_name: componentName,
    job_id: jobId
  }
  let othersRequest
  let othersResult
  const metricsComponent = []

  if (metricsData && !metricsData.msg.match('no data')) {
    metricsData = arrangeMetric(metricsData.data)
    each(metricsData, md => {
      if (md.name === 'others') {
        othersRequest = getMetricsData.bind(null, {
          metrics: md.options,
          ...params
        })
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

  if (metricsComponent.length) {
    each(metricsComponent, mc => {
      group.push(wrapGroupComponent(mc))
    })
  }

  if (othersRequest) {
    othersResult = await othersRequest()
  }

  if (othersResult) {
    const transformFn = getTransformMetricFn(METRIC_TYPES.EVALUATION_SUMMARY)
    const table = transformFn(othersResult.data)
    if (group.length > 1) {
      group.splice(1, 0, wrapGroupComponent(table))
    } else {
      group.push(wrapGroupComponent(table))
    }
  }

  return group
}

export default HeteroNNHandler
