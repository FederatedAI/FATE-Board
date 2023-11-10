<template>
  <div class="heat_map">
    <div ref="container" class="heat_map-container"></div>
  </div>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts';
import { onMounted, onUnmounted, ref } from 'vue';
import dataFormat from './dataFormat';
import options from './explain';

const props = defineProps(['title', 'x', 'y', 'data', 'min', 'max', 'pearson']);
const container = ref();
let displayLabel = false
let resize: any;
let chart: any;
let option: any;

function draw() {
  chart.setOption(option);
}

function display() {
  displayLabel = !displayLabel
  chart.setOption({
    series: {
      label: {
        show: displayLabel
      }
    }
  })
}

onMounted(() => {
  resize = new ResizeObserver(() => {
    chart.resize();
  });
  resize.observe(container.value);

  chart = echarts.init(container.value);

  const { data, min, max }: any = dataFormat(props.x, (props.y || props.x), props.data, !props.y || props.pearson)
  option = Object.assign(
    {
      title: {
        text: props.title,
      },
    },
    options({
      x: props.x,
      y: props.y,
      data: data,
      min: props.min || min,
      max: props.max || max,
    }, {
      series: {
        label: {
          show: displayLabel
        }
      }
    })
  );

  draw();
});

onUnmounted(() => {
  if (resize) {
    resize.disconnect();
  }
});

defineExpose({
  displayLabel: display
})
</script>

<style lang="scss" scoped>
.heat_map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.heat_map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
