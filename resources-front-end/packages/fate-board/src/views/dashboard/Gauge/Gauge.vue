<template>
  <section class="f-dashboard-gauge">
    <article class="f-dashboard-gauge--title">JOB: {{ JobId }}</article>
    <section class="f-dashboard-gauge--main" :class="{
      'f-dashboard-gauge--running': (status && !status.match(/success|fail/i))
    }">
      <template v-if="status && !status.match(/success|fail/i)">
        <FGauge class="f-dashboard-gauge--progress" :precentage="precentage || 0" />
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
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const JobId = computed(() => store.state.job.jobId);
const status = computed(() => store.state.job.details.fStatus);
const duration = ref(0)
const precentage = computed(() => store.state.job.details.fProgress);

const toDetail = () => {
  store.dispatch('toDetail');
};

const elapsed = () => {
  let elapsed: any = store.state.job.details.fElapsed
  if (!elapsed) {
    elapsed = Math.floor((store.state.job.details.fStartTime ? (new Date().getTime() - store.state.job.details.fStartTime) : 0) / 1000)
  }
  duration.value = elapsed
}
const elapsing = () => {
  setTimeout(() => {
    if (status.value.match(/running/i)) {
      duration.value += 1
      elapsing()
    } else {
      elapsed()
    }
  }, 950)
}

watch(
  () => status.value,
  (value: any) => {
    if (value.match(/running/i)) {
      elapsing()
    }
  }
)

watch(
  () => store.state.job.details.fElapsed,
  () => elapsed()
)


watch(
  () => store.state.job.details.fStartTime,
  () => elapsed()
)

onMounted(() => {
  elapsed()
  if (status.value && status.value.match(/running/i)) {
    elapsing()
  }
})
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';

.f-dashboard-gauge {
  position: relative;
  @include box-stretch();
  @include flex-col();
  @include flex-stretch();

  .f-dashboard-gauge--title {
    @include title-4-size();
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
    flex: 2 2 calc(100% - 18px - $pale);
    max-height: calc(100% - 18px - $pale);

    @include flex-row();
    @include flex-center();
    flex-wrap: wrap;

    & > * {
      flex: 1 1 33%;
    }

    .f-dashboard-gauge--status {
      flex-grow: 0;
      @include flex-col();
      @include flex-center();
    }

    .f-dashboard-gauge--duration {
      flex-grow: 0;
      @include flex-col();
      @include flex-center();
      color: var(--el-color-info);
      font-weight: bold;
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
      flex-grow: 0;
      max-width: 140px;
      border-radius: 70px;
      color: var(--el-color-primary);
      font-weight: bold;
      background-color: var(--el-bg-color);
      border: 2px solid var(--el-color-primary);
    }
  }

  .f-dashboard-gauge--running {
    @include flex-col();
    justify-content: flex-end;

    & > * {
      flex: 0 0 auto;
    }

    .f-dashboard-gauge--duration {
      margin-bottom: $pale;
    }

    .f-dashboard-gauge--btn {
      margin-bottom: $pale;
    }
  }
}
</style>
