
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

import { getAllMetricsRequest, sendMetricsDataRequest, wrapGroupComponent } from './common.js'

const getHeaders = () => [
  {
    type: 'index',
    label: 'index'
  },
  {
    prop: 'value',
    label: 'original_label'
  },
  {
    prop: 'transformed_value',
    label: 'transformed_label'
  }
]

const fn = async(modelData, metricsData, partyId, role, componentName, jobId) => {
  const metricsDataRequests = (!metricsData.msg.toLowerCase().match('no data')) ? getAllMetricsRequest(metricsData.data, partyId, role, componentName, jobId) : null
  if (metricsDataRequests) {
    let res = {}
    const group = []
    while (metricsDataRequests.length > 0) {
      const param = metricsDataRequests.shift()
      res = await sendMetricsDataRequest(param)
      const { meta } = res.data
      if (meta.label_encoder) {
        const encoder = meta.label_encoder
        const variableData = []
        if (encoder && Object.keys(encoder).length > 0 && role === 'guest') {
          Object.keys(encoder).forEach(key => {
            variableData.push({
              value: key,
              transformed_value: encoder[key]
            })
          })
          group.push(
            {
              type: 'table',
              props: {
                data: variableData,
                header: getHeaders(),
                export: 'transform_detail'
              }
            }
          )
        }
        break
      }
    }
    return [wrapGroupComponent(group)]
  }
  return []
}

export default fn
