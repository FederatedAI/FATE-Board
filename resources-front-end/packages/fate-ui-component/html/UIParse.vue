<template>
  <div class="container">
    <component :is="componentInstance"></component>
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref } from 'vue';
import { FSelection, FTable, parse } from '../lib/main';

const options = [{
  label: 'l1',
  value: 1,
}, {
  label: 'l2',
  value: 2,
}, {
  label: 'l3',
  value: 3,
}, {
  label: 'l4',
  value: 4,
}]

const tableData = [
  { variable: 'v1' },
  { variable: 'v2' },
  { variable: 'v3' },
  { variable: 'v4' },
]

const section: any = {
  id: 'Container',
  tag: 'section',
  children: [{
    id: 'Selection',
    tag: FSelection,
    prop: {
      modelValue: '',
      options,
      class: 'ui-test'
    },
    event: {
      change(value: any, plot: any) {
        plot.set('modelValue', value)
      }
    }
  }, {
    id: 'Table',
    tag: FTable,
    prop: {
      header: [{
        label: 'variable',
        prop: 'variable'
      }, {
        label: 'data',
        prop: 'data'
      }],
      index: true,
      data: {
        request: (value?: number) => {
          if (!value) {
            return tableData
          } else {
            return [tableData[value - 1]]
          }
        },
        parameter: ['Selection.modelValue']
      }
    }
  }]
}

let VNode: any
const componentInstance = ref(undefined)
const component = () => {
  if (VNode) {
    VNode = undefined
  } 
  componentInstance.value = defineAsyncComponent(async () => {
    VNode = await parse(section, undefined, <any>{ replace: true })
    return VNode.toVue()
  })
}

onMounted(() => {
  component();
})
</script>

<style lang="scss" scoped>
.container {
  min-width: 500px;
  min-height: 300px;
}
</style>
