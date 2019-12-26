<template>
  <canvas :id="id" style="display:block" />
</template>

<script>
import Layer from '@/utils/dag/core'
import { dag as Dag, modelClick } from '@/utils/dag/components/dag'
import { initImage } from '@/utils/dag/basePath/icon'
import { progress as Progress } from '@/utils/dag/components/progress'
import { TIMES } from '@/utils/dag/const.js'

import Tree from '@/utils/dag/components/dagInfo'

export default {
  name: 'Tree',
  props: {
    id: {
      type: String,
      default: 'canvas'
    },
    width: {
      type: Number,
      default: 700
    },
    height: {
      type: Number,
      default: 1000
    },
    msg: {
      type: Object,
      default: () => {}
    },
    thumbnail: {
      type: Boolean,
      default: false
    },
    purePic: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      widths: this.width,
      heights: this.height,
      canvas: null,
      progresses: [],

      dagW: this.thumbnail ? 80 * TIMES : 150 * TIMES,
      dagH: 35 * TIMES,
      dag: null,

      font: this.thumbnail ? 10 * TIMES : 16 * TIMES,
      minFont: 4 * TIMES,

      betAccrossModel: 35 * TIMES, // 两个层级之间的距离
      betInternelRow: 15 * TIMES, // 同一行两个模块Y轴间的距离
      betRowModel: 25 * TIMES, // 同一层级两个模块之间的X轴距离
      betLineDistance: 15 * TIMES, // 折线离模块的距离
      toTop: 0,

      widthBet: 16 * TIMES,
      heightBet: 8 * TIMES,

      actualWidthOfDag: 0,
      actualHeightOfDag: 0,

      scaleTime: 1,
      oldScaleTime: 1,
      maxScale: 5,
      minScale: 0.2,

      originPointer: { x: 0, y: 0 },
      needReTransform: false,

      oldPos: null,

      message: JSON.parse(JSON.stringify(this.msg)),
      tree: null,
      images: null,

      mouseHold: false,
      mouseHolded: false,
      minWidthOfCanvas: 300,
      minHiehgtOfCanvas: 200
    }
  },

  watch: {
    msg: {
      handler(newVal, oldVal) {
        if (!this.message) {
          this.message = JSON.parse(JSON.stringify(this.msg))
        } else {
          this.message = JSON.parse(JSON.stringify(this.msg))
          this.initMsg()
          const layer = this.dag.getLayer()
          for (const key in layer) {
            if (key === 'length' || key.indexOf('line:') >= 0) {
              continue
            }
            for (const val of this.message.component_list) {
              if (val.component_name === key) {
                if (val.status !== layer[key].instance.state.type && val.status + '_choose' !== layer[key].instance.state.type && !val.disable) {
                  if (layer[key].instance.state.type.indexOf('running') >= 0) {
                    const complete = val.status + (layer[key].instance.state.type.indexOf('_choose') >= 0 ? '_choose' : '')
                    const img = val.status === 'success' ? this.images['complete'] : this.images['error']
                    layer[key].instance.setStates({ complete, icon: img })
                  } else {
                    const complete = val.status + (layer[key].instance.state.type.indexOf('_choose') >= 0 ? '_choose' : '')
                    const img = val.status === 'success' ? this.images['complete'] : val.status === 'error' ? this.images['error'] : null
                    layer[key].instance.addAnimation(Progress.animations.startLoading.name, Progress.animations.startLoading.callback)
                    layer[key].instance.setStates({ time: val.time, complete, icon: img })
                  }
                }
                break
              }
            }
          }
        }
      },
      deep: true
    }
  },

  beforeMount() {
    this.initMsg()
  },

  mounted() {
    this.initCanvas()
    this.calculcateSize()
    this.initDefaultSize()
    this.initImages()
    this.resizeWindow()
  },
  methods: {
    calculcateSize() {
      const parentEl = document.getElementById(this.id).parentElement
      if (!parentEl) {
        throw new Error('no parentElement')
      }
      const style = getComputedStyle(parentEl)
      let originalWidth = parseInt(style.width)
      let originalHeight = parseInt(style.height)
      originalWidth = originalWidth > this.minWidthOfCanvas ? originalWidth : this.minWidthOfCanvas
      originalHeight = originalHeight > this.minHiehgtOfCanvas ? originalHeight : this.minHiehgtOfCanvas
      this.widths = originalWidth * TIMES
      this.heights = originalHeight * TIMES
      document
        .getElementById(this.id)
        .setAttribute(
          'style',
          'width:' + this.widths / TIMES + 'px;height:' + this.heights / TIMES + 'px;overflow:hidden;'
        )

      this.canvas.setAttribute('width', this.widths)
      this.canvas.setAttribute('height', this.heights)
    },

    resizeWindow() {
      const that = this
      window.addEventListener('resize', function() {
        try {
          that.needReTransform = true
          that.initCanvas()
          that.calculcateSize()
          that.initDefaultSize()
          that.initImages()
        } catch (e) {
          return false
        }
      })
    },

    initMsg() {
      const dis = this.message.component_need_run
      for (const key in dis) {
        const li = this.message.component_list
        for (const val of li) {
          if (val.component_name === key) {
            val.disable = !dis[key]
            break
          }
        }
      }

      const model = this.message.component_module
      for (const key in model) {
        const li = this.message.component_list
        for (const val of li) {
          if (val.component_name === key) {
            val.model = model[key]
            break
          }
        }
      }

      const list = this.message.component_list
      for (const val of list) {
        val.time = this._excahngeTime(val.time)
        if (val.status === 'failed') {
          val.status = 'error'
        } else if (!val.status) {
          val.status = 'unrun'
        }
      }

      const final = this.message.component_list
      for (let i = 0; i < final.length; i++) {
        final[i].dataIndex = i
      }
    },

    _excahngeTime(ms) {
      if (!ms) {
        return '00:00:00'
      }
      ms = new Date().getTime() - ms
      const t = Math.round(ms / 1000)
      let s = t % 60
      const tm = (t - s) / 60
      let m = tm % 60
      let h = (tm - m) / 60
      if (s < 10) s = '0' + s
      if (m < 10) m = '0' + m
      if (h < 10) h = '0' + h
      return '' + h + ':' + m + ':' + s
    },

    initCanvas() {
      this.canvas = document.getElementById(this.id)
    },

    initDefaultSize() {
      const vm = this
      if (this.thumbnail) {
        this.heightBet = 6 * TIMES
        this.widthBet = 8 * TIMES

        this.betAccrossModel = 25 * TIMES
        this.betInternelRow = 10 * TIMES
        this.betRowModel = 15 * TIMES
        this.betLineDistance = 8 * TIMES
        this.toTop = this.betAccrossModel
      } else {
        this.toTop = this.betAccrossModel
      }
      if (this.purePic) {
        this.toTop = this.betAccrossModel
      }
      this.tree = new Tree(this.message)
      const msg = this.message
      let longestStr = ''
      for (const val of msg.component_list) {
        if (val.component_name.length > longestStr.length) {
          longestStr = val.component_name
        }
      }

      // According to length of string ,we will get width and height of longest dag part
      const ctx = this.canvas.getContext('2d')
      const fontSize = this.font
      ctx.font = this.font + 'px Arial'
      const w = Math.ceil(ctx.measureText(longestStr).width)
      this.dagW = (w + this.widthBet) < this.dagW ? this.dagW : w + this.widthBet
      this.dagH = fontSize + this.heightBet

      function checkfinalPos() {
        const change = vm.tree.calculatePosition(
          vm.canvas,
          vm.dagW,
          vm.dagH,
          vm.betAccrossModel,
          vm.betInternelRow,
          vm.betRowModel,
          vm.toTop
        )
        vm.actualWidthOfDag = change.width
        vm.actualHeightOfDag = change.height
        if (vm.actualHeightOfDag + vm.toTop * 2 < vm.canvas.height) {
          vm.toTop = (vm.canvas.height - vm.actualHeightOfDag) / 2
          checkfinalPos()
        }
      }
      checkfinalPos()
    },

    initImages() {
      const _this = this
      initImage(
        [
          {
            name: 'complete',
            url: require('@/utils/dag/icon/complete.svg')
          },
          {
            name: 'disable_complete',
            url: require('@/utils/dag/icon/disable_complete.svg')
          },
          {
            name: 'error',
            url: require('@/utils/dag/icon/error.svg')
          },
          {
            name: 'disable_error',
            url: require('@/utils/dag/icon/disable_error.svg')
          }
        ],
        function(complete) {
          _this.images = complete
        }
      ).then(res => {
        _this.dagDrawing()
      })
    },

    dagDrawing() {
      const vm = this
      if (!this.dag) {
        this.dag = new Layer({
          canvas: this.canvas,
          state: {
            width: this.dagW,
            fontSize: this.font,
            betAR: this.betAccrossModel,
            betIR: this.betInternelRow,
            betLM: this.betLineDistance,
            tree: this.tree,
            imgs: this.images
          },
          path: Dag.path,
          clear: function(ctx, state) {
            ctx.clearRect(0, 0, vm.widths + vm.actualWidthOfDag, vm.heights + vm.actualHeightOfDag)
          },
          transfiguration: this.transfiguration
        })
        this.addEvents(this.canvas, this.dag)
        modelClick(this.dag, function(name) {
          const progress = this
          for (const index of vm.tree.getLevel()) {
            for (const val of index) {
              if (val.name === name) {
                progress.addEvent(
                  'click',
                  function(meta, check, pos, state) {
                    if (check) {
                      if (vm.$listeners['click-progress']) {
                        vm.$emit('click-progress', meta)
                      }
                    }
                  },
                  { name: val.name, dataIndex: val.dataIndex, model: val.model, disable: val.disable }
                )
              }
            }
          }
        })
      } else {
        this.dag.setStates({
          width: this.dagW,
          fontSize: this.font,
          betAR: this.betAccrossModel,
          betIR: this.betInternelRow,
          betLM: this.betLineDistance,
          tree: this.tree,
          imgs: this.images
        })
        this.dag.forceRedrawing()
      }
    },

    addEvents(canvas, layer) {
      const vm = this
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
      const common = function(ev, type) {
        const pos = _getPosition(ev)
        // pos.x = (pos.x - vm.changeX * vm.scaleTime) / vm.scaleTime
        // pos.y = (pos.y - vm.changeY * vm.scaleTime) / vm.scaleTime
        pos.x = vm.floatFixed((pos.x - vm.originPointer.x) * TIMES / vm.scaleTime, 6)
        pos.y = vm.floatFixed((pos.y - vm.originPointer.y) * TIMES / vm.scaleTime, 6)
        layer.emit(type, pos)
        layer.redrawing()
      }

      canvas.addEventListener('click', function(ev) {
        if (!vm.mouseHolded) {
          if (!vm.purePic) {
            common(ev, 'click')
          }
        }
        vm.mouseHolded = false
      })
      canvas.addEventListener('mousedown', function(ev) {
        vm.mouseHold = true
      })
      canvas.addEventListener('mouseup', function(ev) {
        vm.mouseHold = false
        vm.pos = null
      })
      canvas.addEventListener('mouseover', function() {
        vm.mouseHold = false
        vm.mouseHolded = false
      })
      canvas.addEventListener('mousemove', function(ev) {
        const pos = _getPosition(ev)
        if (!vm.pos) {
          vm.pos = pos
        } else {
          if (pos.x !== vm.pos.x || pos.y !== vm.pos.y) {
            vm.oldPos = vm.pos
            vm.pos = pos
            if (vm.mouseHold) {
              vm.mouseHolded = true
              vm.translateMove(pos)
              vm.dag.forceRedrawing()
            } else {
              common(ev, 'mousemove')
            }
          }
        }
      })
      canvas.addEventListener('mousewheel', function(ev) {
        // const pos = _getPosition(ev)
        ev.preventDefault()
        ev.stopPropagation()
        const pos = _getPosition(ev)
        const wheelDelta = ev.wheelDelta
        vm.changeScale(pos, vm.scaleTime + (wheelDelta / 5000))
        vm.dag.forceRedrawing()
      })
    },

    translate(ctx, x, y) {
      ctx.translate(x, y)
    },

    scale() {
      // 放大相关像素内容
      this.canvas.width = this.widths / this.scaleTime
      this.canvas.height = this.heights / this.scaleTime
    },

    turnToScaleBefore(pos, scale) {
      // 当前像素点在一倍分辨路情况下的对照点
      return { x: pos.x * scale, y: pos.y * scale }
    },

    turnToScaleAfter(pos, scale) {
      // 当前像素点在scale倍分辨路的情况对照点
      return { x: pos.x / scale, y: pos.y / scale }
    },

    changeScale(pos, changeTo) {
      changeTo = this.floatFixed(changeTo, 6)
      if (changeTo >= this.maxScale) {
        changeTo = this.maxScale
      }
      if (changeTo <= this.minScale) {
        changeTo = this.minScale
      }
      this.oldScaleTime = this.scaleTime
      this.scaleTime = changeTo
      // 确定像素点
      const distanceX = pos.x - this.originPointer.x
      const distanceY = pos.y - this.originPointer.y
      const transX = pos.x - this.floatFixed(distanceX / this.oldScaleTime * this.scaleTime, 6)
      const transY = pos.y - this.floatFixed(distanceY / this.oldScaleTime * this.scaleTime, 6)
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
        const nx = this.floatFixed(this.originPointer.x * TIMES / this.scaleTime, 6)
        const ny = this.floatFixed(this.originPointer.y * TIMES / this.scaleTime, 6)
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
      if (this.actualWidthOfDag > this.widths || this.actualHeightOfDag > this.heights) {
        const Timex = this.floatFixed(this.widths / this.actualWidthOfDag, 10)
        const Timey = this.floatFixed(this.heights / this.actualHeightOfDag, 10)
        let finalTime = ''
        let isXBigger = true
        const middle = { x: this.widths / TIMES / 2, y: this.heights / TIMES / 2 }
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
      this.dag.forceRedrawing()
    },

    dagPlus() {
      const middle = { x: this.widths / TIMES / 2, y: this.heights / TIMES / 2 }
      this.changeScale(middle, this.scaleTime + 0.2)
      this.dag.forceRedrawing()
    },

    dagMinus() {
      const middle = { x: this.widths / TIMES / 2, y: this.heights / TIMES / 2 }
      this.changeScale(middle, this.scaleTime - 0.2)
      this.dag.forceRedrawing()
    }
  }
}
</script>

<style lang="" scoped>
</style>
