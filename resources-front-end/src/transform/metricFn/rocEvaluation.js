
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

import evaluationFunc from './_evaluation'

export default evaluationFunc(
  'roc',
  {
    yAxis: { name: 'tpr' }
  },
  {
    areaStyle: {
      color: '#494ece',
      opacity: 0.1
    }
  },
  function({ thresholds }) {
    return params => {
      let str = ''
      params.forEach(obj => {
        const xValue = thresholds[obj.seriesName][obj.dataIndex]
        if (xValue || xValue === 0) {
          str += `Threshold: ${xValue}<br>`
        }
        str += `Tpr(${obj.seriesName}): ${obj.data[1]}<br>`
        str += `Fpr(${obj.seriesName}): ${obj.axisValue}<br>`
      })
      return str
    }
  }
)
