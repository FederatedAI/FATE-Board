<template>
  <section class="running-header">
    <section class="f-header-info">
      <FRow class="t-text" :content="`Job: ${jobId}`" :contentClassName="'f-header-job'"/>
      <FRow class="t-text" :content="`Role: ${role}`" :contentClassName="'f-header-job-role'"/>
    </section>
    <el-link type="warning" class="p-cancel" @click="$emit('cancel')">
      cancel
    </el-link>
  </section>
</template>

<script lang="ts" setup>
defineProps(['jobId', 'role']);
defineEmits(['cancel']);
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';
.running-header {
  @include flex-row();
  @include flex-stretch();
  align-items: flex-start;
  margin-bottom: $pale;
  
  .f-header-info {
    @include flex-col();
    align-items: flex-start;
    justify-content: flex-start;

    :deep(.f-header-job) {
      color: var(--el-color-info-dark-2);
    }

    :deep(.f-header-job-role) {
      color: var(--el-color-info-light-3)
    }
  }
}
</style>
