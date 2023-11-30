<template>
  <section class="f-split-container" :key="refresh">
    <section class="f-split-operation">
      <section class="f-split-header-left">
        <FSelection v-model="subSelected" :options="subOptions"></FSelection>
      </section>
      <section class="f-split-header-right">
        <el-radio-group v-if="!(radios.length <= 1 && options(radios[0]).length <= 0)" v-model="radioChecked" class="f-split-header-radios">
          <section v-for="(radio, key) in radios" :key="key" class="f-split-header-radio">
            <el-radio :label="radio" class="f-split-radio"></el-radio>
            <FSelection v-if="options(radio).length > 0" v-model="selectedList[radio]" :options="options(radio)" :disabled="radioChecked !== radio"></FSelection>
          </section>
        </el-radio-group>
      </section>
    </section>
    <section class="f-split-visual">
      <FTable :data="tableInfo.data" :header="tableInfo.header" :index="true" class="f-split=table"></FTable>
      <FLOBChart v-if="chart" :data="eventCountPic" class="f-split-chart"></FLOBChart>
      <FLOBChart v-if="chart" :data="woePic" class="f-split-chart"></FLOBChart>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref } from '@vue/runtime-core';
import { FSelection } from 'fate-ui-component';
import { isUndefined } from 'lodash-es';
import { watch } from 'vue';

const props = defineProps<{
  data: {
    [radioLabel: string]: {
      options?: any[],
      subOptions?: any[] | {
        [valueOfOptionsOrRadioLabel: string]: any[]
      },
      header?: any[] | {
        [valueOfSubOptions: string]: any[]
      },
      data: any[] | {
        [valueOfSubOptions: string]: any[]
      }
    }
  },
  header: any[],
  chart: boolean
}>()
const refresh = ref(0)

const radios = computed(() => {
  return Object.keys(props.data || {})
});
const radioChecked = ref(radios.value?.[0] || '')
watch(
  () => radios.value,
  () => {
    radioChecked.value = radios.value[0]
    selectedList.value = {}
  }
)

const selectedList = ref<any>({});
const options = function(radio: string) {
  const opts = props.data[radio]?.options || []
  if (isUndefined(selectedList.value[radio])) {
    const result = opts?.[0]?.value || radioChecked.value
    if (!isUndefined(result) && result !== '') {
      selectedList.value[radio] = result
    }
  }
  return opts
}

const subOptions = computed(() => {
  if (radioChecked.value) {
    const current = selectedList.value[radioChecked.value]
    const data = props.data[radioChecked.value]
    const list = data.subOptions
      ? ((Array.isArray(data.subOptions)
        ? data.subOptions
        : current 
          ? data.subOptions[current]
          : []))
      : []
    return list
  } else {
    return []
  }
})
const subSelected = ref(subOptions.value?.[0]?.value || '')
watch(
  () => subOptions.value,
  () => {
    subSelected.value = subOptions.value?.[0]?.value || ''
    refresh.value++
  },
  { deep: true }
)

const tableInfo = computed(() => {
  const tHeader = [...(props.header || [])]
  const tData: any = []
  if (radioChecked.value) {
    const data = props.data[radioChecked.value]
    if (data.header && Array.isArray(data.header)) {
      tHeader.push(...data.header)
    } else if (data.header) {
      tHeader.push(...data.header[subSelected.value])
    }

    if (data.data && Array.isArray(data.data)) {
      tData.push(...data.data)
    } else if (data.data) {
      tData.push(...(data.data[subSelected.value] || []))
    }
  }
  return {
    header: tHeader,
    data: tData
  }
})

const eventCountPic = computed(() => {
  const configuration: any = {
    xAxis: {
      type: 'category'
    }
  }
  const data = tableInfo.value.data
  if (data.length <= 0) {
    return {}
  }
  const event_count: any[] = []
  const event_radio: any[] = []
  const non_event_count: any[] = []
  const non_event_radio: any[] = []
  const split_range: any[] = []

  for (const each of data) {
    event_count.push(each.event_count)
    event_radio.push(each.event_ratio)
    non_event_count.push(each.non_event_count)
    non_event_radio.push(each.non_event_ratio)
    split_range.push(each.binning)
  }
  configuration.series = <any>[
    {
      name: 'event_count',
      type: 'bar',
      stack: 'total',
      data: event_count
    },
    {
      name: 'no_event_count',
      type: 'bar',
      stack: 'total',
      data: non_event_count
    }
  ]
  configuration.tooltip = <any>{
    formatter: (params: any | Array<any>) => {
      const index = (Array.isArray(params) ? params[0].dataIndex : params.dataIndex) || 0
      return `${split_range[index]}<br />
      Non_Event_Count: ${non_event_count[index]}<br />
      Non_Event_Radio: ${non_event_radio[index]}<br />
      Event_Count: ${event_count[index]}<br />
      Event_Radio: ${event_radio[index]}`
    }
  }
  return configuration
})

const woePic = computed(() => {
  const data = tableInfo.value.data
  if (data.length <= 0) {
    return {}
  }
  const woe: any[] = []
  const split_range: any[] = []
  const configuration = {
   xAxis: {
    type: 'category'
   },
   series: [],
   tooltip: {}
  }

  for (const each of data) {
    woe.push(each.woe)
    split_range.push(each.binning)
  }
  configuration.series = <any>[
    {
      name: 'woe',
      type: 'bar',
      data: woe
    },
    {
      name: 'woe_line',
      type: 'line',
      data: woe
    }
  ]
  configuration.tooltip = <any>{
    formatter: (params: any | Array<any>) => {
      const index = (Array.isArray(params) ? params[0].dataIndex : params.dataIndex) || 0
      return `${split_range[index]}<br />
      WOE: ${woe[index]}`
    }
  }
  return configuration
})

</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-split-container {
  @include flex-col();
  align-items: flex-start;
  justify-content: flex-start;

  & > * {
    width: 100%;
  }

  .f-split-operation {
    @include flex-row();
    align-items: center;
    justify-content: space-between;
    margin-bottom: $pale;

    .f-split-header-right {
      @include flex-row();
      align-items: flex-start;
      justify-content: flex-start;
    }

    .f-split-header-radios{
      @include flex-row();
      align-items: center;
      justify-content: flex-start;
    }

    .f-split-header-radio {
      @include flex-row();
      align-items: center;
      justify-content: flex-start;
      padding-right: $pale * 3;

      &:last-child {
        padding-right: 0px;
      }

      .f-split-radio {
        padding-right: math.div($pale, 3);
      }
    }
  }

  .f-split-visual {
    width: 100%;
    position: relative;
    @include flex-col();
    align-items: flex-start;
    justify-content: flex-start;

    & > * {
      width: 100%;
      margin-bottom: $pale;
    }

    .f-split-chart {
      position: relative;
      width: 100%;
      height: 550px;
      background-color: var(--el-bg-color);
      border: 1px solid var(--el-color-info-light-9);
      border-radius: 2px;
    }
  }
}
</style>