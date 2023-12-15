<template>
  <div ref="container" class="dag_graphic" @click.stop="chooseWhole"></div>
  <div v-if="operation !== false" @dbclick.stop @click.stop class="btn_operation">
    <FullScreen @click.stop="fullScreen" class="btn_icon" />
    <Minus @click.stop="zoomIn" class="btn_icon" />
    <Plus @click.stop="zoomOut" class="btn_icon" />
  </div>
</template>

<script lang="ts" setup>
import { FullScreen, Minus, Plus } from '@element-plus/icons-vue';
import { select } from 'd3';
import { isObject, isUndefined } from 'lodash';
import { onMounted, ref, watch } from 'vue';
import DAG from './DAGContainer';
import runningStatus from './runningStatus';
import { SVGLoading } from './svg';

const props = defineProps(['data', 'operation', 'mini']);
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
    if (props.mini) {
      DAGInstance.zoomIn(0.5)
    }
    if (DAGInstance) {
      emits('loaded')
    }
  }
}

function chooseWhole () {
  if (DAGInstance) {
    DAGInstance.chooseWhole()
  }
}

onMounted(() => {
  SVGLoading().then(() => {
    DAGCreator()
  });
});

watch(
  () => props.data,
  (newValue: any, oldValue: any) => {
    if (!DAGInstance) {
      DAGCreator()
      // DAGInstance.release()
    } else {
      let match = true
      for(const key in newValue.component_module) {
        if (isUndefined(oldValue.component_module[key])) {
          match = false
          break
        }
      }
      // not match
      if (!match) {
        DAGInstance.release()
        DAGCreator()
      } else {
        for (const comp of (newValue?.component_list || [])) {
          DAGInstance.setStatus(comp.component_name, runningStatus(comp.status), (new Date().getTime() - comp.time || 0))
        }
      }
    }
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

function setStatus(name: string, status: string, duration?: number): void;
function setStatus(name: object): void;
function setStatus(name: string | object, status?: string, duration = 0): void {
  if (isObject(name)) {
    for (const id in name) {
      const info = <any>(name as any)[id]
      if (!isObject(info)) {
        const status = runningStatus(info);
        DAGInstance.setStatus(id, status);
      } else {
        const status = runningStatus((info as any).status);
        DAGInstance.setStatus(id, status, (info as any).duration);
      }
    }
  } else {
    DAGInstance.setStatus(name, status, duration);
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
