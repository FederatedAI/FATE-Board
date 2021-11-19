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

const createText = (content, joinMethod) => {
  const text = []
  content.forEach(c => {
    text.push({
      type: 'text',
      props: {
        content: c,
        className: 'small-form-text',
        subContent: (() => {
          if (c.toLowerCase().match(/unmatched.*count/i) && joinMethod.toLowerCase().match(/left/i)) {
            return `(Unmatched instance host variables are considered missing values)`
          } else {
            return ''
          }
        })()
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
      const index = content.findIndex((val) => {
        return val.toLowerCase().match(/unmatched/)
      })
      const joinMethod = meta.join_method ? meta.join_method.replace('_', ' ') : ''
      if (index >= 0 && joinMethod) {
        content.splice(index, 0, `Join method: ${joinMethod}`)
      }
      let mid = createText(content, joinMethod)
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
        const hasPush = function(origin, keyword) {
          if (origin[keyword]) {
          // if (origin[keyword] !== undefined) {
            // content2.push(`${keyword.replace('_', ' ')}: ${origin[keyword] ? origin[keyword].toString().replace('_', ' ') : '\' \''}`)
            content2.push(`${keyword.replace(/_/g, ' ')}: ${origin[keyword].toString().replace(/_/g, ' ')}`)
          }
        }
        for (const key in meta) {
          if (!(key.match(/metric_type/i) || key === 'name' || key.match(/join_method/i))) {
            hasPush(meta, key)
          }
        }
        mid = createText(content2, joinMethod)
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
