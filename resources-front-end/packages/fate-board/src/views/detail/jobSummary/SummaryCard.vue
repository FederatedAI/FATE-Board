<template>
  <section class="f-summary">
    <article class="f-summary-title">Job Summary</article>
    <Summary :data="data" :dataset="dataset"></Summary>
  </section>
</template>

<script lang="ts" setup>
import Summary from './Summary.vue';

defineProps(['data', 'dataset']);
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-summary {
  @include flex-col();
  justify-content: flex-start;
  align-items: flex-start;
}
.f-summary-title {
  @include title-4-size();
  font-weight: bold;
  margin-bottom: $pale;
}
</style>
