<template>
  <section class="demo-section">
    <TabsForChart :options="demo"></TabsForChart>
  </section>
</template>

<script lang="ts" setup>
import TabsForChart from '../lib/components/TabsChart/SubTabs.vue';
const demo = (() => {
  const count = Math.ceil(Math.random() * 200)
  const list: any[] = []
  for (let i = 0; i < count; i++) {
    const weight = Math.ceil(Math.random() * 40)
    list.push({
      label: `weight ${weight}`,
      weight: weight,
      value: i
    })
  }
  return list
})()
</script>

<style lang="scss" scoped>
.demo-section {
  width: 300px;
  height: 90px;
  padding-bottom: 6px;
}
</style>
