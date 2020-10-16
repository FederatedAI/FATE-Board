<template>
  <div class="container">
    <canvas :id="canvasId" />
    <div class="buttonList">
      <div class="opera_btn" @click="suitableWhole">
        <i class="el-icon-full-screen" />
      </div>
      <div class="opera_btn" @click="bigger">
        <i class="el-icon-plus" />
      </div>
      <div class="opera_btn" @click="small">
        <i class="el-icon-minus" />
      </div>
    </div>
  </div>
</template>

<script>
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

import Pearson from '../canvas/extra/correlation'
import Layer from '../canvas/Core'

export default {
  name: 'CorrelationTable',
  props: {
    features: {
      type: Array,
      default: () => []
    },
    correlation: {
      type: Array,
      default: () => []
    },
    max: {
      type: Number,
      default: 1
    },
    min: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      canvas: null,
      component: null,
      containerPadding: 5,
      needChangeCorrelation: false,
      correlationDisable: {},
      canvasId: 'correlationTable',
      textShowed: false
    }
  },
  watch: {
    features: {
      handler() {
        let newOne = false
        if (!this.canvas || !this.canvas.inited) {
          this.initing()
        }
        if (this.needChangeCorrelation) {
          if (this.features.length === this.correlation.length) {
            newOne = true
            this.getInstance(this.canvas.canvasDom)
            if (this.textShowed) {
              this.showText()
            }
          }
        }
        if (
          !newOne &&
					this.component &&
					this.features.length <= this.correlation.length
        ) {
          this.component.emit('newFeatures', this.features, this.textShowed)
        }
      },
      deep: true
    },
    correlation: {
      handler() {
        if (!this.canvas || !this.canvas.inited) {
          this.initing()
        } else if (this.correlation.length === this.features.length) {
          this.getInstance(this.canvas.canvasDom)
        } else {
          this.needChangeCorrelation = true
        }
      }
    },
    min: {
      handler() {
        this.component.emit('filter', this.max, this.min, this.textShowed)
      }
    },
    max: {
      handler() {
        this.component.emit('filter', this.max, this.min, this.textShowed)
      }
    }
  },
  created() {
    this.initCanvas()
  },
  mounted() {
    this.initing()
  },
  methods: {
    initCanvas() {
      this.canvasId = Layer.getUUID('correlationTable')
    },
    initing() {
      const that = this
      const can = document.getElementById(this.canvasId)
      if (!can) {
        return false
      }
      setTimeout(() => {
        this.canvas = new Layer.CanvasUtil(
          can,
          {
            click: false,
            resize: () => {
              that.suitableWhole()
            },
            mouseout: {
              operation: lay => {
                lay.emit('showTips')
              }
            }
          },
          () => {
            that.getInstance(can)
            return that.component
          }
        )
      }, 10)
    },
    checkPos(can) {
      let width = can.width - this.containerPadding
      const height = can.height - this.containerPadding
      if (height < width) {
        width = height
      }
      const point = { x: (can.width - width) / 2, y: (can.height - width) / 2 }
      return { totalWidth: width, point }
    },
    getInstance(can) {
      if (this.component) {
        this.component.deleteAllAboutChain()
      }
      const style = this.checkPos(can)
      this.component = Pearson.drawCorrelation({
        canvas: can,
        props: {
          features: this.features,
          correlations: this.correlation,
          width: style.totalWidth,
          point: style.point,
          max: this.max,
          min: this.min
        },
        events: Pearson.events
      })
      this.component.drawing()
      if (this.canvas) {
        this.canvas.lay = this.component
      }
      this.needChangeCorrelation = false
    },
    suitableWhole() {
      const that = this
      this.canvas.suitableForWhole(
        () => {
          const lay = that.component
          const clear = lay.$meta.get('clear')
          return {
            width: clear.width,
            height: clear.height,
            point: clear.point
          }
        },
        () => {
          const style = that.checkPos(this.canvas.canvasDom)
          that.component.point = style.point
          that.component._inited = false
        },
        that.containerPadding,
        false
      )
    },
    bigger() {
      this.canvas.scaleBigger()
    },
    small() {
      this.canvas.scaleSmaller()
    },
    showText() {
      this.textShowed = true
      this.component.emit('showContent', true)
    },
    hideText() {
      this.textShowed = false
      this.component.emit('showContent')
    },
    canvasResize() {
      setTimeout(() => {
        if (this.canvas.interactive['resize']) {
          this.canvas._suitable()
          this.canvas.interactive['resize']()
        } else {
          this.canvas._inited()
        }
      }, 10)
    }
  }
}
</script>

<style scoped lang="scss">
.container {
	width: 100%;
	height: 100%;
	position: relative;
}
.buttonList {
	position: absolute;
	bottom: 10px;
	left: 10px;
	display: flex;
	flex-direction: column;
	.opera_btn {
		width: 32px;
		height: 32px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f8f8fa;
		margin-bottom: 12px;
		color: #bbbbc8;
		&:hover {
			background-color: #494ece;
			color: #fff;
		}
		&:last-child {
			margin-bottom: 0px;
		}
	}
}
</style>
