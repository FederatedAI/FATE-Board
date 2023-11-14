<template>
  <article class="f-summary-notes">
    <article class="f-summary-notes-title">
      <span>{{ title }}</span>
      <el-icon @click="on" class="f-summary-notes-icon"><Edit /></el-icon>
    </article>
    <article class="f-summary-notes-content">
      {{ text }}
    </article>

    <el-dialog
      v-model="display"
      :title="capitalize(title) + ' Update'"
      width="40%"
      append-to-body
    >
      <section class="fb-table-dialog">
        <el-input v-model="editable" :rows="3" type="textarea" />
      </section>
      <template #footer>
        <span class="fb-table-dialog--footer">
          <el-button @click="off()">Cancel</el-button>
          <el-button type="primary" @click="off(true)">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </article>
</template>

<script lang="ts" setup>
import api from '@/api';
import { capitalize } from 'lodash';
import { ref, watch } from 'vue';
import { useStore } from 'vuex';

const props = defineProps(['content', 'title'])

const text = ref(props.content)
const display = ref(false)
const editable = ref(text.value)
const store = useStore()

const on = () => {
  display.value = true
}
const off = (updated?: boolean) => {
  if (updated) {
    updateNotes()
  }
  display.value = false
}

const updateNotes = async () => {
  const responseData = await api.noteUpdate({
    job_id: store.state.job.jobId,
    role: store.state.job.role,
    party_id: store.state.job.partyId,
    notes: editable.value
  })
  if (responseData) {
    text.value = editable.value
  }
}

watch(
  () => props.content,
  () => {
    text.value = props.content
    editable.value = props.content
  },
  { deep: true })
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-summary-notes {
  width: 100%;
  @include flex-col();
  align-items: flex-start;

  .f-summary-notes-title {
    @include text-size();
    min-width: 60px;
    color: var(--el-color-info);
    @include flex-row();
    align-items: center;
    justify-content: space-between;
    padding-bottom: math.div($pale, 4);
  }

  .f-summary-notes-content {
    width: 100%;
    min-height: 36px;
    padding: math.div($pale, 2);
    background-color: $default-white;
    border-radius: math.div($pale, 3);
    font-size: 12px;
    color: var(--el-color-info-dark-2);
  }

  .f-summary-notes-icon {
    color: var(--el-color-primary);
    cursor: pointer;
  }
}
</style>
 