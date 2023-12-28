<template>
  <FRow
    :label="label"
    :content="content"
    :min-width="120"
    :label-class-name="'f-imply-label'"
    :content-class-name="'f-imply-content'"
    class="f-imply"
  ></FRow>
</template>

<script lang="ts" setup>
import FRow from './Row.vue';

interface Props {
  label: string;
  content: string;
}
withDefaults(defineProps<Props>(), {
  label: '',
  content: '',
});
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.f-imply {
  :deep(.f-imply-label) {
    color: var(--el-color-info);
    font-size: $title-size;
  }

  :deep(.f-imply-content) {
    padding-left: $pale;
    color: var(--el-color-info-light-3);
    font-size: $text-size;
  }
}
</style>
