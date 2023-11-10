<template>
  <el-card class="running-card">
    <CardHeader :job="job" @cancel="cancelConfirm"></CardHeader>
    <CardProgress :status="status" :progress="progress"></CardProgress>
    <CardKillingMessage
      ref="killMessage"
      @confirm="canceling"
    ></CardKillingMessage>
  </el-card>
</template>

<script setup>
import CardHeader from './CardHeader.vue';
import CardProgress from './CardProgress.vue';
import CardKillingMessage from './CardKillingMessage.vue';
import { ref } from 'vue';

const props = defineProps(['job', 'status', 'progress']);
const emits = defineEmits(['cancel']);

const killMessage = ref();

const cancelConfirm = () => {
  killMessage.value.open(props.job);
};
const canceling = (afterCancel) => {
  emits('cancel', afterCancel);
};
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';
.running-card {
  @include padding-pale($pale, $pale);

  ::v-deep .el-card__body {
    @include padding-pale(0, 0);
  }
}
</style>
