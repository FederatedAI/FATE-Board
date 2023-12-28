<template>
  <ElDialog
    v-model="display"
    :title="title"
    width="40%"
    append-to-body
  >
    <section class="fb-table-dialog">
      <ElInput v-model="content" :rows="3" type="textarea" />
    </section>
    <template #footer>
      <span class="fb-table-dialog--footer">
        <ElButton @click="off()">Cancel</ElButton>
        <ElButton type="primary" @click="off(true)">Confirm</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import {
ElButton,
ElDialog, ElInput
} from 'element-plus';
import { ref } from 'vue';

defineProps(['title'])
const emits = defineEmits(['open', 'submit', 'cancel'])
const display = ref(false);
const content = ref('')

const on = (origin?: string) => {
  content.value = origin || '',
  emits('open')
  display.value = true
}

const off = (submit?: boolean) => {
  if (submit) {
    emits('submit', content.value)
  }
  display.value = false
}

defineExpose({ on, off })
</script>
