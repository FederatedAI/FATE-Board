
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

import { each, groupBy } from '../fn/uitls'
import { getTransformMetricFn } from '../index'
import { METRIC_TYPES } from '../fn/const'

const typeCurry = arr => type => arr.includes(type)

const isMultiType = typeCurry([METRIC_TYPES.RECALL_MULTI_EVALUATION, METRIC_TYPES.PRECISION_MULTI_EVALUATION])

const isBinaryType = typeCurry([METRIC_TYPES.RECALL_BINARY_EVALUATION, METRIC_TYPES.PRECISION_BINARY_EVALUATION])

const MULTI_EVALUATION = '_multiEvaluation'
const BINARY_EVALUATION = '_binaryEvaluation'

export default function(metricData) {
  const metricGroup = {}

  each(metricData.data, (list, namespace) => {
    const groupedList = groupBy(list, 'meta.metric_type')
    each(groupedList, ([metricType, gl]) => {
      let mType = metricType
      if (isMultiType(metricType)) {
        mType = MULTI_EVALUATION
      } else if (isBinaryType(metricType)) {
        mType = BINARY_EVALUATION
      }
      if (!metricGroup[mType]) {
        metricGroup[mType] = {}
      }
      if (metricGroup[mType][namespace]) {
        metricGroup[mType][namespace] = metricGroup[mType][namespace].concat(gl)
      } else {
        metricGroup[mType][namespace] = gl
      }
    })
  })

  const result = []
  each(metricGroup, (data, metricType) => {
    const fn = getTransformMetricFn(metricType)
    result.push(fn(data))
  })

  console.log(result)

  return result
}
