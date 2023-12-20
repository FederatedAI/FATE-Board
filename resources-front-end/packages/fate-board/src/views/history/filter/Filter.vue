<template>
  <section ref="filterContainer" class="h-filter">
    <el-form
      :inline="true"
      :model="filter"
      label-width="70px"
      class="h-filter-form"
      @keydown.enter="$emit('search', filter)"
    >
      <el-form-item label="Job ID">
        <el-input v-model="filter.job_id" size="small" clearable @clear="$emit('search', filter)"/>
      </el-form-item>
      <el-form-item label="Role">
        <el-select v-model="filter.role" size="small" placeholder=" " clearable collapse-tags multiple @clear="$emit('search', filter)">
          <el-option
            v-for="(item, index) in role"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Party ID">
        <el-input v-model="filter.party_id" size="small" clearable @clear="$emit('search', filter)"/>
      </el-form-item>
      <el-form-item label="Partner">
        <el-input v-model="filter.partner" size="small" clearable @clear="$emit('search', filter)"/>
      </el-form-item>
      <el-form-item label="Status">
        <el-select v-model="filter.status" size="small" placeholder=" " clearable collapse-tags multiple @clear="$emit('search', filter)">
          <el-option
            v-for="(item, index) in status"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Note">
        <el-input v-model="filter.note" size="small" clearable />
      </el-form-item>
    </el-form>
    <el-button
      type="primary"
      round
      size="small"
      class="h-filter-btn"
      @click="$emit('search', filter)"
      >Search</el-button>
  </section>
</template>

<script lang="ts" setup>
import { resizeObserve } from 'fate-ui-component';
import { defineEmits, defineProps, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

defineProps(['role', 'status']);
const emits = defineEmits(['search', 'resize']);
const filter = reactive({
  job_id: '',
  role: [],
  party_id: '',
  partner: '',
  status: [],
  note: '',
});
const filterContainer = ref()
let ro: any

onMounted(() => {
  const calc = () => {
    if (filterContainer.value.getBoundingClientRect) {
      const size = filterContainer.value.getBoundingClientRect()
      emits('resize', size)
    }
  }
  calc()
  ro = resizeObserve(calc)
  ro.observer(filterContainer.value)
})

onBeforeUnmount(() => {
  if (ro) {
    ro.unobserver()
    ro = undefined
  }
})

</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.h-filter {
  @include flex-row();
  justify-content: flex-end;
  align-items: flex-start;

  margin-top: math.div($pale, 2);

  :deep(.el-form-item) {
    margin-bottom: math.div($pale, 4);
    margin-right: $pale;
  }

  :deep(.el-form-item__content) {
    max-width: 140px;
  }

  .h-filter-btn {
    padding: 0px $pale;
    margin-top: 2px;
    margin-left: $pale;
  }
}
</style>
