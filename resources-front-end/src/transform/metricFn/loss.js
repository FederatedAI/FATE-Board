
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

import { formatFloat } from '@/utils'
import evaluationFunc from './_evaluation'

export default function(response) {
  return evaluationFunc('loss', { yAxis: { name: 'loss' }, xAxis: { minInterval: 1, min: function() {
    return (response.data && response.data.train && response.data.train.loss && response.data.train.loss.data && response.data.train.loss.data[0] && response.data.train.loss.data[0][0]) || 0
  } }}, undefined, () => (params) => {
    let str = ''
    const xValue = params[0].axisValue
    str += `iteration: ${xValue}<br>`
    params.forEach((obj, index) => {
      const value = obj.data[1]
      str += `loss${params.length > 1 ? '(' + obj.seriesName + ')' : ''}: ${formatFloat(value)}<br>`
    })
    return str
  })(response.data)
}

