<template>
  <canvas id="canvas" />
</template>

<script>
import panel from '../canvas/extra/panel'
import Layer from '../canvas/Core'
export default {
  name: 'Panel',
  props: {
    progress: {
      type: Number,
      default: 0
    },
    time: {
      type: Number | String,
      default: '00:00:00'
    }
  },

  data() {
    return {
      component: null,
      canvas: null
    }
  },

  watch: {
    progress(newVal, oldVal) {
      this.changeStatus(newVal)
    },
    time(newVal, oldVal) {
      this.setTime(newVal)
    }
  },

  mounted() {
    this.initing()
  },

  methods: {
    initing() {
      const vm = this
      const can = document.getElementById('canvas')
      this.canvas = new Layer.CanvasUtil(
        can,
        {
          click: false,
          mousemove: false,
          mousedown: false,
          mouseup: false
        },
        () => {
          vm.getInstance(can)
          vm.component.drawing()
          return vm.component
        }
      )
    },
    getInstance(can) {
      this.component = panel.drawPanel({
        canvas: document.getElementById('canvas'),
        props: {
          width: can.width,
          progress: this.progress,
          time: this.time,
          content: 'elapsed',
          x: (can.width * 0.3) / 2
        },
        clear: panel.clear,
        events: panel.events
      })
    },
    changeStatus(num) {
      if (num > this.component.progress) {
        this.component.emit('progress', num)
      }
    },
    setTime(time) {
      this.component.emit('setTime', time)
    }
  }
}
</script>

<style lang="" scoped>
</style>
