<template>
  <div class="flex flex-col flex-center correlation-container" @click="toggleFilters(false)">
    <!-- 头部内容 -->
    <div class="flex flex-row space-between flex-center correlation-title">
      <div class="flex flex-row flex-center">
        <span>role:</span>
        <el-select v-model="selection" class="title-selection" @change="correlationChange">
          <el-option
            v-for="(item, index) in selectionType"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <span
          class="title-filters"
          @click.stop="toggleFilters(true)"
        >select</span>
        <div v-show="showingSelections" class="flex flex-col flex-start title-filters-dialog" @click.stop="">
          <div class="flex flex-row space-between title-filter-title">
            <span>Select Variable</span>
            <i class="el-icon-close selection-close" @click.stop="toggleFilters(false)" />
          </div>
          <!-- <el-transfer
            v-model="variables"
            :titles="['Variable', 'Selected']"
            :format="{
              noChecked: '${total}',
              hasChecked: '${checked}/${total}'
            }"
            :data="variableOptions"
            filterable
            class="title-filter-selection"
            @change="changeVariable"
          /> -->
          <transfer :all-info="variableOptions" @change="changeVariable"/>
        </div>
      </div>
      <el-checkbox
        v-model="showingText"
        class="correlation-showing-text"
        @change="changeShowingText"
      >Correlation coefficient</el-checkbox>
    </div>
    <!-- 展示图内容 -->
    <div class="flex flex-row space-around correlation-relationship">
      <div class="relationship-picture">
        <canvas :id="id" />
        <div class="flex flex-col flex-center suitable-button">
          <div class="sutiable-button-item item-suitable" @click.stop="suitable">
            <i class="el-icon-full-screen"/>
          </div>
          <div class="sutiable-button-item item-plus" @click.stop="dagPlus">
            <i class="el-icon-plus"/>
          </div>
          <div class="sutiable-button-item item-minus" @click.stop="dagMinus">
            <i class="el-icon-minus"/>
          </div>
        </div>
      </div>
      <div class="flex flex-col space-between range-axis">
        <span v-for="(item, index) in RangeAxis" :key="index" class="range-axis-item">- {{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { colorRgb } from '@/utils/tools/color'
import { TIMES } from '@/utils/dag/const.js'
import { relationship as Relat } from '@/utils/dag/components/relationship'
import Layer from '@/utils/dag/core'
import transfer from './transfer'

export default {
  name: 'Correlation',

  components: {
    transfer
  },

  props: {
    id: {
      type: String,
      default: 'relaitionshipCanvas'
    },
    between: {
      type: Number,
      default: 0.25
    },
    start: {
      type: Number,
      default: 1
    },
    end: {
      type: Number,
      default: -1
    },
    variable: {
      type: Array,
      default: () => []
    },
    nums: {
      // 双层数组，第一层表示行，第二层表示列
      type: Array | Object,
      default: () => []
    },
    otherVariable: {
      type: Array,
      default: () => []
    },
    role: {
      type: String,
      default: 'guest'
    }
  },

  data() {
    return {
      selectOptions: [
        { label: 'all', value: 'all' },
        { label: 'guest', value: 'guest' }
      ],
      selection: 'all',
      variables: [],
      times: 0,
      showingText: false,

      widths: 0,
      heights: 0,
      canvasDom: null,
      layer: null,

      preColors: [
        '#3135A6',
        '#5B96FB',
        '#BFEBFF',
        '#E8F6FF',
        '#FF81D9',
        '#EC4B56',
        '#C70861'
      ],
      showingSelections: false,
      canvasPadding: 50,

      mouseHolded: false,
      scaleTime: 1,
      oldScaleTime: 1,
      minScale: 0.8,

      originPointer: { x: 0, y: 0 },
      needReTransform: false,
      oldPos: null
    }
  },

  computed: {
    selectionType() {
      const f = JSON.parse(JSON.stringify(this.selectOptions))
      if (this.role !== 'guest') {
        f[1].label = 'host'
      }
      return f
    },
    variableOptions() {
      const final = []
      for (const val of this.variable) {
        final.push({ label: val, key: val })
      }
      if (this.selection === 'all') {
        for (const val of this.otherVariable) {
          final.push({ label: val, key: val })
        }
      }
      return final
    },
    finalVariable() {
      const final = []
      final.push(...this.sortBy(this.variables))
      return final
    },
    RangeAxis() {
      const final = []
      let s = this.start
      let e = this.end
      if (s < e) {
        const m = s
        s = e
        e = m
      }
      let val = s
      while (val >= e) {
        final.push(val)
        val -= this.between
      }
      return final
    },

    correlationPicContent() {
      const final = []
      for (const val of this.finalNums) {
        const middle = []
        for (const item of val) {
          const content = {}
          content.text = item
          content.color = this.getColorForNum(item)
          middle.push(content)
        }
        final.push(middle)
      }
      return final
    },

    middlePos() {
      return { x: this.widths / 2, y: this.heights / 2 }
    },
    finalNums() {
      const final = []
      const rowv = this.finalVariable
      const colv = JSON.parse(JSON.stringify(this.finalVariable)).reverse()
      for (let i = 0; i < rowv.length; i++) {
        const row = []
        for (let j = 0; j < colv.length; j++) {
          if (this.nums[rowv[i]]) {
            row.push(parseFloat(this.nums[rowv[i]][colv[j]].toFixed(6)) || '-')
          } else {
            if (this.nums[colv[j]]) {
              row.push(parseFloat(this.nums[colv[j]][rowv[i]].toFixed(6)) || '-')
            } else {
              row.push('-')
            }
          }
        }
        final.push(row)
      }
      return final
    }
  },

  beforeMount() {
    this.initSelectedVariable()
  },

  mounted() {
    const that = this
    this.initCanvas()
    this.mutationDivContainer()
    this.initCorrelation()
    window.addEventListener('resize', function() {
      that.canvasResize()
    })
  },

  methods: {
    initSelectedVariable() {
      this.variables = [...JSON.parse(JSON.stringify(this.variable)), ...JSON.parse(JSON.stringify(this.otherVariable))]
      if (this.variables.length > 20) {
        this.times = TIMES * 2
      } else {
        this.times = TIMES * 1.5
      }
    },
    getColorForNum(num) {
      if (num === '-') return '#F8F8FA'
      const range = parseFloat(Math.floor((this.start - num) / this.between * 100) / 100)
      const eachChange = parseFloat(
        Math.floor(this.preColors.length / this.RangeAxis.length * 100) / 100
      )
      const poinExchangeToColor = eachChange * range > 6 ? 6 : eachChange * range
      const startColor = colorRgb(
        this.preColors[Math.floor(poinExchangeToColor)]
      )
      const endColor = colorRgb(this.preColors[Math.ceil(poinExchangeToColor)])
      const change = poinExchangeToColor - Math.floor(poinExchangeToColor)
      const colorS = startColor
        .replace('rgba(', '')
        .replace(')', '')
        .split(',')
      const colorE = endColor
        .replace('rgba(', '')
        .replace(')', '')
        .split(',')
      const re = -(parseInt(colorS[0]) - parseInt(colorE[0])) * change
      const ge = -(parseInt(colorS[1]) - parseInt(colorE[1])) * change
      const be = -(parseInt(colorS[2]) - parseInt(colorE[2])) * change
      const final = [
        parseInt(colorS[0]) + re,
        parseInt(colorS[1]) + ge,
        parseInt(colorS[2]) + be
      ]
      return 'rgb(' + final.join(',') + ')'
    },

    initCanvas() {
      this.canvasDom = document.getElementById(this.id)
      const style = getComputedStyle(this.canvasDom.parentElement)
      this.widths = parseInt(style.width) * this.times
      this.heights = parseInt(style.height) * this.times
      this.canvasDom.setAttribute(
        'style',
        'width:' +
					this.widths / this.times +
					'px;height:' +
					this.heights / this.times +
					'px;overflow:hidden;'
      )

      this.canvasDom.setAttribute('width', this.widths)
      this.canvasDom.setAttribute('height', this.heights)
      this.canvasEvent()
    },
    initCorrelation() {
      const vm = this
      const states = {}
      states.x = this.middlePos.x
      states.y = this.middlePos.y
      states.width = Relat.calculateWidth(
        this.finalVariable.length,
        this.widths,
        this.heights
      )
      this.actualWidthOfDag =
				this.widths > this.heights ? this.heights : this.widths
      this.actualHeightOfDag = this.actualWidthOfDag
      states.table = {
        row: JSON.parse(JSON.stringify(this.finalVariable)).reverse(),
        col: JSON.parse(JSON.stringify(this.finalVariable)),
        content: this.correlationPicContent
      }
      states.showingText = this.showingText
      if (!this.layer) {
        this.layer = new Layer({
          canvas: this.canvasDom,
          state: states,
          path: Relat.path,
          clear: function(ctx, state) {
            ctx.clearRect(0, 0, vm.widths * 2, vm.heights * 2)
          },
          transfiguration: this.transfiguration
        })
      } else {
        this.layer.setStates(states)
        this.layer.forceRedrawing()
      }
    },
    toggleFilters(showing) {
      this.showingSelections = showing
    },
    changeShowingText() {
      this.layer.setStates({ showingText: this.showingText })
      this.layer.forceRedrawing()
    },
    canvasResize() {
      this.needReTransform = true
      this.initCanvas()
      this.initCorrelation()
    },
    changeVariable(data) {
      this.variables = []
      for (const val of data) {
        if (val.checked) {
          this.variables.push(val.key)
        }
      }
      this.initCorrelation()
    },
    correlationChange() {
      if (this.selection === 'guest') {
        this.variables = [...JSON.parse(JSON.stringify(this.variable))]
      } else {
        this.variables = [...JSON.parse(JSON.stringify(this.variable)), ...JSON.parse(JSON.stringify(this.otherVariable))]
      }
      this.initCorrelation()
    },
    translate(ctx, x, y) {
      ctx.translate(x, y)
    },
    canvasEvent() {
      const _getPosition = function(ev) {
        let x, y
        if (ev.layerX || ev.layerX === 0) {
          x = ev.layerX
          y = ev.layerY
        } else if (ev.offsetX || ev.offsetX === 0) {
          // Opera
          x = ev.offsetX
          y = ev.offsetY
        }
        const ua = window.navigator.userAgent
        if (ua.indexOf('Edge/') >= 0) {
          y -= 40
        } else if (ua.indexOf('MSIE') >= 0) {
          y -= 40
        } else if (ua.indexOf('Trident/') >= 0) {
          y -= 40
        }
        return { x: x, y: y }
      }
      const vm = this
      const common = function(ev, type) {
        const pos = _getPosition(ev)
        // pos.x = (pos.x - vm.changeX * vm.scaleTime) / vm.scaleTime
        // pos.y = (pos.y - vm.changeY * vm.scaleTime) / vm.scaleTime
        pos.x = vm.floatFixed((pos.x - vm.originPointer.x) * vm.times / vm.scaleTime, 6)
        pos.y = vm.floatFixed((pos.y - vm.originPointer.y) * vm.times / vm.scaleTime, 6)
        vm.layer.emit(type, pos)
        vm.layer.redrawing()
      }
      this.canvasDom.addEventListener('mousedown', function() {
        vm.mouseHolded = true
      })
      this.canvasDom.addEventListener('mouseup', function() {
        vm.mouseHolded = false
      })
      this.canvasDom.addEventListener('mouseover', function() {
        vm.mouseHolded = false
      })
      this.canvasDom.addEventListener('mousemove', function(ev) {
        const pos = _getPosition(ev)
        if (!vm.pos) {
          vm.pos = pos
        } else {
          if (pos.x !== vm.pos.x || pos.y !== vm.pos.y) {
            vm.oldPos = vm.pos
            vm.pos = pos
            if (vm.mouseHolded) {
              vm.translateMove(pos)
              vm.layer.forceRedrawing()
            } else {
              common(ev, 'mousemove')
            }
          }
        }
      })
      this.canvasDom.addEventListener('mousewheel', function(ev) {
        ev.preventDefault()
        ev.stopPropagation()
        const pos = _getPosition(ev)
        const wheelDelta = ev.wheelDelta
        vm.changeScale(pos, vm.scaleTime + (wheelDelta / 1000))
        vm.layer.forceRedrawing()
      })
    },
    scale() {
      this.canvasDom.width = this.widths / this.scaleTime
      this.canvasDom.height = this.heights / this.scaleTime
    },
    changeScale(pos, changeTo) {
      changeTo = this.floatFixed(changeTo, 6)
      if (changeTo <= this.minScale) {
        changeTo = this.minScale
      }
      this.oldScaleTime = this.scaleTime
      this.scaleTime = changeTo
      // 确定像素点
      const distanceX = pos.x - this.originPointer.x
      const distanceY = pos.y - this.originPointer.y
      const transX =
				pos.x -
				this.floatFixed((distanceX / this.oldScaleTime) * this.scaleTime, 6)
      const transY =
				pos.y -
				this.floatFixed((distanceY / this.oldScaleTime) * this.scaleTime, 6)
      this.originPointer = { x: transX, y: transY }
      this.needReTransform = true
    },

    translateMove(pos) {
      const transX = pos.x - this.oldPos.x
      const transY = pos.y - this.oldPos.y
      this.originPointer.x += transX
      this.originPointer.y += transY
      this.oldPos = pos
      this.needReTransform = true
    },

    transfiguration(ctx) {
      if (this.needReTransform) {
        ctx.restore()
        this.scale()
        const nx = this.floatFixed(
          (this.originPointer.x * this.times) / this.scaleTime,
          6
        )
        const ny = this.floatFixed(
          (this.originPointer.y * this.times) / this.scaleTime,
          6
        )
        this.translate(ctx, nx, ny)
        this.needReTransform = false
        ctx.save()
      }
    },

    floatFixed(data, num) {
      const pos = Math.pow(10, num)
      return Math.floor(data * pos) / pos
    },

    recovery() {
      this.originPointer = { x: 0, y: 0 }
      this.scaleTime = 1
      this.oldScaleTime = 1
      this.oldPos = null
      this.needReTransform = true
    },

    suitable() {
      this.recovery()
      if (
        this.actualWidthOfDag > this.widths ||
				this.actualHeightOfDag > this.heights
      ) {
        const Timex = this.floatFixed(this.widths / this.actualWidthOfDag, 10)
        const Timey = this.floatFixed(this.heights / this.actualHeightOfDag, 10)
        let finalTime = ''
        let isXBigger = true
        const middle = {
          x: this.widths / this.times / 2,
          y: this.heights / this.times / 2
        }
        if (Timex < Timey) {
          finalTime = Timex
        } else {
          finalTime = Timey
          isXBigger = false
        }
        if (isXBigger) middle.x = 0
        else middle.y = 0
        this.changeScale(middle, finalTime)
      }
      this.layer.forceRedrawing()
    },

    dagPlus() {
      const middle = { x: this.widths / this.times / 2, y: this.heights / this.times / 2 }
      this.changeScale(middle, this.scaleTime + 0.2)
      this.layer.forceRedrawing()
    },

    dagMinus() {
      const middle = { x: this.widths / this.times / 2, y: this.heights / this.times / 2 }
      this.changeScale(middle, this.scaleTime - 0.2)
      this.layer.forceRedrawing()
    },

    sortBy(list) {
      const final = [...JSON.parse(JSON.stringify(this.variable)), ...JSON.parse(JSON.stringify(this.otherVariable))]
      for (let i = 0; i < final.length; i++) {
        const index = list.indexOf(final[i])
        if (index < 0) {
          final.splice(i, 1)
          i--
        }
      }
      return final
    },

    mutationDivContainer() {
      const vm = this
      const dom = this.canvasDom.parentElement
      const originSty = getComputedStyle(dom)
      const ow = originSty.width
      const oh = originSty.height
      let change = false
      const listener = function() {
        setTimeout(() => {
          const newSty = getComputedStyle(dom)
          if (change) return
          if (newSty.width !== ow || newSty.height !== oh) {
            vm.canvasResize()
            change = true
          } else {
            listener()
          }
        }, 100)
      }
      listener()
    }
  }
}
</script>

<style lang="scss">
.correlation-container {
	width: 100%;
	position: relative;
	.correlation-title {
		width: 100%;
		margin-bottom: 15px;
		.title-selection {
			margin-left: 10px;
		}
		.title-filters {
			margin-left: 10px;
			cursor: pointer;
			color: #494ece;
		}
		.title-filters-dialog {
			position: absolute;
			top: 40px;
			left: 260px;
      max-width: 68%;
      max-height: 70%;
      overflow: hidden;
			background-color: #fff;
			box-shadow: 0px 4px 12px 4px rgba(83,76,119,0.26);
		}
		.correlation-showing-text {
			margin-right: 10%;
		}
		.title-filters-dialog {
			padding: 20px;
			z-index: 1;
			.title-filter-title {
				color: #7f7d8e;
				font-size: 17px;
				margin-bottom: 23px;
				.selection-close {
					cursor: pointer;
				}
      }
      .el-transfer-panel__list {
        display: flex;
        flex-direction: column;
      }
		}
	}
	.correlation-relationship {
		width: 100%;
		height: calc(100% - 60px);
		.relationship-picture {
      min-width: calc(100% - 70px);
			height: 100%;
      margin-right: 15px;
      .suitable-button {
        position: absolute;
        bottom: 0px;
        left: 15px;
        .sutiable-button-item {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #F8F8FA;
          margin-bottom: 12px;
          color: #BBBBC8;
          &:hover {
            background-color: #494ece;
            color: #fff;
          }
        }
      }
		}
		.range-axis {
			height: 100%;
			padding-left: 15px;
			position: relative;
			color: #bbbbc8;
      font-size: 14px;
      min-width: 60px;
			&::before {
				position: absolute;
				top: 9px;
				left: 0px;
				content: ' ';
				width: 15px;
				height: calc(100% - 15px);
				background-image: linear-gradient(
					#3135a6,
					#5b96fb,
					#bfebff,
					#e8f6ff,
					#ff81d9,
					#ec4b56,
					#c70861
				);
			}
		}
	}
}
</style>
