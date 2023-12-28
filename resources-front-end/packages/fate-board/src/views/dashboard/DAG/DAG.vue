<template>
  <section class="f-dashboard-graphic">
    <article class="f-dashboard-graphic-title">
      <span>Graph</span>
      <el-icon class="f-dashboard-graohic-icon" @click="fullScreen"
        ><FullScreen
      /></el-icon>
    </article>
    <section class="f-dashboard-chart">
      <FDag
        v-loading="dagLoading"
        :data="dataWithPorts"
        :operation="false"
        :mini="true"
        @loaded="loaded"
        class="f-dashboard-dag"
      />
    </section>
    <el-dialog v-model="display" title="DAG" width="80%" append-to-body>
      <section class="fb-dag-dialog">
        <FDag
          v-loading="dagLoading"
          :data="dataWithPorts"
          @loaded="loaded"
          class="f-dashboard-dag"
        />
      </section>
    </el-dialog>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const dagLoading = ref(true);

const dataWithPorts = computed(() => store.state.job.dag);

const loaded = () => {
  dagLoading.value = false;
};

const display = ref(false);
const fullScreen = () => {
  display.value = true;
};
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';

.f-dashboard-graphic {
  position: relative;
  @include box-stretch();
  @include flex-col();
  @include flex-stretch();

  .f-dashboard-graphic-title {
    margin-bottom: $pale;

    width: 100%;
    @include flex-row();
    justify-content: space-between;
    align-items: center;

    flex: 1 1 10%;

    > * {
      @include title-4-size();
      font-weight: bold;
    }

    .f-dashboard-graohic-icon {
      width: $pale * 2;
      height: $pale * 2;
      padding: 2px;
      border-radius: $pale;
      background-color: var(--el-bg-color);
      color: var(--el-color-info);
      cursor: pointer;
    }
  }

  .f-dashboard-chart {
    position: relative;
    width: 100%;
    flex: 2 2 calc(100% - 18px - $pale);
    max-height: calc(100% - 18px - $pale);
    background-color: var(--el-bg-color);
  }

  .f-dashboard-dag {
    background-color: var(--el-bg-color);
  }
}

.fb-dag-dialog {
  position: relative;
  width: 100%;
  height: 80%;
  min-height: 500px;
  padding: $pale;

  .f-dashboard-dag {
    background-color: var(--el-bg-color);
  }
}
</style>
