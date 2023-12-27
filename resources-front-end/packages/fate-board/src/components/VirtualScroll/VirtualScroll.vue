<template>
  <div
    ref="container"
    :class="{ ready }"
    class="scroller"
    @scroll.passive="handleScroll"
    @visibilitychange="handleVisibilityChange"
  >
    <div ref="wrapper" :style="{ minHeight: totalSize + 'px' }" class="wrap">
      <ScrollItemRedo
        v-for="view in pool"
        ref="items"
        :key="view.info.id"
        :item="view.item"
        :index="view.info.index"
        :active="view.info.used"
        :style="ready ? { transform: `translateY(${view.position}px)` } : null"
        class="item-view"
      >
        <template #default>
          <slot
            name="item"
            :item="view.item"
            :index="view.info.index"
            :active="view.info.used"
          ></slot>
        </template>
      </ScrollItemRedo>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
computed,
nextTick,
onBeforeUnmount,
onMounted,
provide,
reactive,
ref,
watch
} from 'vue';
import ScrollItemRedo from './VirtualScrollItem.vue';

let uid = 0;

interface Props {
  items: { content: string; lineNum: number; [name: string]: keyof any }[];
  distance?: number;
  disabled?: boolean;
  minItemSize: number;
  buffer?: number;
  keyField?: string;
  emitScroll?: boolean;
}
const _props = withDefaults(defineProps<Props>(), {
  distance: 0,
  keyField: 'lineNum',
  disabled: false,
  buffer: 200,
  emitScroll: false,
});
const emit = defineEmits([
  'scrollTop',
  'scrollBottom',
  'scroll',
  'afterMounted',
]);

const $_resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.target) {
      const event = new CustomEvent('resize', {
        detail: {
          contentRect: entry.contentRect,
        },
      });
      entry.target.dispatchEvent(event);
    }
  }
});
const $_undefinedMap = reactive<any>({});
const $_updates = reactive<any>([]);
const $_undefinedSizes = ref(0);
const $_computedMinItemSize = ref<any>(undefined);
const $_views = new Map();
const $_unusedViews = new Map();
const $_scrollDirty = ref(false);

let $_refreshTimout: any;
let $_lastStartPosition: any;
let $_endIndex = 0;
let $_startIndex = 0;
let $_continuous = false;
let $_sortTimer: any;
let $_scrollingToBottom: any;
let $_lastUpdateScrollPosition = 0;

const container = ref();
const items = ref();
const vScrollUpdate = (params: any) => {
  if (items.value) {
    for (const item of items.value) {
      item.onScrollUpdate(params);
    }
  }
};

const pool = reactive<any[]>([]);
const ready = ref(false);
const totalSize = ref(0);
const scrollData = reactive({
  active: true,
  sizes: {},
  validSizes: {},
  keyField: _props.keyField,
});
let resizeObserver: any = undefined;

const itemsWithSize = computed<any[]>(() => {
  const result = [];
  const sizes: any = scrollData.sizes;
  for (let i = 0; i < _props.items.length; i++) {
    const item = _props.items[i];
    const id = item[_props.keyField];
    let size = sizes[id];
    if (typeof size === 'undefined' && !$_undefinedMap[id]) {
      size = 0;
    }
    result.push({
      item,
      id,
      size,
    });
  }
  return result;
});

const sizes = computed<any>(() => {
  const sizes: any = {
    '-1': { accumulator: 0 },
  };
  let computedMinSize = 10000;
  let accumulator = 0;
  let current;
  for (let i = 0, l = itemsWithSize.value.length; i < l; i++) {
    current = itemsWithSize.value[i].size || _props.minItemSize;
    if (current < computedMinSize) {
      computedMinSize = current;
    }
    accumulator += current;
    sizes[i] = { accumulator, size: current };
  }
  // eslint-disable-next-line
  $_computedMinItemSize.value = computedMinSize;
  return sizes;
});

function addView(pool: any[], index: number, item: unknown, key: unknown) {
  const property = {
    id: uid++,
    index,
    used: true,
    key,
  };
  const view = {
    item,
    position: 0,
    info: property
  };
  pool.push(view);
  return view;
}
function unuseView(view: any, fake = false) {
  const type = view.info.type;
  let unusedPool = $_unusedViews.get(type);
  if (!unusedPool) {
    unusedPool = [];
    $_unusedViews.set(type, unusedPool);
  }
  unusedPool.push(view);
  if (!fake) {
    view.info.used = false;
    view.position = -9999;
    $_views.delete(view.info.key);
  }
}

function handleScroll() {
  checkPosition();
  if (!$_scrollDirty.value) {
    $_scrollDirty.value = true;
    requestAnimationFrame(() => {
      $_scrollDirty.value = false;
      const { continuous } = updateItems(false, true);
      if (!continuous) {
        clearTimeout($_refreshTimout);
        $_refreshTimout = setTimeout(handleScroll, 100);
      }
    });
  }
}
function getRange(scroll: { start: any; end: any }) {
  let startIndex = 0;
  let endIndex = 0;
  const count = _props.items.length;
  const lastIndex = count - 1;
  const buffer = _props.buffer;
  scroll.start -= buffer;
  scroll.end += buffer;

  let h;
  let a = 0;
  let b = lastIndex;
  let i = ~~(count / 2);
  let oldI;
  do {
    oldI = i;
    h = sizes.value[i].accumulator;
    if (h < scroll.start) {
      a = i;
    } else if (i < lastIndex && sizes.value[i + 1].accumulator > scroll.start) {
      b = i;
    }
    i = ~~((a + b) / 2);
  } while (i !== oldI);
  i < 0 && (i = 0);
  startIndex = i;

  for (
    endIndex = i;
    endIndex < lastIndex && sizes.value[endIndex].accumulator < scroll.end;
    endIndex++
  );
  if (endIndex === -1) {
    endIndex = lastIndex;
  } else {
    endIndex++;
    endIndex > count && (endIndex = count);
  }
  return {
    startIndex,
    endIndex,
  };
}

function updateItems(checkItem: boolean, checkPositionDiff = false) {
  const { items, keyField } = _props;
  const minItemSize = $_computedMinItemSize.value;
  const views = $_views;
  const unusedViews = $_unusedViews;
  const count = items.length;
  const scroll = getScroll();
  if (checkPositionDiff) {
    let positionDiff = scroll.start - $_lastStartPosition || 0;
    if (positionDiff < 0) positionDiff = -positionDiff;
    if (positionDiff < minItemSize) {
      return {
        continuous: true,
      };
    }
  }

  $_lastStartPosition = scroll.start;

  const { startIndex, endIndex } = getRange(scroll);
  totalSize.value = sizes.value[count - 1].accumulator;

  let view: any;

  const continuous = startIndex <= $_endIndex && endIndex >= $_startIndex;
  if ($_continuous !== continuous) {
    if (continuous) {
      views.clear();
      unusedViews.clear();
      for (let i = 0, l = pool.length; i < l; i++) {
        view = pool[i];
        unuseView(view);
      }
    }
    $_continuous = continuous;
  } else if (continuous) {
    for (let i = 0, l = pool.length; i < l; i++) {
      view = pool[i];
      if (view.info.used) {
        if (checkItem) {
          view.info.index = items.findIndex(
            (item: any) => item[keyField] === view.item[keyField]
          );
        }
        if (
          view.info.index === -1 ||
          view.info.index < startIndex ||
          view.info.index >= endIndex
        ) {
          unuseView(view);
        }
      }
    }
  }

  const unusedIndex = continuous ? null : new Map();
  let item, type, unusedPool;
  let v;
  for (let i = startIndex; i < endIndex; i++) {
    item = items[i];
    const key = item[keyField];
    view = views.get(key);

    if (!sizes.value[i].size) {
      if (view) unuseView(view);
      continue;
    }

    if (!view) {
      type = item.type;
      unusedPool = unusedViews.get(type);
      if (continuous) {
        if (unusedPool && unusedPool.length) {
          view = unusedPool.pop();
          view.item = item;
          view.info.used = true;
          view.info.index = i;
          view.info.key = key;
        } else {
          view = addView(pool, i, item, key);
        }
      } else {
        v = unusedIndex ? unusedIndex.get(type) || 0 : 0;
        if (!unusedPool || v >= unusedPool.length) {
          view = addView(pool, i, item, key);
          unuseView(view, true);
          unusedPool = unusedViews.get(type);
        }

        view = unusedPool[v];
        view.item = item;
        view.info.used = true;
        view.info.index = i;
        view.info.key = key;
        if (unusedIndex) {
          unusedIndex.set(type, v + 1);
        }
        v++;
      }
      views.set(key, view);
    } else {
      view.info.used = true;
      view.item = item;
    }
    view.position = sizes.value[i - 1].accumulator;
  }

  $_startIndex = startIndex;
  $_endIndex = endIndex;

  clearTimeout($_sortTimer);
  $_sortTimer = setTimeout(sortViews, 300);
  return {
    continuous,
  };
}

function getScroll() {
  const el = container.value;
  return {
    start: el.scrollTop,
    end: el.scrollTop + el.clientHeight,
  };
}

function sortViews() {
  pool.sort((viewA: any, viewB: any) => viewA.info.index - viewB.info.index);
}

function checkPosition() {
  const scroll = getScroll();
  if (ready.value && scroll.start === 0) {
    emit('scrollTop');
  }
  if (ready.value && container.value.scrollHeight - scroll.end === 0) {
    emit('scrollBottom');
  }
  if (ready.value && _props.emitScroll) {
    emit('scroll', {
      ...scroll,
      top: scroll.start,
      bottom: container.value.scrollHeight - scroll.end,
    });
  }
}

function handleVisibilityChange(isVisible: boolean, entry: any) {
  if (ready.value) {
    if (
      isVisible ||
      entry.boundingClientRect.width !== 0 ||
      entry.boundingClientRect.height !== 0
    ) {
      // visible
      if (vScrollUpdate) {
        vScrollUpdate({ force: false });
      }
      requestAnimationFrame(() => {
        updateItems(false);
      });
    }
  }
}

function addResizeObserver() {
  resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container.value);
}

function handleResize() {
  if (ready.value) {
    updateItems(false);
    forceUpdate();
  }
}

function scrollToItem(index: number) {
  const scroll = index > 0 ? sizes.value[index - 1].accumulator : 0;
  scrollToPosition(scroll);
}

function scrollToPosition(position: number) {
  container.value.scrollTop = position;
}

function scrollToBottom() {
  if ($_scrollingToBottom) return;
  $_scrollingToBottom = true;
  const el = container.value;
  // Item is inserted to the DOM
  nextTick(() => {
    el.scrollTop = el.scrollHeight + 5000;
    // Item sizes are computed
    const cb = () => {
      el.scrollTop = el.scrollHeight + 5000;
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight + 5000;
        if ($_undefinedSizes.value === 0) {
          $_scrollingToBottom = false;
        } else {
          requestAnimationFrame(cb);
        }
      });
    };
    requestAnimationFrame(cb);
  });
}

function forceUpdate(clear = true) {
  if (clear) {
    scrollData.validSizes = {};
  }
  if (vScrollUpdate) {
    vScrollUpdate({ force: true });
  }
}

watch(
  () => _props.items,
  () => forceUpdate(),
  { deep: true }
);

watch(
  () => sizes.value,
  () => updateItems(false),
  { deep: true }
);

watch(
  () => itemsWithSize.value,
  () => updateItems(true),
  { deep: true }
);

onMounted(() => {
  nextTick(() => {
    updateItems(true);
    ready.value = true;
  });
  addResizeObserver();
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  if ($_resizeObserver) {
    $_resizeObserver.disconnect();
  }
});

provide('scrollData', scrollData);
provide('scrollResizeObserver', $_resizeObserver);
provide('undefinedMap', $_undefinedMap);
provide('undefinedSizes', $_undefinedSizes);

defineExpose({
  scrollToBottom,
  scrollToItem,
  scrollToPosition,
});
</script>

<style lang="scss" scoped>
.scroller {
  position: relative;
  overflow-y: auto;
}

.wrap {
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.item-view {
  width: 100%;
}

.scroller.ready .item-view {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}
</style>
