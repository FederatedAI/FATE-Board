<template>
  <section 
    :class="{
      'f-color-gradient': true,
      'f-color-gradient-column': column
    }">
    <article class="f-color-gradient-title">{{ label }}:</article>
    <article class="f-color-gradient-range-start">{{ start }}</article>
    <article
      class="f-color-gradient-range-gradient"
      :style="{
        background: gradient,
        width: column ? `${size}px` : '100%',
        height: column ? '100%' : `${size}px`,
        borderRadius: `${round}px`,
      }"
    ></article>
    <article class="f-color-gradient-range-end">{{ end }}</article>
  </section>
</template>

<script lang="ts" setup>
import { isUndefined } from 'lodash';
import { computed } from 'vue';

interface Props {
  label: string;
  max: number | undefined;
  min: number | undefined;
  startFromMin: boolean;
  maxColor: string;
  minColor: string;
  column: boolean;
  size: number;
  round: number;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Color Gradient',
  max: undefined,
  min: undefined,
  maxColor: '#409eff',
  minColor: '#ffffff',
  column: false,
  startFromMin: false,
  size: 15,
  round: 10
});

const start = computed(() => {
  return !props.startFromMin
    ? isUndefined(props.max)
      ? 'max'
      : props.max
    : isUndefined(props.min)
    ? 'min'
    : props.min;
});

const end = computed(() => {
  return props.startFromMin
    ? isUndefined(props.max)
      ? 'max'
      : props.max
    : isUndefined(props.min)
    ? 'min'
    : props.min;
});

const gradient = computed(() => {
  return `linear-gradient(to ${props.column ? 'bottom' : 'right'},${
    props.startFromMin ? props.minColor : props.maxColor
  }, ${!props.startFromMin ? props.minColor : props.maxColor})`;
});
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/styles/index.scss';

.f-color-gradient {
  @include flex-row();
  align-items: center;
  justify-content: flex-start;

  & > * {
    flex: 0 0 auto;
  }

  .f-color-gradient-title {
    font-size: $title-size;
    font-weight: bold;
    color: var(--el-color-info-dark-2);
    padding-right: math.div($pale, 2);
  }

  .f-color-gradient-range-gradient {
    flex-shrink: 1;
    flex-grow: 1;
    box-shadow: 0px 0px 3px var(--el-color-info-light-7);
  }

  .f-color-gradient-range-start {
    color: var(--el-color-info-light-3);
    font-size: $text-size;
    padding: 0px math.div($pale, 2);
  }

  .f-color-gradient-range-end {
    color: var(--el-color-info-light-3);
    font-size: $text-size;
    padding-left: math.div($pale, 2);
  }
}

.f-color-gradient-column {
  flex-direction: column;
  min-height: 200px;

  .f-color-gradient-title {
    padding-bottom: math.div($pale, 2);
  }

  .f-color-gradient-range-start {
    padding: math.div($pale, 2) 0px;
  }

  .f-color-gradient-range-end {
    padding-top: math.div($pale, 2);
  }
}
</style>
