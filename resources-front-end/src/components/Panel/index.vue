<template>
  <div>
    <canvas :id="id" style="display:block" />
  </div>
</template>

<script>
import Layer from '@/utils/dag/core/index'
import { panel as Panel } from '@/utils/dag/components/panel'

export default {
  name: 'Panel',

  props: {
    id: {
      type: String,
      default: 'panelCanvas'
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
      default: () => {
        return {
          progress: 0,
          time: 0
        }
      }
    }
  },

  data() {
    return {
      widths: this.width,
      heights: this.height,
      canvas: null,
      layer: null,
      message: {},
      panelX: 0
    }
  },

  watch: {
    'msg.progress': {
      handler: function() {
        this.message = JSON.parse(JSON.stringify(this.msg))
        this.setProgress(this.message.progress)
      },
      deep: true
    },
    'msg.time': {
      handler: function() {
        if (this.msg.time >= this.message.time) {
          this.message.time = JSON.parse(JSON.stringify(this.msg.time))
          this.setTime(this.message.time)
        }
      },
      deep: true
    }
  },

  beforeMount() {
    this.initMsg()
  },

  mounted() {
    const vm = this
    this.calculcateSize()
    this.drawing()
    window.addEventListener('resize', function() {
      vm.calculcateSize()
      vm.drawing()
    })
  },

  methods: {
    initMsg() {
      this.message = JSON.parse(JSON.stringify(this.msg))
    },

    calculcateSize() {
      this.canvas = document.getElementById(this.id)
      const style = getComputedStyle(this.canvas.parentElement)
      this.widths = parseInt(style.width.replace('px', ''))
      this.heights = parseInt(style.height.replace('px', ''))
      document
        .getElementById(this.id)
        .setAttribute(
          'style',
          'width:' + this.widths + 'px;height:' + this.heights + 'px;'
        )
      this.canvas.setAttribute('width', this.widths)
      this.canvas.setAttribute('height', this.heights)
      this.panelX = (this.widths * 0.3) / 2
    },

    _excahngeTime(ms) {
      if (!ms) {
        return '00:00:00'
      }
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

    drawing() {
      const can = this.canvas
      if (!this.layer) {
        const layer = new Layer({
          canvas: can,
          state: {
            width: this.widths,
            progress: this.message.progress,
            time: this._excahngeTime(this.message.time),
            content: 'elapsed',
            x: this.panelX
          },
          path: Panel.path,
          // animations: Panel.animations,
          events: Panel.events,
          clear: Panel.clear
        })
        this.layer = layer
      } else {
        this.layer.setStates({
          width: this.widths,
          progress: this.message.progress,
          time: this._excahngeTime(this.message.time),
          content: 'elapsed',
          x: this.panelX
        })
        this.layer.forceRedrawing()
      }
    },

    setProgress(progress) {
      this.layer.emit('loading', { x: 0, y: 0 }, progress)
    },

    setTime(time) {
      this.layer.setStates({ time: this._excahngeTime(time) })
      this.layer.redrawing()
    }
  }
}
</script>

<style scoped lang="scss">
</style>
