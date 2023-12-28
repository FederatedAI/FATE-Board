<template>
  <section class="f-selection-container" :class="{
    'f-selection-container-column': column
  }">
    <labe v-if="label" class="f-selection-label" :class="classNameExplain(labelClassName, $props)">{{ label }}:</labe>
    <ElSelect
      clearable
      v-bind="$attrs"
      class="f-selection"
      popper-class="f-selection-popover"
    >
      <template v-if="Array.isArray(options) || !Object.keys(options).some(key => isNaN(parseFloat(key)))">
        <ElOption
          v-for="(option, index) in options"
          :key="index"
          :label="option.label"
          :value="option.value"
          :disabled="option.disabled"
          class="f-selection-option"
        />
      </template>

      <template v-else>
        <ElOptionGroup
          v-for="(group, key) in options"
          :key="key"
          :label="key.toString()"
          class="f-selection-group"
        >
          <el-option
            v-for="(option, index) in group"
            :key="index"
            :label="option.label"
            :value="option.value"
            :disabled="option.disabled"
            class="f-selection-option"
          />
        </ElOptionGroup>
      </template>
    </ElSelect>
  </section>
</template>

<script lang="ts" setup>
import classNameExplain from '@/utils/classNameExplain';
import { ElOption, ElOptionGroup, ElSelect } from 'element-plus';

const props = defineProps([
  'label',
  'column',
  'options',
  'labelClassName'
]);
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/styles/index.scss';

.f-selection-container {
  position: relative;

  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;

  .f-selection-label {
    color: var(--el-color-info-dark-2);
    font-size: $text-size;
    padding-right: $pale;
  }
}

.f-selection-container-column {
  flex-direction: column;
  align-items: flex-start;
  .f-selection-label {
    padding-bottom: math.div($pale, 4)
  }
}
</style>
