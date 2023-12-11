<template>
  <FSelection 
    :name="'selection1'"
    :model-value="['v4']"
    :options="options"
    :multiple="2"
    :placeholder="'choose please'"
    :label="'selection1'"
  />

  <FSelectionChart :options="options" class="select-chart-container"/>
</template>

<script lang="ts" setup>
const options = [{
  label: 'l1',
  weight: 3,
  value: 'v1',
}, {
  label: 'l2',
  weight: 5,
  value: 'v2',
}, {
  label: 'l3',
  weight: 6,
  value: 'v3',
}, {
  label: 'l4',
  weight: 19,
  value: 'v4',
  disabled: true
}]
</script>

<style lang="scss" scoped>
.select-chart-container {
  height: 60px;
}
</style>
