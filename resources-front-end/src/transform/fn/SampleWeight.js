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
import { METRIC_TYPES } from './const'
import { getMetricsData } from '@/api/chart'
import metricArrange from './metricsArrange'
import { getTransformMetricFn } from '../index'
// import { wrapGroupComponent } from './common'

async function weightMeta(group, metricsData, partyId, role, componentName, jobId) {
  const params = {
    party_id: partyId,
    role: role,
    component_name: componentName,
    job_id: jobId
  }

  if (metricsData && !metricsData.msg.match('no data')) {
    const md = metricArrange(metricsData.data)[0]
    const othersResult = await getMetricsData({
      metrics: md.options,
      ...params
    })
    const otherFunction = getTransformMetricFn(METRIC_TYPES.SAMPLE_WEIGHT)
    const table = otherFunction(othersResult.data)
    if (table) group.push(table)
  }
}

const fn = async(modelData, metricsData, partyId, role, componentName, jobId) => {
  const group = []
  await weightMeta(group, metricsData, partyId, role, componentName, jobId)
  return group
}

export default fn
