<template>
  <div class="app_container">
    <FTree :data="demo" />
  </div>
</template>

<script lang="ts" setup>
import FTree from '../lib/Tree/Tree.vue';

const nodeInfo = (key: string, children?: any[]) => {
  return {
    name: key,
    value: key,
    metah: {
      test: `${key} meta`
    },
    children
  }
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
