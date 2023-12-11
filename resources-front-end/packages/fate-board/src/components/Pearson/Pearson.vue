<template>
  <section class="f-p-container">
    <FTable
      class="f-p-table"
      :header="header"
      :data="data"
      :pageSize="10"
      :total="total"
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
        >
        </FHeatMap>
      </section>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import RoleSelection from './selection.vue';

const props = defineProps([
  'header',
  'data',
  'localCorr',
  'remoteCorr',
  'localData',
  'remoteData',
]);
const total = computed(() => {
  return props.data ? props.data.length : 0;
});

const selectonRole = [
  {
    label: 'all',
    value: 'all',
  },
  {
    label: 'guest',
    value: 'guest',
  }
];
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
      row.push(result);
    }
    corrData.push(row);
  }
  return corrData;
});

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