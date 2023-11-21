<template>
  <div class="app_container">
    <FTree :data="demo" :color="basicColor[cursor % basicColor.length]"/>
  </div>
  <button @click="change">change</button>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import FTree from '../lib/Tree/Tree.vue';

const nodeInfo = (key: string, children?: any[]) => {
  return {
    name: key,
    value: key,
    meta: {
      test: `${key} meta`
    },
    children
  }
}

const basicColor = [
  'rgba(64,158,255,1)',
  'rgba(103,194,58,1)',
  'rgba(230,162,60,1)',
  'rgba(245,108,108,1)',
  'rgba(144,147,153,1)',
  'rgba(255,161,64,1)',
  'rgba(149,58,194,1)',
  'rgba(60,128,230,1)',
  'rgba(108,245,245,1)',
]
const cursor = ref(0)

function change () {
  cursor.value++
}

const demo = {
  name: 'root',
  value: 'rootNode',
  meta: {
    test: 'root meta'
  },
  children: [
    nodeInfo('n1', [
      nodeInfo('n1-1'),
      nodeInfo('n1-2'),
      nodeInfo('n1-3'),
      nodeInfo('n1-4', [
        nodeInfo('n1-4-1'),
        nodeInfo('n1-4-2')
      ])
    ]),
    nodeInfo('n2', [
      nodeInfo('n2-1'),
      nodeInfo('n2-2'),
      nodeInfo('n2-3'),
      nodeInfo('n2-4', [
        nodeInfo('n2-4-1'),
        nodeInfo('n2-4-2')
      ])
    ])
  ]
};

</script>

<style lang="scss" scoped>
.app_container {
  position: relative;
  min-width: 1000px;
  min-height: 500px;
  font: 14px '微软雅黑';
  overflow: hidden;
}
</style>
