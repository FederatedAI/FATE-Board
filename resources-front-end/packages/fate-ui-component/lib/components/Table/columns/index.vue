<template>
  <FBTable></FBTable>
</template>

<script lang="ts" setup>
import { ElTable } from 'element-plus';
import { isFunction } from 'lodash';
import { h, watch } from 'vue';
import { classExplain } from '../cellExplain';
import { columnExplain } from './explain';

const props = defineProps([
  'data',
  'header',
  'rowClassName',
  'cellClassName',
  'index',
  'currentPage',
  'pageSize',
  'column',
  'maxHeight',
  'range'
]);
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

function initing () {
  const columns: any[] = [];
  let headers: any[] = [...(props.header || [])];
  if (props.index && headers.length > 0) {
    headers.unshift({ type: 'index', label: 'index', width: 80 });
  }

  const colExplain = (headers: any[]) => {
    const columns: any[] = [];
    for (const header of headers) {
      const col = h(
        <any>columnExplain(header),
        Object.assign({}, header, {
          currentPage: props.currentPage,
          pageSize: props.pageSize,
          column: props.column,
          range: props.range
        })
      );
      columns.push(col);
    }
    return columns;
  };

  columns.push(...colExplain(headers));
  return h(
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
}

let FBTable = initing()

watch(
  () => props.range,
  () => {
    console.log('normal col:', props.range)
    FBTable = initing()
  }
)
</script>
