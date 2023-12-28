<template>
  <section class="f-selection-chart">
    <section v-show="leftIconDisplay" class="f-selection-chart-icon f-sub-selection-chart--left">
      <ArrowLeftBold />
    </section>
    <section
      ref="container"
      :key="refresh"
      class="f-selection-chart-options"
      @mousewheel.stop="scrollMove"
      @mousedown.stop="mouseMove"
      @mousemove.stop="mouseMoveing"
      @mouseup.stop="mouseMoved"
      @mouseleave.stop="mouseMoved"
    >
      <ElTooltip
        v-for="(item, key) in options"
        :key="key"
        :content="String(item.label)"
        effect="dark"
        placement="top">
        <article
          :style="{
            'background-color': colorGet(item),
          }"
          :class="{
            'f-sub-item': true,
            'f-sub-item--active': key === current,
          }"
          @click.stop="change(item, key)"
        ></article>
      </ElTooltip>
    </section>
    <section v-if="RightIconDisplay" class="f-selection-chart-icon f-selection-chart-icon--right">
      <ArrowRightBold />
    </section>
  </section>
</template>

<script lang="ts" setup>
import { ElTooltip } from 'element-plus';
import { toRGBA } from 'fate-tools';
import { computed, onMounted, ref, watch, withDefaults } from 'vue';

interface Props {
  options:
    | Array<{
        label: string;
        weight: number;
        value: keyof any;
      }>
    | undefined;
  color?: string;
  max: number;
  min: number;
}

const props = withDefaults(defineProps<Props>(), {
  options: undefined,
  color: '#409eff',
  max: -1,
  min: -1,
});
const emits = defineEmits(['change']);

const current = ref(0);

const limitation = computed(() => {
  let max = props.max,
    min = props.min;
  if (props.max > 0 && props.min > 0) {
    return {
      max: props.max,
      min: props.min,
    };
  } else if (props.options) {
    props.options.forEach((item: any) => {
      if (max === -1 || item.weight > max) {
        max = item.weight;
      }
      if (min === -1 || item.weight < min) {
        min = item.weight;
      }
    });
    return { max, min };
  } else {
    return { max, min };
  }
});

function colorGet(option: any) {
  if (parseInt(option.weight) !== 0) {
    const colors: string[] = toRGBA(props.color)
      .toLowerCase()
      .replace('rgba(', '')
      .replace(')', '')
      .split(',');
    colors[3] = String(
      1 -
        0.8 *
          ((limitation.value.max -
            (typeof option === 'object' ? option.weight : option)) /
            limitation.value.max)
    );
    return 'rgba(' + colors.join(',') + ')';
  } else {
    return '#909399';
  }
}

function change(item: any, key: number) {
  if (!moved.value) {
    current.value = key;
    emits('change', item);
  }
  moved.value = false
}

const container = ref();
function scrollMove(eve: any) {
  const { deltaY } = eve;
  container.value.scrollLeft += deltaY;
  hasLeftIcon()
  hasRightIcon()
}

const moving = ref(false);
const moved = ref(false);
function mouseMove() {
  moving.value = true;
}
function mouseMoveing(eve: any) {
  if (moving.value) {
    moved.value = true
    const { movementX } = eve;
    container.value.scrollLeft -= movementX;
    hasLeftIcon()
    hasRightIcon()
  }
}
function mouseMoved() {
  moving.value = false;
}

const leftIconDisplay = ref(false)
const hasLeftIcon = () => {
  const left = container.value ? container.value.scrollLeft : 0
  leftIconDisplay.value = (left !== 0)
}

const RightIconDisplay = ref(false)
const hasRightIcon = () => {
  if (container.value) {
    const sWidth = container.value.scrollWidth
    const left = container.value.scrollLeft
    const cWidth = container.value.clientWidth
    RightIconDisplay.value = ((cWidth + left) < sWidth)
  } else {
    RightIconDisplay.value = false
  }
}

watch(
  () => container.value,
  () => {
    hasLeftIcon()
    hasRightIcon()
  },
  { deep: true }
)

const refresh = ref(0)
watch(
  () => props.color,
  () => {
    refresh.value += 1
  }
)

watch(
  () => props.options,
  () => {
    if (props.options) {
      change(props.options[0], 0)
    }
  },
  { deep: true }
)

onMounted(() => {
  hasLeftIcon()
  hasRightIcon()
  if (props.options && props.options[current.value]) {
    emits('change', props.options[current.value])
  }
})

function range () {
  return limitation.value
}

defineExpose({
  range
})

</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/styles/index.scss';

.f-selection-chart {
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 60px;
  padding: math.div($pale, 4) math.div($pale, 3);
  border: 1px solid var(--el-color-info-light-9);
  border-radius: 2px;

  .f-selection-chart-icon {
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    width: 14px;
    height: 14px;
    z-index: 5;
    overflow: visible;
    color: var(--el-color-info-dark-2);
    font-size: $text-size-small;
  }

  .f-selection-chart-icon--left {
    left: 0;
  }

  .f-selection-chart-icon--right {
    right: 0;
  }
}

.f-selection-chart-options {
  position: relative;
  width: 100%;
  height: 100%;

  @include flex-row();
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  background-color: var(--el-bg-color);

  :deep(.f-sub-item) {
    min-width: $pale;
    height: calc(100% - 6px);
    border-radius: 2px;
    margin-right: 1px;

    &:hover {
      box-shadow: 0 0 3px var(--el-color-info);
    }
  }

  :deep(.f-sub-item--active) {
    border: 1px solid var(--el-color-info);
    box-shadow: 0 0 3px var(--el-color-info-dark-2);
    position: relative;

    &::after {
      content: " ";
      border: 5px solid transparent;
      border-bottom: 5px solid var(--el-color-info-dark-2);
      position: absolute;
      bottom: -3px;
      left: 0;
      right: 0;
      margin: auto;
    }
  }
}
</style>
