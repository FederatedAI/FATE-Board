
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

import camelCase from 'lodash/camelCase'

export default function getTransformFn(modelType) {
  const textOutput = ['Upload', 'Download']
  const dataSplit = ['HomoDataSplit', 'HeteroDataSplit']
  const secureBoost = ['HomoSecureBoost', 'HeteroSecureBoost', 'HomoSecureboost', 'HeteroSecureboost', 'HeteroFastSecureBoost', 'HomoFastSecureBoost', 'HeteroFastSecureboost', 'HomoFastSecureboost']
  const pearson = ['HeteroPearson', 'HomoPearson']
  if ((textOutput.join('|')).match(modelType)) {
    return require(`@/transform/fn/TextOutput.js`).default
  } else if ((dataSplit.join('|')).match(modelType)) {
    return require(`@/transform/fn/DataSplit.js`).default
  } else if ((secureBoost.join('|')).match(modelType)) {
    return require(`@/transform/fn/Secureboost.js`).default
  } else if ((pearson.join('|')).match(modelType)) {
    return require(`@/transform/fn/Pearson.js`).default
  } else {
    try {
      return require(`@/transform/fn/${modelType}.js`).default
    } catch (err) {
      return require('@/transform/fn/onlyMetrics.js').default
    }
  }
}

export function getTransformMetricFn(metricType) {
  const file = metricType.startsWith('_') ? metricType : camelCase(metricType)
  return require(`@/transform/metricFn/${file}.js`).default
}
