<template>
  <section class="f-selection-container" :class="{
    'f-selection-container-col': col
  }">
    <labe v-if="label" class="f-selection-label">{{ label }}:</labe>
    <ElSelect
      :name="name"
      v-model="selected"
      :multiple="!!multiple"
      :multiple-limit="isNumber(multiple) ? multiple : 0"
      :disabled="disabled"
      :placeholder="placeholder"
      collapse-tags
      collapse-tags-tooltip
      clearable
      filterable
      @change="selectChange"
      class="fb-select"
    >
      <template v-if="Array.isArray(options) || !Object.keys(options).some(key => isNaN(parseFloat(key)))">
        <ElOption
          v-for="(option, index) in options"
          :key="index"
          :label="option.label"
          :value="option.value"
          :disabled="option.disabled"
        />
      </template>

      <template v-else>
        <ElOptionGroup
          v-for="(group, key) in options"
          :key="key"
          :label="key.toString()"
        >
          <el-option
            v-for="(option, index) in group"
            :key="index"
            :label="option.label"
            :value="option.value"
            :disabled="option.disabled"
          />
        </ElOptionGroup>
      </template>
    </ElSelect>
  </section>
</template>

<script lang="ts" setup>
import { ElOption, ElOptionGroup, ElSelect } from 'element-plus';
import { isNumber } from 'lodash';
import { ref } from 'vue';

const props = defineProps([
  'name',
  'value',
  'options',
  'multiple',
  'placeholder',
  'disabled',
  'label',
  'col'
]);
const emits = defineEmits(['change']);

const selected = ref(props.value);
const selectChange = (value: any) => {
  selected.value = value;
  emits('change', selected);
};
</script>

<style lang="scss" scoped>
.f-selection-container {
  position: relative;

  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;

  .f-selection-label {
    color: var(--el-color-info);
    font-size: 14px;
    padding-right: 12px;
  }
}

.f-selection-container-col {
  flex-direction: column;
}
</style>
