
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

const createAsyncOption = (name, props, method, transform, exportName, detail) => ({
  name,
  props,
  method,
  transform,
  export: exportName,
  detail
})

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
  }

  if (metricsComponent.length) {
    each(metricsComponent, mc => {
      group.push(wrapGroupComponent(mc))
    })
  }

  return group
}

export default handler
