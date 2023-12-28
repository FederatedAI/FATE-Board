<template>
  <section class="f-tabs-container">
    <el-tabs v-model="active">
      <el-tab-pane v-for="(item, key) in data" :label="key" :name="key" :key="key">
        <EachChart :data="item" :title="key" class="f-chart-content"></EachChart>
      </el-tab-pane>
    </el-tabs>
  </section>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import EachChart from './EachChart.vue';

const props = defineProps(['data'])

const active = ref(Object.keys(props.data)?.[0] || '')
watch(
  () => props.data,
  () => {
    active.value = Object.keys(props.data)?.[0] || ''
  }
)
</script>

<style lang="scss" scoped>
.f-tab-chart {
  width: 100%;
}

.f-chart-content {
    @keyframes fadeIn {
      0% { opacity: 0 }
      100% { opacity: 1 }
    }
    animation: 1s ease-in 0s fadeIn;
  }
</style>
