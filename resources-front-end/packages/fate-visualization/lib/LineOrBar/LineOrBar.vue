<template>
  <div class="line_or_bar">
    <div ref="container" class="line_chart-container"></div>

    <LegendComponent
      v-if="legend"
      ref="legendCus"
      :legend="legendHint"
      :color="color"
      :max="6"
      :upperMax="3"
      @select="legendSelect"
      class="legendCus"
    />
  </div>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts';
import { isNumber } from 'lodash';
import {
nextTick,
onBeforeMount,
onMounted,
onUnmounted,
reactive,
ref
} from 'vue';
import LegendComponent from './LegendComponent.vue';
import options from './options';
import randomColor from './toColor';

const container = ref();
const legendCus = ref<any>();
const props = defineProps(['data', 'title', 'legend']);
const legendHint = reactive<any>([])
const color: any = reactive([]);
let option: any;
let series: any;
let chart: any;
let resize: any;

function setColor() {
  const gp = Array.isArray(legendHint[0]) ? legendHint[0].length : 1;
  color.push(...randomColor(props.data.series.length, gp));
}

function legendSelect(selected: string[]) {
  if (chart) {
    draw(selected);
  }
}

function draw(selected?: string[]) {
  if (selected) {
    const displaySeries = series.reduce((acc: any[], value: object) => {
      if (selected.some((val) => val === (value as any).name)) {
        acc.push(Object.assign(value));
      }
      return acc;
    }, []);
    chart.setOption(
      {
        series: displaySeries,
      },
      {
        replaceMerge: 'series',
      }
    );
  } else {
    chart.setOption(
      Object.assign({}, option, {
        series,
      })
    );
  }
}

onBeforeMount(() => {
  if (props.legend !== undefined) {
    if (isNumber(props.legend)) {
      let hints: any[] = []
      let cps: any[] = []
      const data = props.data.series
      for (const each of data) {
        cps.push(each.name)
        if (cps.length >= props.legend) {
          hints.push(cps)
          cps = []
        }
      }
      if (props.legend === 1) {
        hints = hints.flat(Infinity)
      }
      legendHint.push(...hints)
    } else {
      legendHint.push(...props.legend)
    }
    setColor();
  }
});

onMounted(() => {
  resize = new ResizeObserver(() => {
    chart.resize();
  });
  resize.observe(container.value);

  chart = echarts.init(container.value);

  option = Object.assign(
    {
      title: {
        text: props.title,
      },
    },
    options(
      Object.assign(
        {
          color: color.flat(Infinity),
          legendCustomer: !!props.legend,
        },
        props.data
      )
    )
  );

  series = option.series;
  option.series = [];
  if (!props.legend) {
    draw();
  } else {
    chart.setOption(option);
    nextTick(() => {
      (legendCus as any).value.selecting();
    });
  }
});

onUnmounted(() => {
  if (resize) {
    resize.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.line_or_bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.line_chart-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.legendCus {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
