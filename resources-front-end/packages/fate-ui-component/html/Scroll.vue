<template>
  <section class="scroll-container">
    <FScroll
      :items="logs"
      :min-item-size="20"
      emit-scroll
      class="log-contents"
      @scroll-top="$emit('scroll-top')"
      @scroll="onScroll"
      @afterMounted="afterScrollMount"
    >
      <template #item="param">
        <div :id="getLineNum(param)" class="flex flex-row">
          <span class="log-lineNum">{{ param.item.lineNum }}</span>
          <span class="log-content">{{ param.item.content }}</span>
        </div>
      </template>
    </FScroll>
  </section>
</template>

<script lang="ts" setup>
import FScroll from '../lib/components/Scroll/VirtualScroll.vue';

const logs: any = (() => {
  const list: any = []
  const len = Math.ceil(Math.random() * 400)
  for (let i = 0; i < len; i++) {
    list.push({
      content: 'log testing' + i + '_' + Math.random() * 10000,
      lineNum: i + 1
    })
  }
  return list
})()

function onScroll(detail: any) {
  console.log(detail)
}

function afterScrollMount () {
  console.log('has mounted')
}

function getLineNum (param: any) {
  return param.item.lineNum
}
</script>

<style lang="scss" scoped>
.scroll-container {
  width: 800px;
  height: 500px;
  overflow-y: auto;
}
</style>
