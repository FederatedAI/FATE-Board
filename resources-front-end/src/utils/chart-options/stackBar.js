
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

export function getStackBarOptions() {
  return {
    backgroundColor: '#EBEDF0',
    title: {
      text: ''
    },
    color: ['#8e91df', '#78d0b7'],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      show: true,
      right: 0,
      top: '3%',
      orient: 'horizontal',
      itemWidth: 15,
      itemHeight: 15
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    yAxis: {
      type: 'value',
      // axisTick: {
      //   show: false
      // },
      // axisLine: {
      //   show: false
      // },
      // axisLabel: {
      //   show: false
      // },
      // splitLine: {
      //   show: false
      // }
      splitArea: {
        show: true,
        areaStyle: {
          color: '#ffffff'
        }
      }
    },
    xAxis: {
      type: 'category',
      // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      data: [],
      // axisTick: {
      //   show: false
      // },
      // axisLine: {
      //   show: false
      // },
      // axisLabel: {
      //   show: false
      // },
      // splitLine: {
      //   show: false
      // }
      axisLine: {
        lineStyle: {
          color: '#A9A9A9'
        }
      }
    },
    series: [
      // {
      //   name: '',
      //   type: 'bar',
      //   data: [],
      //   stack: null
      //   // barWidth: '20%',
      //   // data: [0.05, 0.16, 0.02, 0.24, 0.31, 0.45, 0.75],
      //   // stack: 'event'
      // },
      // {
      //   name: '',
      //   type: 'bar',
      //   data: [],
      //   stack: null
      //   // barWidth: '20%',
      //   // data: [0.15, 0.30, 0.42, 0.54, 0.61, 0.15, 0.05],
      //   // stack: 'event'
      // }
    ]
  }
}

export default getStackBarOptions()
