
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

export function getGaugeOptions() {
  return {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
    },
    grid: {
      top: '50%'
    },
    series: [
      {
        title: {
          show: false
        },
        center: ['50%', '44%'],
        name: 'value',
        type: 'gauge',
        detail: {
          show: true,
          color: '#494ece',
          formatter: '{value}%',
          offsetCenter: [0, '60%'],
          fontWeight: 'bold',
          fontSize: 36
        },
        axisTick: {
          show: false,
          length: 4,
          splitNumber: 3,
          lineStyle: {
            color: '#fff',
            opacity: 0.4
          }
        },
        axisLabel: {
          distance: -14,
          color: '#494ece',
          fontsize: 16
        },
        axisLine: {
          lineStyle: {
            color: [
              [0.25, 'rgba(73,78,206,0.7)'],
              [0.5, 'rgba(73,78,206,0.8)'],
              [0.75, 'rgba(73,78,206,0.9)'],
              [1, '#494ece']
            ],
            width: 10
          }
        },
        splitLine: {
          show: false
        },
        pointer: {
          show: true
        },
        data: [{ value: 0, name: 'rate' }]
      }
    ]
  }
}

export default getGaugeOptions()

