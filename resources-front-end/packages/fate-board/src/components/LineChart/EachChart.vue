<template>
  <section class="f-tab-container">
    <section class="f-tab-title">
      <article>{{ title }}</article>
      <section class="f-subtab">
        <span
          v-for="(sub, key) in subTabs"
          :key="key"
          class="f-subtab-item"
          :class="{
            'f-subtab-active': subActive === sub,
          }"
          @click="subChange(sub)"
          >{{ sub }}</span
        >
      </section>
    </section>
    <FLOBChart
      :data="chart.configuration"
      :legend="chart.legend || 1"
      class="f-tab-chart"
    ></FLOBChart>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

const props = defineProps(['data', 'title']);

const subTabs = computed(() => {
  return Object.keys(props.data || {});
});
const subActive = ref(subTabs.value[0] || '');

watch(
  () => subTabs.value,
  () => {
    subActive.value = subTabs.value[0];
  }
);

const subChange = (sub: any) => {
  subActive.value = sub;
};

const chart = computed(() => {
  return props.data[subActive.value] || { series: [] };
});
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-tab-container {
  width: 100%;
  @include flex-col();
  align-items: flex-start;
  justify-content: flex-start;

  .f-tab-title {
    width: 100%;
    @include flex-row();
    align-items: flex-end;
    justify-content: flex-start;
    margin-bottom: $pale;

    & > article {
      @include title-3-size();
      color: var(--el-color-info-dark-2);
      padding-right: $pale;
    }
  }

  .f-subtab {
    @include flex-row();
    .f-subtab-item {
      padding: math.div($pale, 3);
      background: var(--el-bg-color);
      border: 1px solid var(--el-color-info);
      cursor: pointer;
    }
    .f-subtab-active {
      background: var(--el-color-primary);
      color: var(--el-bg-color);
      border: 0px;
    }
  }
  

  .f-tab-chart {
    position: relative;
    width: 100%;
    height: 550px;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-color-info-light-9);
    border-radius: 2px;
  }
}
</style>
