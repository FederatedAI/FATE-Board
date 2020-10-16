
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

export function getDoubleBarOptions() {
  const series = [
    {
      // name: 'background',
      type: 'bar',
      barWidth: '20%',
      barGap: '-100%',
      itemStyle: {
        color: '#e8e8ef'
      },
      // data: [1, 1, 1, 1, 1, 1, 1],
      data: [],
      label: {
        show: true,
        position: 'right',
        // formatter(params) {
        //   return data[params.dataIndex]
        // }
        color: '#999',
        formatter: null
      },
      tooltip: {
        show: false
      }
    },
    {
      name: 'value',
      type: 'bar',
      barWidth: '20%',
      data: []
      // data: [1, 1, 1, 1, 1, 1, 1]
    }
  ]
  const options = {
    color: ['#878ada'],
    title: {
      text: '',
      textStyle: {
        color: '#606266',
        fontSize: 16,
        fontFamily: '"Lato", "proxima-nova", "Helvetica Neue", Arial, sans-serif'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '5%',
      bottom: '3%',
      containLabel: true
    },
    backgroundColor: '#f8f8fa',
    yAxis: [
      {
        type: 'category',
        // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [],
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        // axisLabel: {
        //   show: false
        // },
        splitLine: {
          show: false
        }
      },
      {
        type: 'category',
        offset: 30,
        // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [],
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        splitLine: {
          show: false
        }
      }
    ],
    xAxis: {
      type: 'value',
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    series
  }
  return options
}
// const data = [0.15, 0.30, 0.42, 0.54, 0.61, 0.65, 0.85]

export default getDoubleBarOptions()
