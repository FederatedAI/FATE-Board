<template>
  <section class="f-graphic">
    <article class="f-graphic-title">Outputs From Job</article>
    <article class="f-graphic-subtitle">
      Main Graph
      <span>Click component to view details</span>
    </article>
    <section class="f-graphic-dag">
      <FDag
        v-loading="dagLoading"
        :data="dataWithPorts"
        @loaded="loaded"
        @choose="choose"
        @retry="retry"
      />
    </section>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const emits = defineEmits(['retry', 'choose']);

const store = useStore();
const dataWithPorts = computed(() => store.state.job.dag);
const dagLoading = ref(true);

const loaded = () => {
  dagLoading.value = false;
};

const choose = (comp: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(comp);
  }
  emits('choose', comp)
};

const retry = (comp: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(comp);
  }
  store.dispatch('retryJob')
  emits('retry', comp)
};
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-graphic {
  @include flex-col();
  justify-content: flex-start;
  align-items: flex-start;

  .f-graphic-title {
    @include title-3-size();
    font-weight: bold;
    margin-bottom: $pale;
    @include flex-freeze();
  }

  .f-graphic-subtitle {
    @include text-size();
    font-weight: bold;
    margin-bottom: $pale;
    color: var(--el-color-info-light-3);
    @include flex-freeze();

    & > span {
      padding-left: $pale;
      @include text-size-small();
      color: var(--el-color-info);
    }
  }

  .f-graphic-dag {
    position: relative;
    width: 100%;
    max-height: 100%;
    flex: 1 1 100%;
    border-radius: math.div($pale, 4);
    background-color: $default-white;
  }
}
</style>
