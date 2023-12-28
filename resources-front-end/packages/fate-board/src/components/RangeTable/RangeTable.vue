<template>
  <section class="f-r-t-container">
    <section class="f-r-t-title">
      {{ title }}
    </section>
    <section v-if="isBoolean(range) ? range : true" class="f-r-t-range">
      <span class="f-r-t-label">{{ label }}</span>
      <FSlider :value="range" v-bind="$attrs" @change="change" :explain="explain"></FSlider>
    </section>
    <section class="f-r-t-table">
      <FTable :data="data" :header="header" :range="filter" :index="true"></FTable>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { isBoolean } from 'lodash';
import { ref } from 'vue';
import FSlider from './Slider.vue';

const props = defineProps(['title', 'label', 'data', 'header', 'range', 'explain'])
const filter = ref(props.range || 1)

const change = (value: any) => {
  filter.value = value
}
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';

.f-r-t-container {
  position: relative;
  @include flex-col();
  justify-content: flex-start;
  align-items: flex-start;

  & > * {
    margin-bottom: $pale;
  }

  .f-r-t-title {
    width: 100%;
    @include title-3-size();
    color: var(--el-color-info-dark-2);
  }
  .f-r-t-range {
    width: 100%;
    @include flex-row();
    align-items: center;
    justify-content: flex-start;

    .f-r-t-label {
      font-size: 16px;
      color: var(--el-color-info);
    }
  }
  .f-r-t-table {
    width: 100%;
  }
}
</style>
