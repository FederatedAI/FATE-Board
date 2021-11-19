
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

import metricsArrange from './metricsArrange'
import { getTransformMetricFn } from '../index'
import { each } from './uitls'

const fn = async(modelData, metricsData, partyId, role, componentName, jobId) => {
  const params = {
    party_id: partyId,
    role: role,
    component_name: componentName,
    job_id: jobId
  }
  const group = []
  let othersHandler
  if (metricsData && !metricsData.msg.match('no data')) {
    metricsData = metricsArrange(metricsData.data)
    each(metricsData, md => {
      if (md.name === 'others') {
        othersHandler = getTransformMetricFn(md.name)
        othersHandler = othersHandler.bind(null, md, params)
      }
    })
  }
  if (othersHandler) {
    const others = await othersHandler()
    group.push(...others)
  }

  return group
}

export default fn
