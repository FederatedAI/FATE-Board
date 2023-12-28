<template>
  <ElTabs v-model="selected" :closable="closable" @tab-change="tabChange" class="f-tabs-container">
    <ElTabPane
      v-for="(tab, index) in tabs"
      :key="index"
      :label="tab.label"
      :name="tab.name"
      class="f-tabs-item"
    >
      <component :is="componentExplain(tab.component, tab.name)" class="f-tabs-content"></component>
    </ElTabPane>
  </ElTabs>
</template>

<script lang="ts" setup>
import { ElTabPane, ElTabs } from 'element-plus';
import { isFunction, isString } from 'lodash';
import { defineAsyncComponent, ref } from 'vue';
import { parse } from '../../UIParse';
/**
 * {
 *  tabs: [{
 *    name: string,
 *    label: string,
 *    component: object | Component | Function
 *  }]
 * }
 */
const props = defineProps(['tabs', 'value', 'closable']);
const emits = defineEmits(['change'])

const selected = ref(props.value || '');
const componentsAST = new Map();

const parsing = (configuration: object, name: string) => {
  return defineAsyncComponent({
    loader: async () => {
      const ast = await parse(<any>configuration)
      componentsAST.set(name, ast)
      return ast.toVue()
    }
  })
};

const componentExplain = (
  component: any,
  name: string
):any => {
  if (isString(component)) {

    componentsAST.set(name, component)
    return component

  } else if (isFunction(component)) {

    const result = component()
    return componentExplain(result, name)

  } else if ((component as any).__name) {
    // 已经是vue componnet
    componentsAST.set(name, component)
    return component

  } else if (component instanceof Promise) { 
    
    const comp = defineAsyncComponent(() => component)
    componentsAST.set(name, comp)
    return comp

  } else {
    // UIParse
    return parsing(component, name)
  }
}

const tabChange = (name: any) => {
  emits('change', name, componentsAST.get(name))
}
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/styles/index.scss';

.f-tabs-container {
  .f-tabs-item {
    min-height: 300px;
  }
}
</style>
