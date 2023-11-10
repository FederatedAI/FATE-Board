<template>
  <section class="f-dashboard-gauge">
    <article class="f-dashboard-gauge--title">JOB: {{ JobId }}</article>
    <section class="f-dashboard-gauge--main">
      <template v-if="status && !status.match(/success|fail/i)">
        <FGauge class="f-dashboard-gauge--progress" :precentage="precentage" />
        <article class="f-dashboard-gauge--duration">
          {{ toTime(duration) }}
        </article>
      </template>
      <template v-else-if="status">
        <article class="f-dashboard-gauge--status">
          <article class="f-dashboard-gauge--label">status :</article>
          <article class="f-dashboard-gauge--content">{{ status }}</article>
        </article>
        <article class="f-dashboard-gauge--icon">
          <img
            v-if="status.match(/success/i)"
            src="@/icons/complete.svg"
            class="f-dashboard-gauge--img"
            alt=""
          />
          <img
            v-if="!status.match(/success/i)"
            src="@/icons/error.svg"
            class="f-dashboard-gauge--img"
            alt=""
          />
        </article>
        <article class="f-dashboard-gauge--duration">
          <article class="f-dashboard-gauge--label">duration :</article>
          <article class="f-dashboard-gauge--content">
            {{ toTime(duration) }}
          </article>
        </article>
      </template>
      <el-button class="f-dashboard-gauge--btn" @click="toDetail"
        >To Detail<el-icon><Right /></el-icon></el-button
      >
    </section>
  </section>
</template>

<script lang="ts" setup>
import { toTime } from 'fate-tools';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const JobId = computed(() => store.state.job.jobId);
const status = computed(() => store.state.job.details.fStatus);
const duration = ref(store.state.job.details.fElapse);
const precentage = computed(() => store.state.job.details.fProgress);

const toDetail = () => {
  store.dispatch('toDetail');
};
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';

.f-dashboard-gauge {
  position: relative;
  @include box-stretch();
  @include flex-col();
  @include flex-stretch();

  .f-dashboard-gauge--title {
    @include title-3-size();
    font-weight: bold;
    margin-bottom: $pale;

    width: 100%;
    @include flex-row();
    justify-content: space-between;
    align-items: center;

    flex: 1 1 10%;
  }

  .f-dashboard-gauge--main {
    position: relative;
    width: 100%;
    flex: 2 2 90%;
    max-height: 90%;

    @include flex-row();
    @include flex-center();
    flex-wrap: wrap;

    & > * {
      flex: 1 1 33%;
    }

    .f-dashboard-gauge--status {
      @include flex-col();
      @include flex-center();
    }

    .f-dashboard-gauge--duration {
      @include flex-col();
      @include flex-center();
    }

    .f-dashboard-gauge--icon {
      width: 20px;
      height: 20px;
      @include flex-col();
      @include flex-center();
    }

    .f-dashboard-gauge--label {
      @include title-4-size();
      color: var(--el-color-info-light-3);
    }

    .f-dashboard-gauge--content {
      @include text-size();
      color: var(--el-color-info);
      font-weight: bold;
    }

    .f-dashboard-gauge--img {
      width: 40px;
      height: 40px;
    }

    .f-dashboard-gauge--btn {
      max-width: 140px;
      border-radius: 70px;
      color: var(--el-color-primary);
      font-weight: bold;
      background-color: var(--el-bg-color);
      border: 2px solid var(--el-color-primary);
    }
  }
}
</style>
