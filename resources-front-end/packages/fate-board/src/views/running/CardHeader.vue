<template>
  <section class="running-header">
    <TextOverflow class="t-text" :content="`Job: ${job}`" />
    <el-link type="warning" class="p-cancel" @click="$emit('cancel')">
      cancel
    </el-link>
  </section>
</template>

<script lang="ts" setup>
defineProps(['job']);
defineEmits(['cancel']);
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';
.running-header {
  @include flex-row();
  @include flex-stretch();

  margin-bottom: $pale;
}
</style>
