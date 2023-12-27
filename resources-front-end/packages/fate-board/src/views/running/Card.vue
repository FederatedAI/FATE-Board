<template>
  <el-card class="running-card">
    <CardHeader
      :jobId="jobId"
      :role="role"
      class="running-card-header"
      @cancel="cancelConfirm"
    ></CardHeader>
    <CardProgress
      :status="status"
      :progress="progress"
      class="running-card-progress"
      @click="toDashboard"
    ></CardProgress>
    <CardKillingMessage
      ref="killMessage"
      @confirm="canceling"
    ></CardKillingMessage>
  </el-card>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import CardHeader from './CardHeader.vue';
import CardKillingMessage from './CardKillingMessage.vue';
import CardProgress from './CardProgress.vue';

const store = useStore();
const props = defineProps(['jobId', 'status', 'progress', 'role', 'partyId']);
const emits = defineEmits(['cancel']);
const routes = useRouter();

const killMessage = ref();

const cancelConfirm = () => {
  killMessage.value.open(props.jobId);
};
const canceling = (afterCancel) => {
  emits('cancel', afterCancel);
};

const toDashboard = () => {
  const params = {
    jobId: props.jobId,
    role: props.role,
    partyId: props.partyId,
  };
  if (window && store.state.job._blank_) {
    const url = routes.resolve({
      name: 'dashboard',
      path: '/dashboard',
      params,
    });
    window.open(url.href, '_blank');
  } else {
    store.dispatch('toDetail', params);
  }
};
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';
.running-card {
  min-width: 300px;
  @include padding-pale($pale, $pale);

  .running-card-progress {
    padding: math.div($pale, 2) 0;
  }

  :deep(.el-card__body) {
    @include padding-pale(0, 0);
  }
}
</style>
