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
      <el-tab-pane label="model" name="model">
        <section class="f-detail-item f-detail-model">
          <component :is="componentInstance"></component>
        </section>
      </el-tab-pane>
      <el-tab-pane label="data" name="data">
        <section class="f-detail-item f-detail-data"></section>
      </el-tab-pane>
      <el-tab-pane label="log" name="log">
        <section class="f-detail-item f-detail-log"></section>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script lang="ts" setup>
import { parse } from 'fate-ui-component';
import { isUndefined } from 'lodash';
import { computed, defineAsyncComponent, onBeforeMount, ref, watch } from 'vue';
import { useStore } from 'vuex';

const display = ref(false);
const fullscreen = ref(true);
const active = ref('model');

const store = useStore();

const component = computed(() => store.state.comp.information.name);
const componentInstance: any = ref(undefined);
const modelComponent = () => {
  componentInstance.value = undefined;
  if (component.value) {
    componentInstance.value = defineAsyncComponent(async () => {
      const configuration = store.state.comp.hasLoaded[component.value];
      if (configuration) {
        const instance = await parse(configuration)
        return instance.toVue();
      } else {
        return {};
      }
    })
  }
};

watch(
  () => store.state.comp.hasLoaded,
  () => {
    if (
      store.state.comp.hasLoaded[component.value] &&
      isUndefined(componentInstance.value)
    ) {
      modelComponent();
    }
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
}
</style>
