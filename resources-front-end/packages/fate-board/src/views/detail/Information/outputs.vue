<template>
  <el-dialog
    v-model="display"
    :width="!fullscreen ? '80%' : '100%'"
    :title="component"
    top="48px"
    append-to-body
    lock-scroll
    :modal="false"
    class="f-output-dialog"
  >
    <el-tabs v-model="active" class="f-detail-tabs">
      <el-tab-pane :label="firstModelLabel" name="model" class="f-detail-item">
        <component
          :is="componentInstance"
          :key="update"
          class="f-detail-item-content"
        ></component>
      </el-tab-pane>
      <el-tab-pane label="data" name="data" :lazy="true" class="f-detail-item">
        <DataOutput class="f-detail-item-content"></DataOutput>
      </el-tab-pane>
      <el-tab-pane label="log" name="log" :lazy="true" class="f-detail-item">
        <LogOutput class="f-detail-item-content"></LogOutput>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onBeforeMount, ref, watch } from 'vue';
import { useStore } from 'vuex';
import DataOutput from './DataOutput.vue';
import LogOutput from './LogOutput.vue';

const display = ref(false);
const fullscreen = ref(true);
const active = ref('model');

const store = useStore();

const component = computed(() => store.state.comp.information.name);
const compType = computed(() => store.state.comp.information.type);
const firstModelLabel = computed(() => {
  let name = 'summary';
  const modelOutputCheck = [
    'boost',
    'linr',
    'lr',
    'poisson',
    'nn',
    'fm',
    'mf',
    'svd',
    'svd',
    'gmf',
    'kmeans',
  ];
  const metricsOutputCheck = ['evaluation', 'scorecard'];
  if (
    compType.value.match(new RegExp(`(${metricsOutputCheck.join('|')})`, 'i'))
  ) {
    name = 'metrics';
  } else if (
    compType.value.match(new RegExp(`(${modelOutputCheck.join('|')})`, 'i'))
  ) {
    name = 'model';
  }
  return name;
});

const componentInstance: any = ref(undefined);
const update = ref(0);
let unloaded = false;

const modelComponent = () => {
  componentInstance.value = undefined;
  if (component.value) {
    componentInstance.value = defineAsyncComponent(async () => {
      const config = store.state.comp.hasLoaded[component.value];
      if (config && config.instance) {
        return config.instance.toVue();
      } else {
        unloaded = true;
        return {};
      }
    });
    update.value++;
  }
};

watch(
  () => store.state.comp.hasLoaded,
  () => {
    if (store.state.comp.hasLoaded[component.value] && unloaded) {
      modelComponent();
      unloaded = false;
    }
  },
  { deep: true }
);

watch(
  () => component.value,
  () => {
    modelComponent();
  },
  { deep: true }
);

onBeforeMount(() => {
  modelComponent();
});

const on = () => {
  display.value = true;
};
const off = () => {
  display.value = false;
};

defineExpose({
  on,
  off,
});
</script>

<style lang="scss">
@import '@/style/index.scss';

.f-output-dialog {
  height: calc(100% - 48px);
  margin-bottom: 0px;
  position: relative;
  background-color: $default-bg;

  .el-dialog__body {
    height: calc(100% - 60px);

    .f-detail-tabs {
      height: 100%;
    }

    .el-tabs__content {
      height: calc(100% - 55px);
      overflow-y: auto;
    }

    .f-detail-item {
      width: 100%;
      height: 100%;
      @include flex-col();
      align-items: center;
      justify-content: flex-start;
    }

    .f-model-empty {
      padding: $pale;
      @include title-3-size();
      font-weight: 600;
    }
  }

  .f-detail-item-content {
    @keyframes fadeIn {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
    animation: 1s ease-in 0s fadeIn;
  }
}
</style>
