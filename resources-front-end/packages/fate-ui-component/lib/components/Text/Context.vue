<template>
  <FColumn :title="title" :title-class-name="titleClassName" class="fb-context">
    <FRow
      v-for="(content, label) in maps"
      :key="label"
      :label="label"
      :label-width="labelWidth"
      :label-class-name="labelClassName"
      :content="content"
      :width="width"
      :content-class-name="contentClassName"
      class="fb-context-imply"
    />
  </FColumn>
</template>

<script lang="ts" setup>
import FColumn from './Column.vue';
import FRow from './Row.vue';

defineProps([
  'maps',
  'title',
  'titleClassName',
  'labelWidth',
  'labelClassName',
  'width',
  'contentClassName',
]);
</script>
