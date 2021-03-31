
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

// import { formatFloat } from '@/utils'
import evaluationFunc from './_evaluation'

export default function(data) {
  return evaluationFunc('performanceSum', {
    yAxis: {
      name: 'auc, ks', min: 'dataMin'
    },
    xAxis: {
      type: 'category',
      data: data.xAxis
    },
    grid: {
      top: '15%'
    },
    legend: {
      top: '10',
      right: '20',
      icon: 'roundRect'
    }
  }, undefined, null, true)(data.metrics)
}

