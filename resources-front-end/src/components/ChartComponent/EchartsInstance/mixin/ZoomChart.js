
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

const zoomChart = {
  data() {
    return {
      chartSuitables: {},
      chartScale: ''
    }
  },
  methods: {
    chartSuitable() {
      const pos = {}
      const scal = {}
      const sty = getComputedStyle(this.$refs['myChart'])
      const parentSty = getComputedStyle(this.$refs['myChart'].parentElement)
      const xScale = parseInt(parentSty.width) / parseInt(sty.width)
      const yScale = parseInt(parentSty.height) / parseInt(sty.height)
      if (xScale < yScale) {
        scal.x = xScale
        scal.y = xScale
        scal.whole = true
        pos.left = parseFloat(sty.width) * (xScale - 1) / 2
        pos.top = parseFloat(sty.height) * (xScale - 1) / 2
      } else {
        pos.top = 0
        scal.x = yScale
        scal.y = yScale
        scal.whole = true
        pos.left = parseFloat(sty.width) * (yScale - 1) / 2
        pos.top = parseInt(sty.height) * (yScale - 1) / 2
      }
      pos.original = true
      this.chartSuitables = pos
      this.chartScale = scal
    },
    chartPlus() {
      this.chartScale = {
        x: 0.2,
        y: 0.2,
        whole: false
      }
      this.chartSuitables.original = false
    },
    chartMinus() {
      this.chartScale = {
        x: -0.2,
        y: -0.2,
        whole: false
      }
      this.chartSuitables.original = false
    },
    recovery() {
      this.chartScale = {
        x: 1,
        y: 1,
        whole: true
      }
      this.chartSuitables = {
        top: 0,
        left: 0,
        original: true
      }
    }
  }
}

export default zoomChart
