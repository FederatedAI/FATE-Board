<template>
  <section class="f-p-container">
    <FTable
      class="f-p-table"
      :header="header"
      :data="data"
      :size="10"
      :total="data.length"
      :index="true"
    >
    </FTable>
    <section class="f-p-map">
      <section class="f-p-map-header">
        <section class="f-p-map-operation">
          <FSelection
            v-if="remoteCorr && remoteCorr.length > 0"
            v-model="selected"
            :label="'role'"
            :options="selectonRole"
            class="f-p-map-o-select"
          ></FSelection>
          <RoleSelection
            :corr="correlation"
            class="f-p-map-o-transfer"
            @change="correlationChange"
          ></RoleSelection>
        </section>
        <section>
          <el-checkbox v-model="checked" @change="coefficient"
            >Correlation coefficient</el-checkbox
          >
        </section>
      </section>
      <section>
        <FHeatMap
          ref="pearsonMap"
          :x="correlationCurr"
          :y="correlationCurr"
          :data="correlationData"
          :max="1"
          :min="0"
          :pearson="false"
          :ext="tooltipFormatter"
        >
        </FHeatMap>
      </section>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useStore } from 'vuex';
import RoleSelection from './selection.vue';

const store = useStore()
const props = defineProps([
  'header',
  'data',
  'localCorr',
  'remoteCorr',
  'localData',
  'remoteData',
]);

const role = computed(() => store.state.job.details?.fRole);
const selectonRole = [
  {
    label: 'all',
    value: 'all',
  },
];
if (role.value?.match(/guest/i)) {
  selectonRole.push({
    label: 'guest',
    value: 'guest',
  })
}
if (role.value?.match(/host/i)) {
  selectonRole.push({
    label: 'host',
    value: 'guest',
  })
}
const selected = ref('all');
const correlation = ref<string[]>([]);

const correlationExaplain = () => {
  correlation.value.length = 0;
  if (selected.value.match(/all/i)) {
    correlation.value.push(...props.localCorr);

    if (props.remoteCorr && props.remoteCorr.length > 0) {
      correlation.value.push(...props.remoteCorr);
    }
  } else if (selected.value.match(/guest/i)) {
    correlation.value.push(...props.localCorr);
  } else {
    correlation.value.push(...props.remoteCorr);
  }
  correlationCurr.value.length = 0;
  correlationCurr.value.push(...correlation.value);
};

const correlationChange = (result: string[]) => {
  correlationCurr.value.length = 0;
  correlationCurr.value.push(...result);
};

const correlationCurr = ref<string[]>([]);
const checked = ref(false);
const pearsonMap = ref();

const correlationData = computed(() => {
  const corrData = <any>[];
  for (let i = 0; i < correlationCurr.value.length; i++) {
    const row = [];
    const x = correlationCurr.value[i];
    const yCorr = correlationCurr.value;
    for (let j = 0; j < yCorr.length; j++) {
      const y = yCorr[j];
      const xImply = props.localData[x] || props.remoteData[x] || {};
      let result = xImply[y] ? Number(xImply[y].toFixed(6)) : xImply[y]
      if (!result) {
        const yImply = props.localData[y] || props.remoteData[y] || {};
        result = yImply[x] ? Number(yImply[x].toFixed(6)) : yImply[x]
      }
      if (!result) {
        const yImply = props.remoteData[x] || props.remoteData[x] || {};
        result = yImply[y] ? Number(yImply[y].toFixed(6)) : yImply[y]
      }
      if (!result) {
        const yImply = props.remoteData[y] || props.remoteData[y] || {};
        result = yImply[x] ? Number(yImply[x].toFixed(6)) : yImply[x]
      }
      row.push(result);
    }
    corrData.push(row);
  }
  return corrData;
});

const tooltipFormatter = {
  tooltip: {
    formatter: (params: any) => {
      const [xc, yc, data] = params.data
      const x = correlation.value[xc]
      const y = correlation.value[yc]
      let getAnonym = (imp: any) => {
        const cursor = props.data.findIndex((item: any) => item.variable === imp)
        if (cursor >= 0) {
          return props.data[cursor].anonym
        }
        return ''
      }
      const xanony = getAnonym(x)
      const yanony = getAnonym(y)
      return `features: ${x}${xanony ? '(' + xanony + ')' : ''}, ${y}${yanony ? '(' + yanony + ')' : ''} <br /> coefficient: ${data}`
    }
  }
}

const coefficient = () => {
  pearsonMap.value.displayLabel();
};

onBeforeMount(() => {
  correlationExaplain();
});

watch(
  () => selected.value,
  () => {
    correlationExaplain();
  }
);
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-p-container {
  position: relative;
  width: 100%;
  @include flex-row();
  align-items: flex-start;
  justify-content: space-between;

  .f-p-table {
    flex: 0 0 auto;
    max-width: 450px;
    margin-right: $pale;
  }

  .f-p-map {
    position: relative;
    flex: 1 1 auto;
    width: calc(100% - 450px);
    min-height: 600px;
    @include flex-col();
    padding: 0px $pale;
    background: var(--el-bg-color);
    border: 1px solid var(--el-color-info-light-9);
    border-radius: 2px;
    padding-top: 12px;
  }

  .f-p-map-header {
    @include flex-row();
    @include flex-stretch();
    width: 100%;
    margin-bottom: $pale;
    z-index: 5;
  }

  .f-p-map-operation {
    @include flex-row();
    align-items: center;
    justify-content: flex-start;
  }

  .f-p-map-o-select {
    margin-right: $pale;
  }
}
</style>
