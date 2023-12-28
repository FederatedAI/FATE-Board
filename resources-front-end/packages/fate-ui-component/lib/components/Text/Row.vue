<template>
  <article class="fb-txRow">
    <slot name="prefix"></slot>

    <TOverflow
      v-if="label"
      :content="label"
      :class="classNameExplain(labelClassName, $props)"
      :style="{ width: labelWidth ? `${labelWidth}px` : '' }"
      class="fb-txRow-label"
    />
    <span
      v-if="label"
      :style="{ width: seperatorWidth ? `${seperatorWidth}px` : '' }"
      class="fb-txRow-seperator"
      >{{ seperator || ':' }}</span
    >
    <TOverflow
      :content="content"
      :class="
        Object.assign(
          {
            'fb-txRow-content': true,
            'fb-txRow-content--only': !label,
          },
          classNameExplain(contentClassName, $props)
        )
      "
      :style="{
        width: width ? `${width}px` : '',
        'mix-width': mixWidth ? `${mixWidth}px` : ''
      }"
    />

    <slot name="suffix"></slot>
  </article>
</template>

<script lang="ts" setup>
import classNameExplain from '@/utils/classNameExplain';
import TOverflow from './Overflow.vue';

defineProps([
  'label',
  'labelWidth',
  'content',
  'width',
  'mixWidth',
  'seperator',
  'seperatorWidth',
  'labelClassName',
  'contentClassName',
]);
</script>
