<template>
  <div class="gauge">
    <div ref="container" class="gauge-container"></div>
  </div>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts';
import { merge } from 'lodash';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import options from './explain';

const props = defineProps(['title', 'precentage']);
const container = ref();
let displayLabel = false
let resize: any;
let chart: any;
let option: any;

function draw(precentage?: any) {
  chart.setOption(precentage? {
    series: {
      data: [{
        value: precentage
      }]
    }
  } : option);
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

watch(
  () => props.precentage,
  () => {
    draw(props.precentage)
  }
)

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
    options(),
    {
      series: {
        data: [{
          value: props.precentage || 0
        }]
      }
    }
  )
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
.gauge {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.gauge-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
