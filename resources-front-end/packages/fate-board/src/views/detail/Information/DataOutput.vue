<template>
  <section class="f-info-data-container">
    <section class="f-info-data-header">
      <article class="f-info-data-title">
        Outputting {{ dataTotal[selected ? Number(selected) || 0 : 0] }} instance
        <span>(only 100 instance are shown in the table)</span>
      </article>
      <FSelection
        v-if="selections.length > 1"
        v-model="selected"
        :options="selections"
        class="f-info-data-selection"
      ></FSelection>
    </section>
    <section class="f-info-data-body">
      <FTable
        :header="dataTableHeader[selected ? Number(selected) || 0 : 0] || []"
        :data="dataTableData[selected ? Number(selected) || 0 : 0] || []"
        :column="true"
        :index="true"
        class="f-info-data-table"
      ></FTable>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const selections = ref<any>([]);
const selected = ref(selections.value[0] ? selections.value[0].value : '');
const dataTableHeader = ref([]);
const dataTableData = ref([]);
const dataTotal = ref([])

const dataRequest = async () => {
  const response = await store.dispatch('dataOutput');
  const { output_data } = response;
  const options: any = [];
  const tableHeader: any = [];
  const tableData: any = [];
  const total: any = []
  for (let i = 0; i < output_data.length; i++) {
    const each = output_data[i];
    const { data, metadata } = each;
    const { anonymous_summary, fields } = metadata.schema_meta;
    options.push({
      label: anonymous_summary.site_name,
      value: i,
    });
    tableHeader.push(
      (() => {
        const list: any = [];
        for (const item of fields) {
          list.push({
            label: item.name,
            prop: item.property,
          });
        }
        return list;
      })()
    );
    tableData.push(
      (() => {
        const header = tableHeader[tableHeader.length - 1];
        const list: any = [];
        for (const item of data) {
          const row: any = {};
          for (let j = 0; j < header.length; j++) {
            row[header[j].prop] = item[j];
          }
          list.push(row);
        }
        return list;
      })()
    );
    total.push(tableData[tableData.length - 1].length)
  }
  selections.value = options;
  dataTableHeader.value = tableHeader;
  dataTableData.value = tableData;
  dataTotal.value = total
};

watch(
  () => selections.value,
  () => {
    selected.value = selections.value[0] ? selections.value[0].value : '';
  },
  { deep: true }
);

onMounted(async () => {
  await dataRequest();
});
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';
.f-info-data-container {
  @include box-stretch();
  @include flex-col();
  align-items: flex-start;
  justify-content: flex-start;

  .f-info-data-header {
    width: 100%;
    flex: 0 0 45px;
    @include flex-row();
    align-items: center;
    justify-content: space-between;
    margin-bottom: $pale;
  }

  .f-info-data-body {
    position: relative;
    width: 100%;
    height: calc(100% - 45px);
    flex: 1 1 auto;
    overflow: hidden;

    .f-info-data-table {
      @include box-stretch();
    }
  }
}
</style>
