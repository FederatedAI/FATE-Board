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

import { getAllMetricsRequest, sendMetricsDataRequest, textTransform, wrapGroupComponent } from './common.js'

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
    let content = []
    const group = []
    let i = 0
    while (metricsDataRequests.length > 0) {
      const param = metricsDataRequests.shift()
      res = await sendMetricsDataRequest(param)
      const { data, meta } = res.data
      content = textTransform(data)
      let mid = createText(content)
      if (mid.length > 0) {
        group.unshift({
          type: 'form',
          props: {
            form: [
              ...mid
            ]
          }
        })
      }
      if (i !== 0 || metricsDataRequests.length === 0) {
        const content2 = []
        const hasPush = function(origin, keyword, align) {
          if (origin[keyword]) {
            content2.push(`${(align || keyword).replace(/_/g, ' ')}: ${origin[keyword].toString()}`)
          }
        }
        hasPush(meta, 'job_id')
        hasPush(meta, 'component_name')
        hasPush(meta, 'name', 'cache name')
        hasPush(meta, 'key', 'cache key')

        mid = createText(content2)
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
      }
      i++
    }
    return [wrapGroupComponent(group)]
  }
}

export default fn
