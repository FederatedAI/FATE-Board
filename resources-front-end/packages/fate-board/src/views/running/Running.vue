<template>
  <section class="running-list-container" :class="{
    'running-list-stretch': data.length <= 0
  }">
    <section v-if="data.length > 0" v-for="n in 4" :key="n">
      <template v-for="(item, index) in data">
        <Card
          v-if="index % 4 === n - 1"
          :key="index"
          :jobId="item.jobId"
          :status="item.status"
          :progress="item.progress"
          :role="item.role"
          :partyId="item.partyId"
          @cancel="(afterCancel) => cancel(item, afterCancel)"
        ></Card>
      </template>
    </section>
    <section v-else class="running-list-hint">
      No job is running yet,<span class="running-list-link" @click.stop="toHistory">skip to Jobs for more. <el-icon class="running-list-icon"><Right /></el-icon></span>
    </section>
  </section>
</template>

<script setup>
import API from '@/api';
import { onBeforeMount, onBeforeUnmount, reactive } from 'vue';
import { useStore } from 'vuex';
import Card from './Card.vue';

const data = reactive([]);
const store = useStore();

const dataRequest = async () => {
  const responseData = await API.getRunningJobs();
  const runningJobList = [];
  responseData.forEach((job) => {
    runningJobList.push({
      jobId: job.fJobId,
      status: job.fStatus,
      role: job.fRole,
      partyId: job.fPartyId,
      progress: job.fProgress,
    });
  });
  data.length = 0;
  data.push(...runningJobList);
};

let timeinterval;
onBeforeMount(() => {
  dataRequest();
  timeinterval = setInterval(() => {
    dataRequest();
  }, 5000);
});

onBeforeUnmount(() => {
  if (timeinterval) {
    clearTimeout(timeinterval);
  }
});

const cancel = async (item, afterCancel) => {
  const responseData = await API.killJob({
    job_id: item.jobId,
  });
  if (responseData) {
    dataRequest();
  }
  afterCancel();
};

const toHistory = () => {
  store.dispatch('toHistory')
}
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';
.running-list-container {
  @include width-stretch();

  @include flex-row();
  align-items: flex-start;
  justify-content: flex-start;

  flex-wrap: wrap;
  margin-top: $pale;

  & > section {
    flex-basis: auto;
    flex-grow: 1;
    flex-shrink: 1;

    width: calc(25% - $pale * 2);
    @include padding-pale(0, $pale);
    min-width: 300px;

    & > :nth-child(n) {
      margin-bottom: $pale;
    }
  }

  .running-list-hint {
    width: 100%;
    height: 100%;

    @include flex-row();
    @include flex-center();

    font-weight: bold;
    color: var(--el-color-info);

    .running-list-link {
      margin: 0;
      padding-left: $pale;
      color: var(--el-color-primary);
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .running-list-icon {
      font-size: 25px;
    }
  }
}

.running-list-stretch {
  height: 90%;
}
</style>
