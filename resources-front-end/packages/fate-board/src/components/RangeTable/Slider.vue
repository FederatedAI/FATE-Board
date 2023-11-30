<template>
  <section class="f-r-container">
    <section class="f-r-label">{{ label }}:</section>
    <el-slider
      v-model="slideValue"
      :min="min"
      :max="max"
      :step="interval"
      :show-input="input"
      class="f-r-slider"
      @change="change"
    ></el-slider>
    <el-tooltip effect="dark" :content="explain">
      <el-icon class="f-r-icon">
        <QuestionFilled></QuestionFilled>
      </el-icon>
    </el-tooltip>
  </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    label: string;
    min: number;
    max: number;
    interval: number;
    input: boolean;
    range: boolean;
    explain: string;
    value: string | number;
  }>(),
  {
    label: '',
    min: 0,
    max: 1,
    interval: 0.01,
    input: true,
    range: false,
    explain: '',
    value: 0,
  }
);
const emits = defineEmits(['change']);
const slideValue = ref(
  props.value || Number(((props.min + props.max) / 2).toFixed(2))
);

const change = () => {
  emits('change', slideValue.value);
};
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';
.f-r-container {
  @include flex-row();
  align-items: center;
  justify-content: flex-start;

  .f-r-slider {
    width: 400px;
  }
  .f-r-label {
    padding-right: $pale;
    @include title-4-size();
    color: var(--el-color-info);
  }
  .f-r-icon {
    margin-left: $pale;
  }
}
</style>
