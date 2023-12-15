<template>
  <component
    :is="componentInstance"
    :key="update"
    class="f-detail-item-content"
  ></component>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onBeforeMount, ref, watch } from 'vue';
import { useStore } from 'vuex';

const componentInstance: any = ref(undefined);
const update = ref(0);

const store = useStore();
const component = computed(() => store.state.comp.information.name);
let unloaded = false;

const modelComponent = () => {
  componentInstance.value = undefined;
  if (component.value) {
    componentInstance.value = defineAsyncComponent(async () => {
      const config = store.state.comp.hasLoaded[component.value];
      if (config && config.instance) {
        return config.instance.toVue();
      } else {
        unloaded = true;
        return {};
      }
    });
    update.value++;
  }
};

watch(
  () => store.state.comp.hasLoaded,
  () => {
    if (store.state.comp.hasLoaded[component.value] && unloaded) {
      modelComponent();
      unloaded = false;
    }
  },
  { deep: true }
);

watch(
  () => component.value,
  () => {
    modelComponent();
  },
  { deep: true }
);

onBeforeMount(() => {
  modelComponent();
});

const refreshing = () => {
  store.dispatch('modelRefresh')
}
defineExpose({
  refresh: refreshing
})

</script>

<style lang="scss" scoped></style>
