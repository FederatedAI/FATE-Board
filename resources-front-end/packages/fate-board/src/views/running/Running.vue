<template>
  <section class="running-list-container">
    <section v-for="n in 4" :key="n">
      <template v-for="(item, index) in data">
        <Card
          v-if="index % 4 === n - 1"
          :key="index"
          :job="item.jobId"
          :status="item.status"
          :progress="item.progress"
          :role="item.role"
          :partyId="item.partyId"
          @cancel="(afterCancel) => cancel(item, afterCancel)"
        ></Card>
      </template>
    </section>
  </section>
</template>

<script setup>
import API from '@/api';
import { onBeforeMount, onBeforeUnmount, reactive } from 'vue';
import Card from './Card.vue';

const data = reactive([]);

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
  timeinterval = setTimeout(() => {
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
  if (responseData.data) {
    afterCancel();
    dataRequest();
  }
};
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';
.running-list-container {
  @include width-stretch();

  @include flex-row();
  align-items: flex-start;
  justify-content: flex-start;

  flex-wrap: nowrap;
  margin-top: $pale;

  & > section {
    flex-basis: auto;
    flex-grow: 1;
    flex-shrink: 1;

    max-width: calc(25% - #{$pale * 2}px);
    @include padding-pale(0, $pale);

    & > :nth-child(n) {
      margin-bottom: $pale;
    }
  }
}
</style>
