<template>
  <div class="container">
    <component :is="componentInstance"></component>
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref, watch } from 'vue';
import { parse } from '../lib/main';

const section: any = ref({
  id: 'Section',
  tag: 'div',
  prop: {
    class: 'f-text'
  },
  children: [
    'No Data'
  ]
})

let VNode: any
const componentInstance = ref(undefined)
const component = () => {
  if (VNode) {
    VNode = undefined
  } 
  componentInstance.value = defineAsyncComponent(async () => {
    VNode = await parse(section.value)
    return VNode.toVue()
  })
}

watch(
  () => section.value,
  () => component(),
  { deep: true }
)

onMounted(() => {
  component();

  setTimeout(() => {
    section.value.children[0] = 'Data For None'
  }, 10000)

  setTimeout(() => {
    section.value = {
      id: 'Section2',
      tag: 'section',
      prop: {
        class: 'f-text-section'
      },
      children: [
        'No Data for section 2'
      ]
    }
  }, 20000)
})
</script>

<style lang="scss" scoped>
.container {
  min-width: 500px;
  min-height: 300px;
}
</style>
