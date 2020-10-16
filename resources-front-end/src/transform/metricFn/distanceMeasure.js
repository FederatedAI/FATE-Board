
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

import { createHeader } from '../fn/uitls'
const distanceMeasureHeader = [
  createHeader('cluster_index', 'Cluster Label'),
  createHeader('radius', 'Max radius'),
  createHeader('nearest_idx', 'Nearest Cluster')
]

function createTable(header, data, title) {
  return [{
    type: 'title',
    props: {
      content: title
    }
  }, {
    type: 'table',
    props: {
      header,
      data,
      export: title
    }
  }]
}

function distanceMeasure(data, param) {
  const group = []
  for (const key in data) {
    const meta = data[key].meta
    const cluster_index = meta.cluster_index
    const nearest_idx = meta.nearest_idx
    const radius = meta.radius
    const len = cluster_index.length
    const tableData = []
    for (let i = 0; i < len; i++) {
      tableData.push({
        cluster_index: 'Cluster' + cluster_index[i],
        nearest_idx: 'Cluster' + nearest_idx[i],
        radius: radius[i]
      })
    }
    group.push(...createTable(distanceMeasureHeader, tableData, 'Distance Measure'))
  }
  return group
}

export default distanceMeasure
