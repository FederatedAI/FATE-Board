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

const createText = (content) => {
  const text = []
  content.forEach(c => {
    text.push({
      type: 'text',
      props: {
        content: c,
        className: 'small-form-text'
      }
    })
  })
  return text
}

const fn = async(modelData, metricsData, partyId, role, componentName, jobId) => {
  const metricsDataRequests = (!metricsData.msg.toLowerCase().match('no data')) ? getAllMetricsRequest(metricsData.data, partyId, role, componentName, jobId) : null
  if (metricsDataRequests) {
    let res = {}
    const content = []
    const group = []
    const param = metricsDataRequests.shift()
    res = await sendMetricsDataRequest(param)
    const { meta } = res.data
    const hasPush = function(origin, keyword, align) {
      if (origin[keyword]) {
        content.push(`${(align || keyword).replace(/_/g, ' ')}: ${origin[keyword].toString()}`)
      }
    }
    hasPush(meta, 'model_id')
    hasPush(meta, 'model_version')
    hasPush(meta, 'component_name')
    hasPush(meta, 'step_index', 'checkpoint')
    const mid = createText(content)
    if (mid.length > 0) {
      group.push({
        type: 'form',
        props: {
          form: [
            ...mid
          ]
        }
      })
    }
    return [wrapGroupComponent(group)]
  }
}

export default fn
