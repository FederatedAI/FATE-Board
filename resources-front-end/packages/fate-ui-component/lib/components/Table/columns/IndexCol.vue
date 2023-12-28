<template>
  <ElTableColumn :width="50">
    <template #default="scope">
      {{ calcIndex(scope) }}
    </template>
  </ElTableColumn>
</template>

<script lang="ts" setup>
import { ElTableColumn } from 'element-plus';

const props = defineProps(['currentPage', 'pageSize', 'column'])

const calcIndex = (scope: any) => {
  if (!props.column) {
    return (Number(props.currentPage || 0) - 1) * (Number(props.pageSize || 20)) + Number(scope.$index)
  } else {
    return Number(scope.$index)
  }
}
</script>
