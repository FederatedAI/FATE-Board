<template>
  <!-- <div style="width:800px; height:500px; border:1px solid #000">
    <canvas id="canvas" />
    <button @click="showText()">showing</button>
    <button @click="hideText()">hiding</button>
  </div> -->
  <div style="width:100%;height:100%;">
    <div style="width:50%; height:50%; border:1px solid #000;">
      <correlation ref="correlation" :variable="features" :other-variable="otherFeatures" :correlation="correlation" :max="max" :min="min"/>
      <!-- <flow-diagram :dag-info="dagInfo" :thumbnail="true" @choose="clickProgress"/> -->
    </div>
    <div>{{ afterClick }}</div>
    <button @click="changeDagInfo">changeDagInfo</button>
    <button @click="changePos">changePos</button>
    <button @click="changeFeature">changeFestures</button>
    <button @click="changeMax">changeMax</button>
    <button @click="changeMin">changeMin</button>
    <button @click="showText">showContent</button>
  </div>
</template>

<script>
// import Layer from './canvas/Core'
// import flowDiagram from './canvas/extra/flowDiagram'
// import panel from './canvas/extra/panel'
// import square from './canvas/extra/square'
import correlation from './pearsonDiagram'
export default {
  name: 'Testing',
  components: {
    correlation
  },
  data() {
    return {
      component: null,
      canvas: null,
      afterClick: {},
      features: [],
      otherFeatures: [],
      correlation: [],
      max: 1,
      min: -1
    }
  },

  created() {
    this.initingData()
  },

  methods: {
    changeStatus(num = 10) {
      const toPro = this.component.progress + num
      this.component.emit('progress', toPro)
    },
    setTime(num = 1) {
      const toTime = '00:00:02'
      this.component.emit('setTime', toTime)
    },
    showText() {
      this.$refs.correlation.showText()
    },
    hideText() {
      this.$refs.correlation.hideText()
    },
    changeDagInfo() {
      this.dagInfo.component_list[2].status = 'success'
      this.dagInfo.component_list[4].status = 'fail'
      this.dagInfo.component_list[5].status = 'running'
      this.dagInfo.component_list[5].time = 50000
    },
    clickProgress(props) {
      this.afterClick = props
    },
    changePos() {
      const features = JSON.parse(JSON.stringify(this.features))
      const middle = features[4]
      features[4] = features[3]
      features[3] = middle
      this.features = features
    },
    changeFeature() {
      this.features.splice(1, 1)
    },
    addCorrelation() {
      this.correlation = [[0.1234, 0.23461, 0.234512, 0.62744, -0.41235, 0.1234],
        [0.81368, 0.312352, 0.526634, 0.75872, -0.71235, 0.23456],
        [0.634534, 0.452345, 0.1523, 0.52346, -0.91235, 0.25879523],
        [0.972345, 0.234563, 0.234613, 0.27444, -0.21235, 0.52346],
        [0.123435, 0.523456, -0.152355, 0.234672, -0.54123, -0.123],
        [0.5234, -0.21452, 0.5345, -0.5342, 0.223, 0.352567]]
    },
    initingData() {
      const feat = []
      for (let i = 0; i < 10; i++) {
        feat.push('x' + (i + 1))
      }
      this.features = feat
      const feat2 = []
      for (let i = 0; i < 10; i++) {
        feat2.push('host' + (i + 1))
      }
      this.otherFeatures = feat2
      const final = []
      for (let i = 0; i < this.features.length; i++) {
        for (let j = 0; j < this.features.length; j++) {
          (function() {
            const indexI = i
            const indexJ = j
            final[indexI] = final[indexI] || []
            final[indexI][indexJ] = Math.random() * 2 - 1
          })()
        }
      }
      this.correlation = final
    },
    changeMax() {
      this.max = 0.5
    },
    changeMin() {
      this.min = -0.5
    }
  }
}
</script>

<style lang="" scoped>

</style>
