
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

export function getTreeOptions() {
  return {
    backgroundColor: '#ffffff',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: params => {
        const node = params.data.meta
        const strArr = params.data.name.split('\n')
        let str = ''
        strArr.forEach((item, index, arr) => {
          if (item.match(/[a-z]/i)) {
            if (node.isLeaf && item.match(/weight/i)) {
              if (node.moWeight && node.moWeight.length && node.moWeight.length > 0) {
                str += `weight: ${node.moWeight.length > 1 ? '<br>' : ''}`
                for (let i = 0; i < node.moWeight.length; i++) {
                  str += `"${i}": ${node.moWeight[i]}${i < node.moWeight.length - 1 ? '<br>' : ''}`
                }
              } else {
                str += `weight: ${node.weight}`
              }
            } else {
              str += item
            }
            if (index < arr.length - 1) {
              str += '<br>'
            }
          }
        })
        return str
      }
    },
    series: {
      type: 'tree',
      data: [],
      left: '2%',
      right: '2%',
      top: '7%',
      bottom: '7%',
      symbol: 'rect',
      symbolSize: [110, 70],
      layout: 'orthogonal',
      orient: 'vertical',
      lineStyle: {
        color: '#e8e8ef',
        width: 2
      },
      itemStyle: {
        normal: {
          color: 'transparent',
          borderColor: 'transparent'
        }
      },
      expandAndCollapse: false,

      label: {
        position: 'inside',
        backgroundColor: 'rgb(73,78,206)',
        color: '#fff',
        distance: 0,
        rotate: 0,
        verticalAlign: 'middle',
        // borderColor: '#494ece',
        borderRadius: 5,
        align: 'center',
        fontSize: 12,
        borderWidth: 1,
        padding: [3, 1],
        width: 105,
        height: 60,
        lineHeight: 16,
        rich: {}
      },

      leaves: {
        label: {
          position: 'inside',
          backgroundColor: 'rgb(146,149,226)',
          color: '#fff',
          distance: 0,
          rotate: 0,
          verticalAlign: 'middle',
          // borderColor: '#9194e1',
          borderRadius: 5,
          fontSize: 12,
          align: 'center',
          borderWidth: 1,
          width: 105,
          height: 60,
          lineHeight: 16,
          rich: {}
        }
      },

      animationDurationUpdate: 750
    }
  }
}

const options = getTreeOptions()

export default options
