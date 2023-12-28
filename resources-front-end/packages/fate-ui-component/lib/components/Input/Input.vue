<template>
  <section
    class="f-input-container"
    :class="{
      'f-input-container-column': column,
    }"
  >
    <labe v-if="label" class="f-input-label">{{ label }}:</labe>
    <ElInput
      clearable
      v-bind="$attrs"
      class="f-input-content"
    ></ElInput>
  </section>
</template>

<script lang="ts" setup>
import { ElInput } from 'element-plus';

withDefaults(
  defineProps<{
    label: string;
    column: boolean;
  }>(),
  {
    label: '',
    column: false,
  }
);
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/styles/index.scss';

.f-input-container {
  position: relative;

  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;

  .f-input-label {
    color: var(--el-color-info-dark-2);
    font-size: $text-size;
    padding-right: $pale;
  }
}

.f-input-container-column {
  flex-direction: column;
  align-items: flex-start;
  .f-input-label {
    padding-bottom: math.div($pale, 4)
  }
}
</style>
