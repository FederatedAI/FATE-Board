<template>
<FTabs class="container" :tabs="tabs" :value="'tab1'"/>
</template>

<script lang="ts" setup>
import { FSelection } from '../lib/main';

const tabs = [{
  name: 'tab1',
  label: 'tab1',
  component: {
    id: 'selection1',
    tag: FSelection,
    prop: {
      name: 'selection1',
      value: ['v1'],
      multiple: 2,
      options: [{
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
    }
  }
}, {
  name: 'tab2',
  label: 'tab2',
  component: () => import('./FTable.vue')
}]
</script>

<style lang="scss" scoped>

</style>
