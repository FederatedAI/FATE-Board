<template>
  <div class="app_container">
    <HeatMapVue ref="map" :x="demox" :y="demox" :data="data"></HeatMapVue>
  </div>
  <div class="btn" @click="display">display</div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import HeatMapVue from '../lib/HeatMap/HeatMap.vue';

const length = 100

const axis = () => {
  const row = []
  for (let i = 0; i < length; i ++) {
    row.push(`x${i}`)
  }
  return row
}
const demox = axis()

const data = reactive<any>([])
for (let i = 0; i < demox.length; i++) {
  const row = []
  for (let j = 0; j < i + 1; j++) {
    if (j === i) row.unshift(10)
    else row.unshift(Number((Math.random() * 10).toFixed(6)))
  }
  data.unshift(row)
}

const map = ref()
function display() {
  map.value.displayLabel()
}
</script>

<style lang="scss" scoped>
.app_container {
  position: relative;
  width: 500px;
  height: 300px;
  font: 14px '微软雅黑';
  overflow: hidden;
}

.btn {
  z-index: 1000;
  position: absolute;
}
</style>
