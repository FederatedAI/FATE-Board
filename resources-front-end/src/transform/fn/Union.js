
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

import { getAllMetricsRequest, sendMetricsDataRequest } from './common.js'

const getHeaders = () => [
  {
    prop: 'name',
    label: 'Name'
  }, {
    prop: 'row',
    label: 'Row count'
  }
]

const fn = async(modelData, metricsData, partyId, role, componentName, jobId) => {
  const metricsDataRequests = !metricsData.msg.match('no data') ? getAllMetricsRequest(metricsData.data, partyId, role, componentName, jobId) : null
  if (metricsDataRequests) {
    let res = {}
    const tableData = []
    const param = metricsDataRequests.shift()
    res = await sendMetricsDataRequest(param)
    const data = res.data.data
    data.length > 0 && data.forEach(function(item, index) {
      const dataObj = {
        'name': item[0],
        'row': item[1]
      }
      if (item[0].toLowerCase() === 'total') {
        tableData.push(dataObj)
      } else {
        tableData.splice(tableData.length - 1, 0, dataObj)
      }
    })
    return [{
      component: () => import('@/components/ComponentGroup'),
      options: [{
        type: 'table',
        props: {
          data: tableData,
          header: getHeaders(),
          zeroFormat: '0'
        }
      }]
    }]
  }
}

export default fn
