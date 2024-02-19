<template>
  <section class="fb-table">
    <section class="fb-table-searching">
      <section><slot name="header"></slot></section>
      <SearchInput
        v-if="needSearch"
        class="fb-table-pagination-search"
        @change="rowChange">
      </SearchInput>
    </section>
    <Columns
      ref="columnsInstance"
      :data="currentData()"
      :header="currentHeader()"
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
      :layout="layout || 'total, prev, pager, next'"
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
import { column } from 'element-plus/es/components/table-v2/src/common';
import { isNumber } from 'lodash';
import { computed, nextTick, ref, watch } from 'vue';
import Columns from './columns/index.vue';
import SearchInput from './component/SearchInput.vue';

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
  'range', // table cell exchange according to range
  'showOverflow',
  'needToRefresh',
  'needSearch'
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
const currentHeader = () => {
  const columns = props.column && props.header
  ? props.header.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
  : props.header
  if (props.showOverflow !== false && Array.isArray(columns)) {
    for (const each of columns) {
      if (!each.type) {
        each.showOverflowTooltip = true
      }
    }
  }
  return columns
}

const currentData = () => {
  return (!props.column && props.total !== undefined && props.total !== false && props.data.length > pageSize.value && props.data)
    ? props.data.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
    : props.data
  }

const refresh = ref(0)
const columnsInstance = ref()

let lastCursor = -1
function rowSelection (search: string) {
  let cursorFound = false
  for (let i = lastCursor + 1; i < props.data.length; i++) {
    const row = props.data[i]
    for (const key in row) {
      if (row[key].toString().match(new RegExp(search, 'i'))) {
        cursorFound = true
        break
      }
    }
    if (cursorFound) {
      lastCursor = i
      break
    }
  }
  if (cursorFound) {
    currentPage.value = Math.floor(lastCursor / pageSize.value) + 1
    nextTick(() => {
      columnsInstance.value.rowSelection(props.data[lastCursor])
    })
  } else {
    lastCursor = -1
  }
  return cursorFound
}


const rowChange = (filter: string) => {
  rowSelection(filter)
}

watch(
  () => props.header,
  () => {
    currentPage.value = 1;
    nextTick(() => {
      refresh.value++
    })
  },
  { deep: true }
);

watch(
  () => props.data,
  () => {
    if (props.needToRefresh !== false) {
      refresh.value++
    }
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
