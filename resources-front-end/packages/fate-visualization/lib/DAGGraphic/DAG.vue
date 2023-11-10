<template>
  <div ref="container" class="dag_graphic"></div>
  <div v-if="operation !== false" @dbclick.stop @click.stop class="btn_operation">
    <FullScreen @click.stop="fullScreen" class="btn_icon" />
    <Minus @click.stop="zoomIn" class="btn_icon" />
    <Plus @click.stop="zoomOut" class="btn_icon" />
  </div>
</template>

<script lang="ts" setup>
import { FullScreen, Minus, Plus } from '@element-plus/icons-vue';
import { select } from 'd3';
import { isObject } from 'lodash';
import { onMounted, ref, watch } from 'vue';
import DAG from './DAGContainer';
import runningStatus from './runningStatus';
import { SVGLoading } from './svg';

const props = defineProps(['data', 'operation']);
const emits = defineEmits(['choose', 'retry', 'loaded']);
const container = ref();
let DAGInstance: any;

const DAGCreator = () => {
  if (props.data && Object.keys(props.data).length > 0) {
    const element = select(container.value);
    DAGInstance = new DAG(
      {
        data: props.data,
        event: {
          choose: (_event: any, plot: any) => {
            const prop = plot.prop;
            emits('choose', prop);
          },
          retry: (_event: any, plot: any) => {
            const prop = plot.prop;
            emits('retry', prop);
          },
        },
      },
      element
    );
    if (DAGInstance) {
      emits('loaded')
    }
  }
}

onMounted(() => {
  SVGLoading().then(() => {
    DAGCreator()
  });
});

watch(
  () => props.data,
  () => {
    if (DAGInstance) {
      DAGInstance.release()
    }
    DAGCreator()
  },
  {
    deep: true
  }
)

function zoomIn() {
  if (DAGInstance) {
    DAGInstance.zoomIn();
  }
}

function zoomOut() {
  if (DAGInstance) {
    DAGInstance.zoomOut();
  }
}

function fullScreen() {
  if (DAGInstance) {
    // DAGInstance.fullScreen()
  }
}

function setStatus(name: string, status: string): void;
function setStatus(name: object): void;
function setStatus(name: string | object, status?: string): void {
  if (isObject(name)) {
    for (const id in name) {
      const status = runningStatus((name as any)[id]);
      DAGInstance.setStatus(id, status);
    }
  } else {
    DAGInstance.setStatus(name, status);
  }
}

defineExpose({
  setStatus,
});
</script>

<style lang="scss" scoped>
.dag_graphic {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.btn_operation {
  position: absolute;
  bottom: 0px;
  left: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;

  .btn_icon {
    width: 20px;
    height: 20px;
    padding: 5px;
    margin: 5px;
    background-color: #bfbfbf;
    color: #ffffff;
    border-radius: 5px;

    &:hover {
      background-color: #d9d9d9;
    }

    &:active {
      background-color: #b3b3b3;
    }
  }
}
</style>
