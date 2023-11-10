<template>
  <section class="fb-table">
    <Columns
      :data="data"
      :header="header"
      :row-class-name="rowClassName"
      :cell-class-name="cellClassName"
      :current-page="currentPage"
      :page-size="pageSize"
      :index="index"
      :max-height="maxHeight"
      class="fb-table-columns"
      @sort-change="sortChange"
    />
    <ElPagination
      v-if="total"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      hide-on-single-page
      :small="true"
      layout="total, sizes, prev, pager, next"
      :total="total"
      class="fb-table-pagination"
      @size-change=""
    />
  </section>
</template>

<script lang="ts" setup>
import { ElPagination } from 'element-plus';
import { ref, watch } from 'vue';
import Columns from './columns/index.vue';

const props = defineProps(['total', 'header', 'data', 'current', 'size', 'index', 'rowClassName', 'cellClassName', 'maxHeight']);
const emits = defineEmits(['sizeChange', 'currentChange', 'sortChange', 'sizeChange']);

const currentPage = ref(props.current || 1);
const pageSize = ref(props.size || 20);

watch(
  () => currentPage.value,
  () => {
    emits('currentChange', currentPage.value, pageSize.value);
  }
);

watch(
  () => pageSize.value,
  () => {
    emits('sizeChange', pageSize.value);
    currentPage.value = 1;
  }
);

const sortChange = (parameter: any) => {
  emits('sortChange', parameter)
}

const sizeChange = (parameter: any) => {
  emits('sizeChange', parameter)
}

defineExpose({
  pageChange: (page: number) => (currentPage.value = page),
});
</script>
