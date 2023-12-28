<template>
  <FBreadCrumb :crumbs="crumbs"></FBreadCrumb>
</template>

<script lang="ts" setup>
import { ChatRound, Connection } from '@element-plus/icons-vue';

const crumbs = [{
  label: 'bc1',
  icon: Connection,
  href: { path: '/' }
}, {
  label: 'bc2',
  icon: ChatRound,
  href: { path: '/' }
}, {
  label: 'b3',
  href: { path: '/' }
}]
</script>

<style lang="scss" scoped>

</style>
