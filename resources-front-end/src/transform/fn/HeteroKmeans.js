
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

import onlyMetrics from './onlyMetrics'
import { each } from './uitls'
const clusterHeader = () => {
  return [
    {
      type: 'index',
      label: 'index'
    },
    {
      prop: 'custerLabel',
      label: 'custer label'
    },
    {
      prop: 'count',
      label: 'count'
    },
    {
      prop: 'ratio',
      label: 'ratio'
    }
  ]
}

const centroidHeader = (centroid) => {
  const leftHeaders = []
  centroid.forEach((c, i) => {
    leftHeaders.push({
      prop: 'cluster' + i,
      label: 'Cluster' + i,
      showOverflowTooltip: true
    })
  })
  return [
    {
      type: 'index',
      label: 'index'
    },
    {
      prop: 'variable',
      label: 'variable',
      pageFixed: true
    },
    ...leftHeaders
  ]
}

const clusterData = (clusters) => {
  const result = []
  const total = { _total: true }
  let sum = 0
  let ratiosum = 0
  clusters.forEach(c => {
    sum += c.cluster[1]
    ratiosum += c.cluster[2]
    result.push({
      custerLabel: 'Cluster' + c.cluster[0],
      count: c.cluster[1],
      ratio: (c.cluster[2] * 100).toFixed(4) + '%'
    })
  })
  total['custerLabel'] = 'Total'
  total['count'] = sum
  total['ratio'] = Math.round(ratiosum * 100) + '%'
  result.push(total)
  return result
}

const centroidData = (cenData, headers) => {
  const result = []
  const coloums = headers.length
  for (let i = 0; i < coloums; i++) {
    result[i] = {
      variable: headers[i]
    }
    each(cenData, (data, index) => {
      result[i]['cluster' + index] = data.centroid[i]
    })
  }
  return result
}

const fn = async function(modelData, metricData, partyId, role, componentName, jobId) {
  const metricList = await onlyMetrics(modelData, metricData, partyId, role, componentName, jobId)
  const cluData = modelData.data.data ? modelData.data.data.clusterDetail : null
  const cenData = modelData.data.data ? modelData.data.data.centroidDetail : null
  const headers = modelData.data.data ? modelData.data.data.header : null
  let res = []

  if ((cluData && cluData.length > 0) && (cenData && cenData.length > 0)) {
    res = [{
      component: () => import('@/components/ComponentGroup'),
      options: [{
        type: 'text',
        props: {
          content: 'count of clusters: ' + modelData.data.data.countOfClusters,
          className: 'small-form-text'
        }
      }, {
        type: 'text',
        props: {
          content: 'max_interation: ' + modelData.data.data.maxInteration,
          className: 'small-form-text'
        }
      }, {
        type: 'text',
        props: {
          content: 'converged: ' + modelData.data.data.converged,
          className: 'small-form-text'
        }
      }]
    }]
  }

  if (cluData && cluData.length > 0) {
    res.push({
      component: () => import('@/components/ComponentGroup'),
      options: [{
        type: 'title',
        props: {
          content: 'Cluster Detail'
        }
      }, {
        type: 'table',
        props: {
          header: clusterHeader(),
          data: clusterData(cluData)
        }
      }]
    })
  }
  if (cenData && cenData.length > 0) {
    res.push({
      component: () => import('@/components/ComponentGroup'),
      options: [{
        type: 'title',
        props: {
          content: 'Centroid Detail'
        }
      }, {
        type: 'form',
        props: {
          form: [
            { type: 'search' }
          ]
        }
      }, {
        type: 'table',
        props: {
          header: centroidHeader(cenData),
          data: centroidData(cenData, headers),
          headerPagination: true
        }
      }]
    })
  }
  res.push(...metricList)
  return res
}

export default fn
