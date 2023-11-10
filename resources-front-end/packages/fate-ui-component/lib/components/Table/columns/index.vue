<template>
  <FBTable></FBTable>
</template>

<script lang="ts" setup>
import { ElTable } from 'element-plus';
import { isFunction } from 'lodash';
import { h } from 'vue';
import { classExplain } from '../cellExplain';
import { columnExplain } from './explain';

const props = defineProps(['data', 'header', 'rowClassName', 'cellClassName', 'index', 'currentPage', 'pageSize', 'headerPagination', 'maxHeight']);
const emits = defineEmits(['sortChange']);


function rowClassName(scope: any) {
  const extRow = props.rowClassName
    ? isFunction(props.rowClassName)
      ? props.rowClassName(scope)
      : props.rowClassName
    : [];
  return [...classExplain({ row: scope.row }), ...[extRow].flat(Infinity)].join(
    ' '
  );
}

function cellClassName(scope: any) {
  const extCell = props.cellClassName
    ? isFunction(props.cellClassName)
      ? props.cellClassName(scope)
      : props.cellClassName
    : [];
  return [...classExplain(scope), ...[extCell].flat(Infinity)].join(' ');
}

function sortChange({ column, order }: any) {
  emits('sortChange', { col: column.property, order });
}

const columns: any[] = [];
let headers: any[] = [...(props.header || [])]
if (props.index) {
  headers.unshift({ type: 'index' })
}
const colExplain = (headers: any[]) => {
  const columns: any[] = [];
  for (const header of headers) {
    const col = h(
      <any>columnExplain(header),
      Object.assign({}, header, { currentPage: props.currentPage, pageSize: props.pageSize })
    );
    columns.push(col);
  }
  return columns;
};
columns.push(...colExplain(headers));
const FBTable = h(
  ElTable,
  {
    data: props.data,
    fit: true,
    stripe: true,
    maxHeight: props.maxHeight,
    highlightCurrentRow: true,
    emptyText: 'NO DATA',
    cellClassName,
    rowClassName,
    onSortChange: sortChange,
  },
  columns
);
</script>
