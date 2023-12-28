<template>
  <ElTableColumn v-bind="$attrs">
    <template #default="scope">
      <FRow
        :content="contentExplain(scope, range)"
        class="fb-table-txRow fb-table-txRow--link"
        @click="$emit('click', scope)"/>
    </template>
  </ElTableColumn>
</template>

<script lang="ts" setup>
import { ElTableColumn } from 'element-plus';
import FRow from '../../Text/Row.vue';
import { contentExplain } from '../cellExplain';

defineProps(['content', 'range']);
defineEmits(['click']);

</script>
