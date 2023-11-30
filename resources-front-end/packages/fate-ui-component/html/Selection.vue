<template>
  <FSelection 
    :name="'selection1'"
    :model-value="['v4']"
    :options="options"
    :multiple="2"
    :placeholder="'choose please'"
    :label="'selection1'"
  />
</template>

<script lang="ts" setup>
const options = [{
  label: 'l1',
  value: 'v1',
}, {
  label: 'l2',
  value: 'v2',
}, {
  label: 'l3',
  value: 'v3',
}, {
  label: 'l4',
  value: 'v4',
  disabled: true
}]
</script>

<style lang="scss" scoped>

</style>
