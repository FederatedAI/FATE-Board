<template>
  <el-popover
    placement="bottom"
    trigger="click"
    width="600">
    <template #reference>
      <span class="transfer-label">select</span>
    </template>
    <el-transfer
      v-model="value"
      :data="data"
      filterable
      @change="change">
    </el-transfer>
  </el-popover>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

const props = defineProps(['corr'])
const emits = defineEmits(['change'])

const value = ref([])
const data = computed(() => {
  if (props.corr) {
    return props.corr.map((item: string) => {
      return {
        label: item,
        key: item
      }
    })
  }
  return []
})

watch(
  () => props.corr,
  () => {
    value.value.length = 0
  }
)

const change = () => {
  emits('change', value.value)
}
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';

.transfer-label {
  color: var(--el-color-primary);
  cursor: pointer;
}
</style>
