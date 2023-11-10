<template>
  <ElTableColumn :width="50">
    <template #default="scope">
      {{ calcIndex(scope) }}
    </template>
  </ElTableColumn>
</template>

<script lang="ts" setup>
import { ElTableColumn } from 'element-plus';

const props = defineProps(['currentPage', 'pageSize'])

const calcIndex = (scope: any) => {
  return (Number(props.currentPage || 0) - 1) * (Number(props.pageSize || 20)) + Number(scope.$index)
}
</script>
