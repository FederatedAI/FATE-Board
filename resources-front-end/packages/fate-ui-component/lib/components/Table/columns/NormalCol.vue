<template>
  <ElTableColumn v-bind="$attrs">
    <template #default="scope">
      <template v-if="children">
        <component v-for="(config, key) in children" :key="key" :is="columnExplain(config)" v-bind="config"></component>
      </template>
      <template v-else>
        {{ content(scope) }}
      </template>
    </template>
  </ElTableColumn>
</template>

<script lang="ts" setup>
import { ElTableColumn } from 'element-plus';
import { contentExplain } from '../cellExplain';
import { columnExplain } from './explain';

defineProps(['children'])

const content = (scope: any) => {
  return contentExplain(scope);
};
</script>
