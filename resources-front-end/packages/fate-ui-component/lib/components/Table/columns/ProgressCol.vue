<template>
  <ElTableColumn v-bind="$attrs">

    <template #default="scope">

      <ElProgress
        v-if="showPercentage(scope)"
        :percentage="showPercentage(scope)"
        :text-inside="!!inside"
        :stroke-width="6"
        class="fb-table-progress"
      >
        <span class="fb-table-progress-text">{{ showContent(scope) }}</span>
      </ElProgress>

      <template v-else> {{ showContent(scope) }} </template>

    </template>
  </ElTableColumn>
</template>

<script lang="ts" setup>
import { ElProgress, ElTableColumn } from 'element-plus';
import { isObject } from 'lodash';
import { contentExplain } from '../cellExplain';

const props = defineProps(['inside', 'range'])

const showPercentage = ({ row, column }: any) => {
  const content = row[column.property]
  if (isObject(content)) {
    return (content as any).percentage
  } else {
    return void 0
  }
}

const showContent = (scope: any) => {
  return contentExplain(scope, props)
}
</script>
