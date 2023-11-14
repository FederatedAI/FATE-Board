<template>
  <section v-loading="parameterLoading" class="f-parameter">
    <article class="f-parameter-title">
      Parameters <span class="f-parameter-subtitle">({{ count }})</span>
    </article>
    <section class="f-parameter-operation">
      <el-input
        v-model="filter"
        class="f-parameter-filter"
        placeholder="Filter"
      ></el-input>
      <el-tooltip
        :content="expanded ? 'Fold All' : 'Unfold All'"
        effect="dark"
        placement="top"
      >
        <el-icon class="f-parameter-expand" @click="expanding"
          ><Expand v-show="expanded" /> <Fold v-show="!expanded"
        /></el-icon>
      </el-tooltip>
    </section>
    <section class="f-parameter-tree">
      <el-tree
        v-if="parametersDIsplay"
        ref="parameters"
        :data="param"
        node-key="id"
        class="f-parameter-tree-item"
        :default-expand-all="expanded"
        :filter-node-method="filterNode"
      >
      </el-tree>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { Expand, Fold } from '@element-plus/icons-vue';
import { nextTick, reactive, ref, watch } from 'vue';
import { useStore } from 'vuex';

const filter = ref('');
const parameters = ref();
const parametersDIsplay = ref(true)
const parameterLoading = ref(false);
const store = useStore();
const expanded = ref(false);
const count = ref(0);

watch(filter, (val) => {
  parameters.value.filter(val)
})

const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}

const param = reactive<any[]>([]);
const paramRequest = async (comp: any) => {
  parameterLoading.value = true;
  param.length = 0
  await store.dispatch('chooseComp', comp)
  param.push(...store.state.comp.parameters)
  count.value = param.length
  parameterLoading.value = false;
};

const expanding = () => {
  expanded.value = !expanded.value
  parametersDIsplay.value = false
  nextTick(() => {
    parametersDIsplay.value = true
  })
};

defineExpose({
  getParameter: paramRequest,
});
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-parameter {
  @include box-stretch();

  @include flex-col();
  justify-content: flex-start;
  align-items: flex-start;

  .f-parameter-title {
    @include title-4-size();
    font-weight: bold;
    margin-bottom: $pale;
    @include flex-freeze();
  }

  .f-parameter-subtitle {
    @include text-size();
    font-weight: bold;
    margin-bottom: $pale;
    color: var(--el-color-info-dark-2);
    @include flex-freeze();
  }

  .f-parameter-operation {
    width: 100%;
    @include flex-row();
    justify-content: space-between;
    align-items: center;
    flex: 1 1 8%;
    margin-bottom: $pale;
  }

  .f-parameter-filter {
    flex: 1 1 85%;
  }

  .f-parameter-expand {
    height: 100%;
    flex: 1 1 15%;
    cursor: pointer;
  }

  .f-parameter-tree {
    width: 100%;
    flex: 1 1 92%;
    overflow: auto;
    background-color: $default-white;
    border-radius: math.div($pale, 3);

    .f-parameter-tree-item {
      background-color: $default-white;
    }
  }
}
</style>
