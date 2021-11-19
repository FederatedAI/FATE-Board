
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
import { formatFloat } from '@/utils'
import { each } from './uitls'
import metricsArrange from './metricsArrange'

const getHeaders = () => [{
  type: 'index',
  label: 'index',
  width: 100
}, {
  prop: 'variable',
  label: 'variable'
},
{
  prop: 'columnLower',
  label: 'columnLower'
},
{
  prop: 'columnUpper',
  label: 'columnUpper'
},
{
  prop: 'mean',
  label: 'mean'
},
{
  prop: 'std',
  label: 'std'
}]

function createTextComponent(content) {
  return {
    type: 'form',
    props: {
      form: [
        {
          type: 'text',
          props: {
            content
          }
        }
      ]
    }
  }
}

async function scaleHandler(modelData, metricsData, partyId, role, componentName, jobId) {
  const responseData = modelData.data.data
  const data = responseData && responseData.colScaleParam
  const header = responseData && responseData.header
  const table = []
  if (data && header) {
    each(header, head => {
      const row = data[head]
      if (row) {
        row.variable = head
        row.columnLower = formatFloat(row.columnLower)
        row.columnUpper = formatFloat(row.columnUpper)
        table.push(row)
      }
    })
  }

  const params = {
    party_id: partyId,
    role: role,
    component_name: componentName,
    job_id: jobId
  }

  let othersRequest
  let othersResult

  if (metricsData && !metricsData.msg.match('no data')) {
    metricsData = metricsArrange(metricsData.data)
    each(metricsData, md => {
      if (md.name === 'others') {
        othersRequest = getMetricsData.bind(null, {
          metrics: md.options,
          ...params
        })
      }
    })
  }

  if (othersRequest) {
    othersResult = await othersRequest()
  }

  return Array.isArray(table) && table.length > 0 ? [
    {
      component: () => import('@/components/ComponentGroup'),
      options: [
        createTextComponent(`method: ${othersResult.data.train.scale.meta.method || 'null'}`),
        {
          type: 'table',
          props: {
            header: getHeaders(),
            data: table,
            pageSize: 10,
            zeroFormat: '0',
            export: 'scale_detail'
          }
        }
      ]
    }
  ] : []
}

export default scaleHandler
