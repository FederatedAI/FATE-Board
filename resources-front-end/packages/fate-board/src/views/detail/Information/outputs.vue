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
    <section v-loading="loading" class="f-detail-container">
      <section class="f-detail-operation">
        <el-link :icon="Refresh" type="primary" class="f-d-refresh" @click="refreshing">Refresh</el-link>
      </section>
      <el-tabs v-model="active" class="f-detail-tabs">
        <el-tab-pane :label="firstModelLabel" name="model" class="f-detail-item">
          <ModelOutput ref="model" class="f-detail-item-content"></ModelOutput>
        </el-tab-pane>
        <el-tab-pane label="data" name="data" :lazy="true" class="f-detail-item">
          <DataOutput ref="data" class="f-detail-item-content"></DataOutput>
        </el-tab-pane>
        <el-tab-pane label="log" name="log" :lazy="true" class="f-detail-item">
          <LogOutput ref="log" class="f-detail-item-content"></LogOutput>
        </el-tab-pane>
      </el-tabs>
    </section>
  </el-dialog>
</template>

<script lang="ts" setup>
import { Refresh } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import DataOutput from './DataOutput.vue';
import LogOutput from './LogOutput.vue';
import ModelOutput from './ModelOutput.vue';

const emits = defineEmits(['refresh'])

const display = ref(false);
const fullscreen = ref(true);
const active = ref('model');

const store = useStore();

const loading = ref(true)
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

const model = ref()
const data = ref()
const log = ref()
const refreshing = async () => {
  loading.value = true
  if (model.value)
    await model.value.refresh()
  if (data.value)
    await data.value.refresh()
  if (log.value)
    await log.value.refresh()
  emits('refresh')
}
const refreshed = () => {
  loading.value = false
}

const on = () => {
  display.value = true;
};
const off = () => {
  display.value = false;
};

defineExpose({
  on,
  off,
  refreshed
});
</script>

<style lang="scss">
@import '@/style/index.scss';

.f-output-dialog {
  height: calc(100% - 48px);
  margin-bottom: 0px;
  position: relative;
  background-color: $default-bg;

  .f-detail-container {
    @include box-stretch();
    position: relative;
  }

  .f-detail-operation {
    position: absolute;
    right: 0;
    @include flex-row();
    align-items: center;
    justify-content: flex-start;
    min-height: 40px;
    z-index: 10;
  }
  
  .f-d-refresh {
    margin-right: $pale;
  }

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
