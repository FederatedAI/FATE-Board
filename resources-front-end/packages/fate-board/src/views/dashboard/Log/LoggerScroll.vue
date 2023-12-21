<template>
  <div class="f-log-content">
    <div v-if="!logs" class="f-log-tip">
      <span>loading...</span>
    </div>
    <div v-else-if="!logs.length" class="f-log-tip">
      <span>no data</span>
    </div>
    <FCVirtualScroll
      v-else
      ref="scroller"
      :items="logs"
      :min-item-size="20"
      emit-scroll
      class="f-log-contents"
      @scroll-top="$emit('scroll-top')"
      @scroll="onScroll"
      @afterMounted="afterScrollMount"
    >
      <template #item="param">
        <div :id="getLineNum(param)" class="f-log-item">
          <span class="f-log-item-lineNum">{{ param.item.lineNum }}</span>
          <span class="f-log-item-content">{{ param.item.content }}</span>
        </div>
      </template>
    </FCVirtualScroll>
  </div>
</template>

<script lang="ts" setup>
import { FCVirtualScroll } from '@/components/VirtualScroll';
import { ref, watch } from 'vue';

const props = defineProps(['logs']);
defineEmits(['scroll-top']);
const bottom = ref(0);
const scroller = ref();

function getLineNum(param: any) {
  return param.item.lineNum;
}

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
@import '@/style/index.scss';
.f-log-content {
  height: 100%;
  white-space: pre-wrap;
  font-family: 'lucon', 'Lucida Console', Monaco, monospace, 'Arial';
}
.f-log-contents {
  width: calc(100% - $pale * 2);
  height: calc(100% - $pale * 2);
  overflow-y: auto;
  overflow-x: hidden;
  position: absolute;
  background: #fff;
  .f-log-item {
    @include flex-row();
  }
  .f-log-item-lineNum {
    font-family: 'lucon', 'Lucida Console', Monaco, monospace, 'Arial';
    color: #c6c8cc;
    min-width: 50px;
    margin-right: 20px;
    font-size: 12px;
    text-align: left;
    line-height: 20px;
  }
  .f-log-item-content {
    color: #999ba3;
    font-size: 12px;
    text-align: left;
    text-indent: initial;
    line-height: 20px;
  }
}
.f-log-tip {
  width: 100%;
  text-align: center;
  color: #999ba3;
}
</style>
