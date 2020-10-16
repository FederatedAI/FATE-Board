
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

export function getPSIbarOptions() {
  return {
    backgroundColor: '#fff',
    title: {
      text: ''
    },

    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          type: 'dotted',
          color: '#ff9e1f'
        }
      }
    },

    legend: {
      show: true,
      right: '5%',
      top: '3%',
      orient: 'horizontal'
    },

    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },

    yAxis: [{
      type: 'value',
      name: 'Expected, Actual',
      splitArea: {
        show: true,
        areaStyle: {
          color: '#ffffff'
        }
      },
      nameGap: 8,
      axisLabel: {
        show: true,
        interval: 'auto',
        formatter: '{value} %'
      },
      splitNumber: 5
    }, {
      type: 'value',
      name: 'PSI',
      nameGap: 8,
      splitArea: {
        show: true,
        areaStyle: {
          color: '#ffffff'
        }
      },
      axisLabel: {},
      splitNumber: 5
    }],
    xAxis: {
      type: 'category',
      data: [],
      axisLine: {
        lineStyle: {
          color: '#A9A9A9'
        }
      },
      axisLabel: {
        rotate: 30,
        fontSize: 12,
        color: '#999ba3'
      },
      nameGap: 5
    },
    series: []
  }
}

export default getPSIbarOptions()

