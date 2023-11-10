<template>
  <section class="h-list">
    <header class="h-list-header">
      <FCrumbs />
    </header>
    <main class="h-list-body">
      <Filter ref="filter" :role="role" :status="status" @search="search" @resize="filterResize" class="h-list-filter"/>
      <TableVue ref="table" class="h-list-table" :style="tableStyle"/>
    </main>
  </section>
</template>

<script lang="ts" setup>
import { FCrumbs } from '@/components/Crumbs';
import { computed, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import Filter from './filter/Filter.vue';
import TableVue from './table/Table.vue';

const store = useStore();

const role = computed(() => {
  const role = store.state.assets.role;
  return role ? role.reduce((pre: any[], role: string) => {
    pre.push({ label: role, value: role });
    return pre;
  }, []) : [];
});

const status = computed(() => {
  const status = store.state.assets.status;
  return status ? status.reduce((pre: any[], role: string) => {
    pre.push({ label: role, value: role });
    return pre;
  }, []) : [];
});

const table = ref()
const search = (data: object) => {
  table.value.search(data)
};

const tableStyle = reactive<any>({})
const filterResize = (rect: any) => {
  tableStyle.height = `calc(100% - ${rect.height + 12 * 2}px)`
}

</script>

<style lang="scss" scoped>
@import '@/style/index.scss';

.h-list {
  position: relative;
  width: 100%;
  height: 100%;
  @include flex-col();
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;

  .h-list-header {
    width: 100%;
    height: $pale * 2;
    min-height: $pale * 1.5;
    @include flex-freeze();
  }

  .h-list-body {
    width: 100%;
    max-height: calc(100% - $pale * 2);
    @include flex-col();
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 1;

    .h-list-filter {
      width: 100%;
      flex-shrink: 1;
      flex-grow: 0;
    }

    .h-list-table {
      width: 100%;
      flex-shrink: 2;
      flex-grow: 2;
    }
  }
}
</style>