<template>
  <canvas id="canvas" />
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
