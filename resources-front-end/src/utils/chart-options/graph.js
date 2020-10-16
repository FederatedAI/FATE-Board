
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

export function getGraphOptions() {
  return {
    tooltip: {
      show: false
    },
    animationDurationUpdate: 500,
    animationEasingUpdate: 'quinticInOut',
    grid: {
      top: '20%',
      bottom: '20%',
      left: '10%',
      right: '10%'
    },
    series: [
      {
        type: 'graph',
        layout: 'none',
        roam: false,
        label: {
          normal: {
            show: true,
            offset: [0, 25],
            fontSize: 14
          }
          // show: true,
          // color: '#333',
          // borderWidth: 1,
          // borderRadius: 4,
          // borderColor: '#333',
          // // backgroundColor: '#fff',
          // padding: [10, 30],
          // lineHeight: 20
        },
        // rect,circle,roundRect,triangle,diamond,pin,arrow,none
        symbol: 'circle',
        symbolSize: [30, 30],
        symbolOffset: [0, 0],
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [3, 8],
        // edgeLabel: {
        //   show: true,
        //   textStyle: {
        //     fontSize: 20
        //   }
        // },
        data: [],
        links: [],
        itemStyle: {
          // color: 'transparent'
        },
        lineStyle: {
          normal: {
            color: '#7f7d8e',
            opacity: 0.9,
            width: 1,
            curveness: 0
          }
        }
      }
    ]
  }
}

export default getGraphOptions()
