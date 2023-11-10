<template>
  <div class="log-content">
    <div v-if="!logs" class="log-tip">
      <span>loading...</span>
    </div>
    <div v-else-if="!logs.length" class="log-tip">
      <span>no data</span>
    </div>
    <FVirtualScroll
      v-else
      ref="scroller"
      :items="logs"
      :min-item-size="20"
      emit-scroll
      class="log-contents"
      @scroll-top="$emit('scroll-top')"
      @scroll="onScroll"
      @afterMounted="afterScrollMount"
    >
      <template #default="{ item }">
        <div :id="item.lineNum" class="flex flex-row">
          <span class="log-lineNum">{{ item.lineNum }}</span>
          <span class="log-content">{{ item.content }}</span>
        </div>
      </template>
    </FVirtualScroll>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps(['logs']);
const bottom = ref(0);
const scroller = ref();

function afterScrollMount() {
  scroller.value && scroller.value.scrollToBottom();
}
function scrollTo(index: any) {
  scroller.value && scroller.value.scrollToItem(index);
}
function onScroll(detail: any) {
  bottom.value = detail.bottom;
}
function setSpace(content: any) {
  return content;
  // return content.replace(/\s/g, '&nbsp;')
}

watch(
  () => props.logs,
  (val, oldVal) => {
    if (!val) return;
    if (oldVal) {
      if (oldVal.length < val.length) {
        const firstItem = val[0].lineNum;
        const firstOldItem = oldVal[0].lineNum;
        const lastItem = val[val.length - 1].lineNum;
        const lastOldItem = oldVal[oldVal.length - 1].lineNum;
        let index: any;
        if (firstItem < firstOldItem && lastItem === lastOldItem) {
          index = firstOldItem;
          scrollTo(val.findIndex((item: any) => item.lineNum === index));
        } else if (lastItem > lastOldItem && firstItem === firstOldItem) {
          if (bottom.value > 0) {
            return;
          }
          afterScrollMount();
        }
      }
    } else {
      afterScrollMount();
    }
  }
);
</script>

<style lang="scss" scoped>
.log-content {
  height: 100%;
  white-space: pre-wrap;
  font-family: 'lucon', 'Lucida Console', Monaco, monospace, 'Arial';
}
.log-contents {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: absolute;
  width: 100%;
  background: #fff;
  .log-lineNum {
    font-family: 'lucon', 'Lucida Console', Monaco, monospace, 'Arial';
    color: #c6c8cc;
    min-width: 50px;
    margin-right: 20px;
    font-size: 12px;
    text-align: left;
    line-height: 20px;
  }
  .log-content {
    color: #999ba3;
    font-size: 12px;
    text-align: left;
    text-indent: initial;
    line-height: 20px;
  }
}
.log-tip {
  width: 100%;
  text-align: center;
  color: #999ba3;
}
</style>
