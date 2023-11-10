<template>
  <div class="app_container">
    <GaugeVue ref="map" :precentage="precentage"></GaugeVue>
  </div>
  
  <div class="btn" @click="change">change</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import GaugeVue from '../lib/Gauge/Gauge.vue';
const precentage = ref(10)
const change = () => {
  precentage.value = precentage.value + 10
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
