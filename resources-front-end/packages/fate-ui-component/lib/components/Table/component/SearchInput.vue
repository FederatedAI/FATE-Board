<template>
  <ElInput v-model="content" placeholder="Search Input" @keydown.enter.stop="searching">
    <template #append>
      <ElButton :icon="Search" @click="searching"/>
    </template>
  </ElInput>
</template>

<script lang="ts" setup>
import { Search } from '@element-plus/icons-vue';
import { ElButton, ElInput } from 'element-plus';
import { ref } from 'vue';

const emits = defineEmits(['change'])

const content = ref('')
const searching = () => {
  emits('change', content.value)
}
</script>

<style lang="scss" scoped>

</style>
