<template>
  <article class="f-dashboard-dataset">
    <article class="f-dashboard-dataset--title">Parties info</article>

    <section class="f-dashboard-dataset--main">
      <el-row
        v-for="(item, index) in parties"
        :gutter="24"
        class="f-dashboard-dataset--row"
      >
        <el-col :span="6">
          <FRow
            :label="'Role'"
            :labelClassName="'f-dashboard-dataset--label'"
            :content="item.role"
            :contentClassName="'f-dashboard-dataset--content'"
          ></FRow>
        </el-col>
        <el-col :span="14">
          <FRow
            :label="'PartyId'"
            :labelClassName="'f-dashboard-dataset--label'"
            :content="(item.party_id || []).join(', ')"
            :contentClassName="'f-dashboard-dataset--content'"
          ></FRow>
        </el-col>
      </el-row>
    </section>
  </article>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const parties = computed(() => store.state.job.dataset.parties || []);
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
  }
  
  .f-dashboard-dataset--row {

    padding: $pale;

    :deep(.f-dashboard-dataset--label) {
      @include font-title();
    }

    :deep(.f-dashboard-dataset--content) {
      @include font-text();
      font-weight: bold;
    }
  }
}
</style>
