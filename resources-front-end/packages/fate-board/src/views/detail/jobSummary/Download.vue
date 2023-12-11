<template>
  <article class="f-summary-download">
    <FRow
      content="Conf Download"
      @click="download()"
      class="f-summary-download-text"
      :class="{
        'f-summary-download-disable': role.match(/arbiter/i)
      }"
      :contentClassName="'f-summary-link'"
    >
      <template #prefix>
        <el-icon class="f-history-download-icon"><Download /></el-icon>
      </template>
    </FRow>
  </article>
</template>

<script lang="ts" setup>
import API from '@/api';
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const jobId = computed(() => store.state.job.jobId);
const role = computed(() => store.state.job.role);
const partyId = computed(() => store.state.job.partyId);

const download = () => {
  if (!(role.value.match(/arbiter/i))) {
    API.jobDownload({ jobId: jobId.value, role: role.value, partyId: partyId.value });
  }
};
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';

.f-summary-download {
  @include flex-col();
  justify-content: flex-start;
  align-items: flex-start;

  .f-summary-download-text {
    @include text-size-small();
    justify-content: flex-start;
    padding-left: 0px;
    cursor: pointer;
    :deep(.f-summary-link)   {
      @include text-size-small();
      color: var(--el-color-primary-light-3);
    }
  }
  
  .f-summary-download-disable {
    :deep(.f-summary-link) {
      color: var(--el-color-info);
    }
  }
  .f-history-download-icon {
    width: $pale;
    height: $pale;
    color: var(--el-color-primary-light-3);
  }
}
</style>
