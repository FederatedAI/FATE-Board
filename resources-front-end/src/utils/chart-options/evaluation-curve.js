
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

// import { trimId } from '@/utils'
export function getEvaluationCurveOptions() {
  return {
    // color: ['#ff8800', '#f23ba9', '#494ece', '#24b68b', '#A21155'],
    color: ['#494ece',
      '#00d269',
      '#ff8103',
      '#00dfcf',
      '#f23ba9',
      '#0080ff',
      '#c13ce1',
      '#ffcd03',
      '#7c56ff',
      '#a7cf02',
      '#00d3ff',
      '#ff1414'],
    backgroundColor: '#fbfbfc',
    tooltip: {
      // enterable: true,
      // position(pos, params, el, elRect, size) {
      //   console.log(pos, params, size)
      //   const obj = { top: 10 }
      //   obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 80
      //   return obj
      // },
      position(pos, params, el, rect, size) {
        const toolTipWidth = el.offsetWidth
        const toolTipHeight = el.offsetHeight
        const viewWidth = size.viewSize[0]
        const viewHeight = size.viewSize[1]
        const leftGap = 20
        const topGap = -10
        let left = pos[0] + leftGap
        let top = pos[1] + topGap
        if (top + toolTipHeight >= viewHeight) {
          top = viewHeight - toolTipHeight
        }
        if (left + toolTipWidth + 5 * leftGap >= viewWidth) {
          left = viewWidth - toolTipWidth - 5 * leftGap
        }
        return { left, top }
      },
      axisPointer: {
        type: 'line'
      },
      trigger: 'axis'
    },
    // legend: {
    //   show: true,
    //   right: '5%',
    //   top: '3%',
    //   orient: 'horizontal',
    //   itemWidth: 15,
    //   itemHeight: 15
    // },
    itemStyle: {},
    grid: {
      top: '10%',
      left: '3%',
      right: '10%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      splitLine: {
        show: false
      },
      axisTick: {
        alignWithLabel: true
      },
      name: '',
      // nameTextStyle: {
      //   color: 'transparent'
      // },
      nameCap: 10
    },
    yAxis: {
      type: 'value',
      name: '',
      splitArea: {
        show: true,
        areaStyle: {
          color: ['#ffffff']
        }
      }
    },
    series: [
      // {
      //   name: 'value',
      //   type: 'line',
      //   smooth: true,
      //   symbol: 'none',
      //   // areaStyle: {
      //   //   color: '#3398DB',
      //   //   opacity: 0.5
      //   // },
      //   data: []
      // }
    ],
    legend: {}
  }
}

export default getEvaluationCurveOptions()
