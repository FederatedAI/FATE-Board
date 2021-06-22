
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

import { each } from './uitls'
import { wrapGroupComponent } from './common'

function pearsonHandler(modelData, metricData, partyId, role, componentName, jobId) {
  if (modelData.msg.match('no data')) {
    return []
  }
  const data = modelData.data.data
  const allNames = data.allNames
  const single = allNames.length <= 1
  const corr = {}
  let localHeader
  let otherHeader
  let anony = []
  const anonyHeader = []
  if (role === 'guest') {
    localHeader = !single ? allNames[0].names : allNames[0].names
    otherHeader = !single ? allNames[1].names : []
  } else {
    localHeader = !single ? allNames[1].names : allNames[0].names
    otherHeader = !single ? allNames[0].names : []
  }

  anonyHeader.push({
    label: 'index',
    type: 'index'
  })
  anonyHeader.push({
    label: 'variable',
    prop: 'name',
    showOverflowTooltip: true
  })
  if (!single) {
    anonyHeader.push({
      label: `anonym in ${(role === 'guest' ? 'host' : 'guest')}`,
      prop: 'anonymous',
      width: 115,
      showOverflowTooltip: true
    })
  }

  anony = data.anonymousMap
  // adding vif data
  if (data.localVif && Array.isArray(data.localVif) && data.localVif.length > 0) {
    anonyHeader.push({
      label: 'vif',
      prop: 'vif',
      showOverflowTooltip: true,
      sortable: true
    })
    each(anony, (item, index) => {
      item['vif'] = data.localVif[index]
    })
  }
  // get local correlation
  const fillCorrData = (corr, header1, header2, data) => {
    const header2Legnth = header2.length
    each(header1, (h1, i) => {
      each(header2, (h2, j) => {
        if (!corr[h1]) {
          corr[h1] = {}
        }
        corr[h1][h2] = data[i * header2Legnth + j]
      })
    })
  }
  fillCorrData(corr, localHeader, localHeader, data.localCorr)
  fillCorrData(corr, localHeader, otherHeader, data.corr)

  if (!single) {
    each(localHeader, (h, i) => {
      each(anony, a => {
        if (a.name === h) {
          localHeader[i] += `(${a.anonymous})`
        }
      })
    })
  }

  const group = [
    {
      type: 'group',
      props: {
        options: [{
          type: 'form',
          props: {
            form: [{
              type: 'search'
            }]
          }
        },
        {
          type: 'table',
          props: {
            header: anonyHeader,
            data: anony
          }
        }]
      }
    },
    {
      type: 'pearson',
      props: {
        variable: localHeader,
        otherVariable: otherHeader,
        nums: corr,
        single,
        role
      }
    }
  ]

  return [wrapGroupComponent(group)]
}

export default pearsonHandler
