<template>
  <article
    :class="classNameExplain(colClassName, $props, $attrs)"
    class="fb-txColumn"
  >
    <TRow
      :content="title"
      :width="titleWidth"
      :content-class-name="titleClassName"
      class="fb-txColumn-title"
    />
    <slot></slot>
  </article>
</template>

<script lang="ts" setup>
import classNameExplain from '@/utils/classNameExplain';
import TRow from './Row.vue';

defineProps(['title', 'titleWidth', 'titleClassName', 'colClassName']);
</script>
