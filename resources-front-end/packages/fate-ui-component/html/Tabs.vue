<template>
  <section>
    <section class="container">
      <FTabs :tabs="tabs" :value="'tab1'"/>
    </section>
    <section class="container">
      <FTabsBySelection label="selection-index" :options="options">
        <template #beforeHeader>
          <article>Before Title</article>
        </template>
        <template #beforeTab>
          <article>before tabs</article>
        </template>
        <template #afterTab>
          <article>before tabs</article>
        </template>
        <template #afterHeader>
          <article>After Title</article>
        </template>
        <template #default="{ value }">
          <article>
            value: {{ String(value) }}
          </article>
        </template>
      </FTabsBySelection>
    </section>
  </section>
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
  component: () => import('./Table.vue')
}]

const options = [{
  label: 'label1',
  value: 1
}, {
  label: 'label2',
  value: 2
}]
</script>

<style lang="scss" scoped>
.container {
  width: 800px;
  height: 600px;
}
</style>
