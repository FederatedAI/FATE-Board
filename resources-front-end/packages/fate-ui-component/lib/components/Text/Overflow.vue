<template>
  <ElTooltip
    :disabled="disabled"
    :content="content"
    :effect="effect"
    :placement="placement"
  >
    <article
      ref="wordSection"
      class="fb-txOverflow"
      :class="$attrs.class"
      :style="$attrs.style as any"
    >
      <slot name="prefix"></slot>
      <span v-if="content" class="fb-txOverflow-content">{{ content }}</span>
      <slot name="suffix"></slot>
    </article>
  </ElTooltip>
</template>

<script lang="ts" setup>
import docRange from '@/utils/docRange';
import observeing from '@/utils/resizeObserve';
import { ElTooltip } from 'element-plus';
import { onBeforeUnmount, onMounted, ref } from 'vue';

defineProps(['content']);
const disabled = ref(false);
const effect = 'dark';
const placement = 'top';
const wordSection = ref();

let range: any;
let observer: any;

onMounted(() => {
  range = docRange(wordSection.value);
  observer = observeing(() => {
    disabled.value = range.ellipse();
  })
  observer.observer(wordSection.value);
});

onBeforeUnmount(() => {
  observer.unobserver();
});
</script>
