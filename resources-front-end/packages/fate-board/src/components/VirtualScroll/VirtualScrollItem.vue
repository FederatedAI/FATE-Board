<template>
  <component ref="container" :is="tag || 'div'">
    <slot name="default"></slot>
  </component>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue';

const scrollData: any = inject('scrollData');
const scrollResizeObserver: any = inject('scrollResizeObserver');
const undefinedMap: any = inject('undefinedMap');
const undefinedSizes: any = inject('undefinedSizes');

const $_forceNextScrollUpdate = ref<any>(null);
const $_pendingSizeUpdate = ref<any>('');
const $_pendingScrollUpdate = ref<any>('');

interface Props {
  item: any,
  active: boolean,
  index?: number | undefined,
  tag?: string
}
const props = withDefaults(defineProps<Props>(), {
  index: undefined,
  tag: 'div',
});
const slots = defineSlots<{
  default(): any
}>()

const id = computed(() => props.item[scrollData.keyField]);
const size = computed<any>(
  () => (scrollData.validSizes[id.value] && scrollData.sizes[id.value]) || 0
);

const finalActive = computed(() => props.active && scrollData.active);
const container = ref();

watch(
  () => id.value,
  () => {
    if (!size.value) {
      onDataUpdate();
    }
  }
);

watch(
  () => finalActive.value,
  (value: any) => {
    if (!size.value) {
      if (value) {
        if (!undefinedMap[id.value]) {
          undefinedSizes.value = undefinedSizes.value++;
          undefinedMap[id.value] = true;
        }
      } else {
        if (undefinedMap[id.value]) {
          undefinedSizes.value -= 1;
          undefinedMap[id.value] = false;
        }
      }
    }

    if (scrollResizeObserver) {
      if (value) {
        observeSize();
      } else {
        unobserveSize();
      }
    } else if (value && $_pendingScrollUpdate.value === id.value) {
      updateSize();
    }
  }
);

onMounted(() => {
  if (scrollData.active) {
    updateSize();
    observeSize();
  }
});

function updateSize() {
  if (finalActive.value) {
    if ($_pendingSizeUpdate.value !== id.value) {
      $_pendingSizeUpdate.value = id.value;
      $_forceNextScrollUpdate.value = null;
      $_pendingScrollUpdate.value = null;
      computeSize(id.value);
    }
  } else {
    $_forceNextScrollUpdate.value = id.value;
  }
}

function computeSize(idChecked: any) {
  nextTick(() => {
    if (id.value === idChecked) {
      const width = container.value.offsetWidth;
      const height = container.value.offsetHeight;
      applySize(width, height);
    }
    $_pendingSizeUpdate.value = null;
  });
}

function applySize(_width: number, height: number) {
  const csize = Math.round(height);
  if (csize && size.value !== csize) {
    if (undefinedMap[id.value]) {
      undefinedSizes.value--;
      undefinedMap[id.value] = undefined;
    }
    scrollData.sizes[id.value] = csize;
    scrollData.validSizes[id.value] = true;
  }
}

function observeSize() {
  if (!scrollResizeObserver) return;
  if (container.value) {
    scrollResizeObserver.observe(container.value);
    container.value.addEventListener('resize', onResize);
  }
}

function unobserveSize() {
  if (!scrollResizeObserver) return;
  if (container.value) {
    scrollResizeObserver.unobserve(container.value);
    container.value.removeEventListener('resize', onResize);
  }
}

function onResize(event: any) {
  const { width, height } = event.detail.contentRect;
  applySize(width, height);
}

function onScrollUpdate({ force }: any) {
  if (!finalActive.value && force) {
    $_pendingScrollUpdate.value = id.value
  }

  if ($_forceNextScrollUpdate.value === id.value || force || !size.value) {
    updateSize()
  }
}

function onDataUpdate() {
  updateSize();
}

defineExpose({
  onScrollUpdate,
});
</script>
