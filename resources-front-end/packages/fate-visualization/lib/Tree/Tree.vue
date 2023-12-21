<template>
  <div class="tree">
    <div
      class="tree-layer"
      :style="{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
      }"
    >
      <div ref="container" class="tree-container"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts';
import { toRGBA } from 'fate-tools';
import { merge } from 'lodash';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import explain from './explain';
import stretch from './stretch';

const props = defineProps(['title', 'data', 'color']);
const emits = defineEmits(['afterDraw'])

const container = ref();
let resize: any;
let chart: any;
let option: any;
const containerWidth = ref(200);
const containerHeight = ref(200);

const draw = (newOptions?: any, setting?: any) => {
  chart.setOption(newOptions || option, { merge: true }, setting);
  const { width, height } = stretch(chart);
  containerWidth.value = Number(width);
  containerHeight.value = Number(height);
  nextTick(() => emits('afterDraw'))
}

const rgba = (color: string, opacity: number) => {
  return toRGBA(color, opacity)
}

watch(() => props.data,
  () => {
    draw({
      series: {
        data: [props.data].flat(Infinity),
      },
    });
  },
  { deep: true }
);

watch(() => props.color,
  () => {
    draw({
      series: {
        label: {
          backgroundColor: props.color,
        },
        leaves: {
          label: {
            backgroundColor: rgba(props.color, 0.8)
          }
        }
      },
    });
  }
);

onMounted(() => {
  resize = new ResizeObserver(() => {
    chart.resize();
  });
  resize.observe(container.value);
  chart = echarts.init(container.value);
  option = merge(
    {
      title: {
        text: props.title,
      },
    },
    {
      series: {
        label: {
          backgroundColor: props.color || '#409eff',
        },
        leaves: {
          label: {
            backgroundColor: rgba(props.color || '#409eff', 0.8)
          }
        }
      }
    },
    explain(props.data)
  );
  draw();
});

onUnmounted(() => {
  if (resize) {
    resize.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.tree {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: flex-start;
}
.tree-layer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.tree-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
