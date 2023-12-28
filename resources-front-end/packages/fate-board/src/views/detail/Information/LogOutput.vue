<template>
  <section class="f-info-log-container">
    <section v-if="!logs" class="f-info-log-hint">Loading...</section>
    <section v-else-if="!logs.length" class="f-info-log-hint">No Data</section>
    <LoggerScroll v-else :logs="logs" @scroll-top="handleScrollTop" class="f-info-log-logger"></LoggerScroll>
  </section>
</template>

<script lang="ts" setup>
import LoggerScroll from '@/views/dashboard/Log/LoggerScroll.vue';
import { WSConnect } from 'fate-tools';
import { onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

let sizeInterval: any = null;
const logs = ref<any>(null);
const logSize = ref<any>(0);
const logType = ref<any>('');

let ws: any;
async function initLogSocket () {
  const jobId = await store.dispatch('GET_JOBID');
  const partyId = await store.dispatch('GET_PARTYID');
  const role = await store.dispatch('GET_JOB_ROLE');
  const componentName = await store.dispatch('getComponentName');
  if (!jobId || !role || !partyId || !componentName) {
    console.warn(`Missing required parameters`);
  }
  ws = new WSConnect(`/log/new/${jobId}/${role}/${partyId}/${componentName}`);
  ws.addEventListener('message', (event: any) => {
    handleLogMessage(JSON.parse(event.data));
  });
  ws.addEventListener('open', () => {
    onSizePull();
  });
};

function handleLogMessage(data: any) {
  const type =
    parseInt(data.componentInfo) === data.componentInfo
      ? 'logSize'
      : 'componentInfo';
  switch (type) {
    case 'logSize':
      handleLogSizeResponse(data);
      break;
    case 'componentInfo':
      insertLogs(data);
      break;
    default:
      break;
  }
}

function handleLogSizeResponse(data: any) {
  const entries = Object.entries(data)[0];
  logType.value = entries[0];
  logSize.value = entries[1];
}

function handleScrollTop() {
  onPull();
}

function onSizePull() {
  const pull = () => {
    ws &&
      ws.send(
        JSON.stringify({
          type: 'logSize',
        })
      );
    const statusForComp = store.state.comp.information.status
    if (statusForComp && !statusForComp.match(/wait|running/i)) {
      if (sizeInterval) {
        clearInterval(sizeInterval)
        sizeInterval = null
        if (!logs.value) {
          logs.value = []
        }
      }
    }
  };
  pull();
  sizeInterval = setInterval(pull, 10000);
}

function onPull(backward = true) {
  const count = logSize.value;
  const size = 50;
  const logss = logs.value || [];
  let begin;
  let end;
  if (!logss.length) {
    end = count;
    begin = Math.max(end - size, 1);
  } else {
    if (backward) {
      end = logss[0].lineNum - 1;
      begin = Math.max(1, end - size);
    } else {
      begin = logss[logss.length - 1].lineNum + 1;
      end = count;
    }
  }
  if (count > 0) {
    if (end < begin) {
      return;
    }
    ws &&
      ws.send(
        JSON.stringify({
          type: logType.value,
          begin,
          end,
        })
      );
  } else {
    logs.value = [];
  }
}

function insertLogs(data: any) {
  const { data: target } = data;
  const logss = logs.value || [];
  let result: any = [];
  if (logss.length) {
    result = result.concat(logss, target);
    result.sort((a: any, b: any) => {
      return a.lineNum - b.lineNum;
    });
    let len = result.length;
    let lineNum;
    while (--len > -1) {
      if (lineNum === result[len].lineNum) {
        result.splice(len, 1);
      } else {
        lineNum = result[len].lineNum;
      }
    }
  } else {
    result = target;
  }
  result = result.map((item: any) => Object.freeze(item));
  logs.value = result;
}

function clearData() {
  if (sizeInterval) {
    clearInterval(sizeInterval)
  }
  sizeInterval = null;
  logs.value = null;
  logSize.value = 0;
  logType.value = '';
}

function closeSocket() {
  ws && ws.close();
  ws = null;
}

watch(
  () => logSize.value,
  (val: any) => {
    if (val) {
      onPull(false)
    }
  }
)

watch(
  () => store.state.comp.information,
  () => {
    clearData()
    closeSocket()
    initLogSocket()
  },
  { deep: true }
)

onBeforeMount(async () => {
  await initLogSocket()
})

onBeforeUnmount(() => {
  clearData()
  closeSocket()
})

const refreshing = () => {
  clearData()
  closeSocket()
  initLogSocket()
}
defineExpose({
  refresh: refreshing()
})

</script>

<style lang="scss" scoped>
@import '@/style/index.scss';

.f-info-log-container {
  position: relative;
  @include box-stretch();
}

.f-info-log-hint {
  min-height: 100px;
  width: 100%;
  @include flex-row();
  @include flex-center();
}

.f-info-log-logger {
  @include box-stretch();
  background-color: var(--el-bg-color);
  border-radius: 2px;
  border: 1px solid var(--el-color-info-light-9);
  padding: $pale;
}
</style>
