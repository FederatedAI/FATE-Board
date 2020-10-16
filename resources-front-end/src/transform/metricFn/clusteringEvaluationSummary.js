
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

import { createHeader, each } from '../fn/uitls'
const externalIndexHeader = [
  createHeader('jaccard_similarity_score', 'JC'),
  createHeader('fowlkes_mallows_score', 'FMI'),
  createHeader('adjusted_rand_score', 'RI')
]

const DBIHeader = [
  createHeader('davies_bouldin_index', 'DBI')
]

function into(list, data) {
  return list.find(item => item.prop === data)
}

function getTableData(data) {
  const res = {}
  each(data, (val) => {
    res[val[0]] = val[1]
  })
  return [res]
}

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

function clusterEvaluationSummary(data, param) {
  const res = []
  for (const key in data) {
    const val = data[key]
    if (into(externalIndexHeader, val.data[0][0])) {
      res.push(...createTable(externalIndexHeader, getTableData(val.data), 'External Index'))
    } else {
      res.push(...createTable(DBIHeader, getTableData(val.data), 'Internal Index'))
    }
  }
  return res
}

export default clusterEvaluationSummary
