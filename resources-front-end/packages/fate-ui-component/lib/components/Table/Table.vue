<template>
  <section class="fb-table">
    <Columns
      :data="currentData"
      :header="currentHeader"
      :row-class-name="rowClassName"
      :cell-class-name="cellClassName"
      :current-page="currentPage"
      :page-size="pageSize"
      :index="index"
      :column="column"
      :max-height="maxHeight"
      :range="range"
      v-bind="$attrs"
      :key="refresh"
      class="fb-table-columns"
      @sort-change="sortChange"
    />
    <ElPagination
      v-if="currentTotal"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      hide-on-single-page
      :small="true"
      :layout="layout || 'total, sizes, prev, pager, next'"
      :total="currentTotal"
      background
      class="fb-table-pagination"
      :class="{
        'fb-table-pagination-center': position && position.match(/center/i),
        'fb-table-pagination-right': position && position.match(/right/i)
      }"
    />
  </section>
</template>

<script lang="ts" setup>
import { ElPagination } from 'element-plus';
import { isNumber } from 'lodash';
import { computed, ref, watch } from 'vue';
import Columns from './columns/index.vue';

const props = defineProps([
  'total',
  'header',
  'data',
  'current',
  'size',
  'index',
  'rowClassName',
  'cellClassName',
  'maxHeight',
  'column',
  'layout',
  'position',
  'range' // table cell exchange according to range
]);
const emits = defineEmits([
  'sizeChange',
  'currentChange',
  'sortChange',
  'sizeChange',
]);

const currentTotal = computed(() => props.column 
  ? props.header
    ? props.header.length
    : 0
  : isNumber(props.total)
    ? props.total
    : props.total === true
      ? props.data.length
      : undefined
);
const currentPage = ref(props.current || 1);
const pageSize = ref(props.column
  ? Number(props.size) || 10
  : Number(props.size) || 20
);
const currentHeader = computed(() => props.column && props.header
  ? props.header.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
  : props.header
);
const currentData = computed(() => {
  return (!props.column && props.total !== undefined && props.total !== false && props.data.length > pageSize.value && props.data)
    ? props.data.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
    : props.data
  }
)
const refresh = ref(0)

watch(
  () => props.header,
  () => {
    currentPage.value = 1;
    // refresh.value++
  },
  { deep: true }
);

watch(
  () => props.data,
  () => {
    // refresh.value++
  },
  { deep: true }
)

watch(
  () => currentPage.value,
  () => {
    emits('currentChange', currentPage.value, pageSize.value);
    refresh.value++
  }
);

watch(
  () => pageSize.value,
  () => {
    currentPage.value = 1;
    emits('sizeChange', pageSize.value);
    refresh.value++
  }
);

const sortChange = (parameter: any) => {
  emits('sortChange', parameter);
};

defineExpose({
  pageChange: (page: number) => (currentPage.value = page),
});
</script>
