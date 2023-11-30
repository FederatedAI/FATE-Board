<template>
  <section class="f-tree-select">
    <FTabsBySelection
      v-model="TabSelected"
      label="model label"
      :options="TabOptions">

      <template #beforeTab>
        <article class="f-tree-title">Tree</article>
      </template>

      <template #afterTab>
        <article class="f-tree-gradient">
          <FColorGradient label="tree size" :maxColor="SubTabColor" :size="10"></FColorGradient>
        </article>
      </template>

      <template #afterHeader>
        <section v-if="false" class="f-tree-search">
          <FInput class="f-tree-input"></FInput>
        </section>
      </template>

      <template #default>
        <section class="f-tree-content">
          <section class="f-tree-selection">
            <FSelectionChart :color="SubTabColor" :options="SubTabOptions" @change="change"/>
          </section>
          <section v-show="chartData" v-loading="chartLoading" class="f-tree-chart">
            <FTree :data="chartData" :color="SubTabColor"/>
          </section>
          <section v-show="tableData" v-loading="tableLoading" class="f-tree-feature-importance">
            <FTable :header="tableHeader" :data="tableData" maxHeight="400" index></FTable>
          </section>
        </section>
      </template>
    </FTabsBySelection>
  </section>
</template>

<script lang="ts" setup>
import { isFunction } from '@vue/shared';
import { FColorGradient, FInput, FSelectionChart, FTable, FTabsBySelection } from 'fate-ui-component';
import { FTree } from 'fate-visualization';
import { computed, nextTick, ref, watch } from 'vue';

/**
 * {
 *    label: [
 *      {
 *        label: string,
 *        weight: number,
 *        value: {
 *          chart: object,
 *          table: Array<object>
 *        }
 *      }
 *    ]
 * }
 */
const props = defineProps<{
  options: { [name: string]: Array<any> }
}>()

const basicColor = [
  'rgba(64,158,255,1)',
  'rgba(103,194,58,1)',
  'rgba(230,162,60,1)',
  'rgba(245,108,108,1)',
  'rgba(144,147,153,1)',
  'rgba(255,161,64,1)',
  'rgba(149,58,194,1)',
  'rgba(60,128,230,1)',
  'rgba(108,245,245,1)',
]

const TabOptions = computed(() => {
  const options = <any[]>[]
  for (const key in props.options) {
    options.push({
      label: key,
      value: key
    })
  }
  return options
})
const TabSelected = ref(TabOptions.value[0] ? TabOptions.value[0].value : '')

const SubTabColor = computed(() => {
  const cursor = TabOptions.value.findIndex((item:any) => item.value === TabSelected.value )
  const index = cursor < 0 ? 0 : cursor
  return basicColor[index % basicColor.length]
})
const SubTabOptions = computed(() => {
  return props.options[TabSelected.value]
})

const chartData = ref<any>({})
const chartLoading = ref<any>(true)
const tableData = ref<any>([])
const tableLoading = ref<any>(true)
const tableHeader = [{
  label: 'variable',
  prop: 'variable',
}, {
  type: 'progress',
  label: 'importance',
  prop: 'importance'
}]

const change = (value: any) => {
  if (value.chart) {
    chartLoading.value = true
    const chartValue = value.chart
    if (isFunction(chartValue)) {
      chartData.value = chartValue()
    } else {
      chartData.value = chartValue
    }
    nextTick(() => {
      chartLoading.value = false
    })
  } else {
    chartData.value = undefined
  }

  if (value.table) {
    const tableValue = value.table
    if (isFunction(tableValue)) {
      tableData.value = tableValue()
    } else {
      tableData.value = tableValue
    }
    nextTick(() => {
      tableLoading.value = false
    })
  } else {
    tableData.value = undefined
  }
}

watch(
  () => props.options,
  () => TabSelected.value = TabOptions.value[0] ? TabOptions.value[0].value : '',
  { deep: true }
)
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';
.f-tree-select {
  position: relative;
  @include box-stretch();

  .f-tree-title {
    @include title-3-size();
    color: var(--el-color-info-dark-3);
    padding-right: $pale * 3;
  }

  .f-tree-gradient {
    position: relative;
    width: 300px;
    padding-left: $pale * 3;
  }

  .f-tree-content {
    @include flex-col();
    justify-content: flex-start;
    align-items: center;

    .f-tree-selection {
      position: relative;
      width: 100%;
      height: 60px;
      margin-bottom: $pale;
      background-color: var(--el-bg-color);
      border: 1px solid var(--el-color-info-light-9);
      border-radius: 2px;
    }

    .f-tree-chart {
      position: relative;
      width: 100%;
      height: 500px;
      margin-bottom: $pale;
      background-color: var(--el-bg-color);
      border: 1px solid var(--el-color-info-light-9);
      border-radius: 2px;
      overflow: hidden;
    }

    .f-tree-feature-importance {
      position: relative;
      width: 100%;
      margin-bottom: $pale;
    }
  }
}
</style>
