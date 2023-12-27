<template>
  <article ref="container">
    <slot name="default"></slot>
  </article>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const scrollData: any = inject('scrollData');
const scrollResizeObserver: any = inject('scrollResizeObserver');
const undefinedMap: any = inject('undefinedMap');
const undefinedSizes: any = inject('undefinedSizes');

const $_forceNextScrollUpdate = ref<any>(null);

interface Props {
  item: any;
  active: boolean;
  tag?: string;
}
const props = withDefaults(defineProps<Props>(), {
  tag: 'div',
});
const slots = defineSlots<{
  default(): any;
}>();

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
  },
  {
    deep: true,
    immediate: true,
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
    }
    if (value) {
      updateSize();
    }
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  if (scrollData.active) {
    updateSize();
    observeSize();
  }
  // observeSizeOfItem();
});

onBeforeUnmount(() => {
  // unobserveSizeOfItem()
})

function updateSize() {
  if (finalActive.value) {
    computeSize(id.value);
  }
}

function computeSize(id: any) {
  nextTick(() => {
    if (id.value === id) {
      const width = container.value.offsetWidth;
      const height = container.value.offsetHeight;
      applySize(width, height);
    }
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
    return true;
  } else {
    return false;
  }
}

// let $_resizeOfItem: any
// function observeSizeOfItem() {
//   $_resizeOfItem = new ResizeObserver(debounce(() => {
//     if (!scrollData.sizes[id.value] || !scrollData.validSizes[id.value]) {
//       computeSize(id.value)
//     }
//   }))
//   $_resizeOfItem.observe(container.value)
// }

// function unobserveSizeOfItem() {
//   if ($_resizeOfItem) {
//     $_resizeOfItem.disconnect()
//   }
// }

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
    updateSize();
  }
}

function onDataUpdate() {
  updateSize();
}

defineExpose({
  onScrollUpdate,
});
</script>
