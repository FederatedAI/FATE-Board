<template>
  <article class="f-dashboard-dataset">
    <article class="f-dashboard-dataset--title">Parties info</article>

    <section class="f-dashboard-dataset--main">
      <template v-for="(item, key) in dataset">
        <el-row
          :gutter="24"
          class="f-dashboard-dataset--row f-dashboard-dataset--subtitle"
        >
          <el-col :span="8"><article class="f-dashboard-dataset--label">{{ capitalize(key.toString() || '') }}</article></el-col>
          <el-col :span="16"><article class="f-dashboard-dataset--label">Dataset</article></el-col>
        </el-row>
        <template v-for="(namespace, partyid) in item">
          <el-row
            :gutter="24"
            class="f-dashboard-dataset--row"
          >
            <el-col :span="8">
              <article class="f-dashboard-dataset--content">{{ partyid }}</article>
            </el-col>
            <el-col :span="16">
              <article class="f-dashboard-dataset--column">
                <article
                  v-for="(name, index) in namespace"
                  class="f-dashboard-dataset--content">
                  {{ `${name.namespace}.${name.name}` }}
                </article>
              </article>
            </el-col>
          </el-row>
        </template>
      </template>
    </section>
  </article>
</template>

<script lang="ts" setup>
import { capitalize } from 'lodash';
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const dataset = computed(() => store.state.job.dataset.dataset || {});
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-dashboard-dataset {
  position: relative;
  @include box-stretch();

  .f-dashboard-dataset--title {
    @include title-4-size();
    font-weight: bold;
    margin-bottom: $pale;

    width: 100%;
    @include flex-row();
    justify-content: space-between;
    align-items: center;

    flex: 1 1 10%;
  }

  .f-dashboard-dataset--main {
    position: relative;
    width: 100%;
    height: 100%;
    flex: 2 2 calc(100% - 18px - $pale);
    max-height: calc(100% - 18px - $pale);
    background-color: var(--el-bg-color);
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  .f-dashboard-dataset--row {

    padding: math.div($pale, 2) $pale;
    &:first-child {
      padding-top: $pale * 2;
    }

    :deep(.f-dashboard-dataset--label) {
      @include font-title();
    }

    :deep(.f-dashboard-dataset--content) {
      @include font-text();
      font-weight: bold;
    }

    .f-dashboard-dataset--column {
      @include flex-col();
    }
  }

  .f-dashboard-dataset--subtitle {
    margin-top: $pale;

    &:first-child{
      margin-top: 0;
    }
  }
}
</style>
