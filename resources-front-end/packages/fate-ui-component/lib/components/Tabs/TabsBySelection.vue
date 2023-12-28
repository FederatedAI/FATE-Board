<template>
  <section class="f-tabs-selection-container">
    <section class="f-tabs-selection-header">   
      <slot name="beforeHeader"></slot>
      <section class="f-tabs-selection-tabs">
        <slot name="beforeTab"></slot>
        <FSelection v-show="show !== false" v-bind="$attrs"></fSelection>
        <slot name="afterTab"></slot>
      </section>
      <slot name="afterHeader"></slot>
    </section>
    <section class="f-tabs-selection-content">
      <slot></slot>
    </section>
  </section>
</template>

<script lang="ts" setup>
import FSelection from '../Selection/Selection.vue';

defineProps(['show'])
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/styles/index.scss';

.f-tabs-selection-container {
  width: 100%;
  height: 100%;
  @include flex-col();
  @include flex-center();

  .f-tabs-selection-header {
    width: 100%;
    flex: 0 0 auto;
    padding-bottom: math.div($pale, 2);
    @include flex-row();
    align-items: center;
    justify-content: space-between;

    .f-tabs-selection-tabs {
      @include flex-row();
      align-items: center;
      justify-content: flex-start;
    }
  }

  .f-tabs-selection-content {
    width: 100%;
    height: 100%;
    flex: 1 1 auto;
  }
}
</style>