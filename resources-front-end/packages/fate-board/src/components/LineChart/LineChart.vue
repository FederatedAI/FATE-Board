<template>
  <div class="f-line-container" :key="refresh">
    <section class="f-line-title">
      <article>{{ title }}</article>
    </section>
    <FLOBChart :data="data" :legend="legend"
      class="f-line-chart"/>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps(['title', 'data', 'legend'])
const refresh = ref(0)

watch(
  () => props.data,
  () => refresh.value++,
  { deep: true }
)

</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-line-container {
  width: 100%;
  @include flex-col();
  align-items: flex-start;
  justify-content: flex-start;

  .f-line-title {
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

  .f-line-chart {
    position: relative;
    width: 100%;
    height: 550px;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-color-info-light-9);
    border-radius: 2px;
  }
}
</style>
