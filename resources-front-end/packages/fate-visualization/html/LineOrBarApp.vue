<template>
  <div class="container">
    <LineOrBar :data="demo" title="text chart" :max="3" :legend="legend" />
  </div>
</template>

<script lang="ts" setup>
import LineOrBar from '../lib/LineOrBar/LineOrBar.vue';

const random = () => {
  const list: number[] = [];
  for (let i = 0; i < 7; i++) {
    list.push(Math.round(Math.random() * 100));
  }
  return list;
};

const legend = 2;

const demo = {
  xAxis: {
    name: 'x',
    data: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  },
  yAxis: {
    name: 'y',
    min: 1,
    max: 100,
  },
  series: [
    {
      name: 'line1_test_longest_name_for',
      type: 'line',
      smooth: true,
      data: random(),
    },
    {
      name: 'bar1',
      type: 'bar',
      data: random(),
    },
    {
      name: 'line2',
      type: 'line',
      smooth: true,
      data: random(),
    },
    {
      name: 'bar2',
      type: 'bar',
      data: random(),
    },
    {
      name: 'line3',
      type: 'line',
      smooth: true,
      data: random(),
    },
    {
      name: 'bar3',
      type: 'bar',
      data: random(),
    },
    {
      name: 'line4',
      type: 'line',
      smooth: true,
      data: random(),
    },
    {
      name: 'bar4',
      type: 'bar',
      data: random(),
    },
    {
      name: 'line5',
      type: 'line',
      smooth: true,
      data: random(),
    },
    {
      name: 'bar5',
      type: 'bar',
      data: random(),
    },
    {
      name: 'line6',
      type: 'line',
      smooth: true,
      data: random(),
    },
    {
      name: 'bar6',
      type: 'bar',
      data: random(),
    },
    {
      name: 'line7',
      type: 'line',
      smooth: true,
      data: random(),
    },
    {
      name: 'bar7',
      type: 'bar',
      data: random(),
    },
  ],
};
</script>

<style lang="scss" scoped>
.app_container {
  position: relative;
  min-width: 1000px;
  min-height: 500px;
  font: 14px '微软雅黑';
  overflow: hidden;
}
</style>
