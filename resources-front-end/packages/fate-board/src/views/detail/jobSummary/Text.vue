<template>
<article :class="{
    'f-text': true,
    'f-text-col': col
  }">
  <span class="f-text-title">{{ title }}
    <span class="f-text-seperator">:</span>
  </span>
  <span class="f-text-content">{{ content }}</span>
</article>
</template>

<script lang="ts" setup>
defineProps(['title', 'content', 'col'])
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-text {
  @include flex-row();
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;

  .f-text-title {
    display: inline-block;
    @include text-size();
    min-width: 80px;
    color: var(--el-color-info);
    padding-bottom: math.div($pale, 4);
  }

  .f-text-seperator {
    padding: 0px math.div($pale, 4);
  }

  .f-text-content {
    display: inline-block;
    @include text-size-small();
    color: var(--el-color-info-dark-2);
  }
}

.f-text-col {
  flex-direction: column;
}
</style>
