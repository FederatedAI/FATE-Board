<template>
  <ElTableColumn v-bind="$attrs">
   
    <template #default="scope">

      <FRow :content="scope.row[scope.column.property]" class="fb-table-txRow">
        <template #suffix>
            <ElIcon class="fb-table-icon" @click="noteEditing(scope)"><Edit /></ElIcon>
        </template>
      </FRow>

      <EditDialog
        ref="dialog"
        :title="`Edit ${scope.column.property}`"
        @submit="noteEditSubmit"
      />
    </template>
  </ElTableColumn>
</template>

<script lang="ts" setup>
import { ElIcon, ElTableColumn } from 'element-plus';
import { ref } from 'vue';
import FRow from '../../Text/Row.vue';
import EditDialog from '../component/EditDialog.vue';

const emits = defineEmits(['edit']);
const dialog = ref();
let scopeCache: any

const noteEditing = (scope: any) => {
  scopeCache = scope
  const { row, column } = scope
  dialog.value.on(row[column.property]);
};

const noteEditSubmit = (content: any) => {
  emits('edit', content, scopeCache);
  scopeCache = undefined
};
</script>
