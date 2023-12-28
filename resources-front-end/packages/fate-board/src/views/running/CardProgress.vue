<template>
  <section class="running-body" @click="$emit('click')">
    <el-progress
      type="dashboard"
      class="running-progress"
      :percentage="progress"
    >
      <template #default="{ percentage }">
        <span
          :class="{
            'title-3_bold': true,
          }"
          >{{ isWaiting ? 'waiting' : `${percentage}%` }}</span
        >
      </template>
    </el-progress>
  </section>
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue';

const props = defineProps(['progress', 'status']);
defineEmits(['click'])
const isWaiting = computed(() => props.status.match(/wait/i));
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';
.running-body {
  @include flex-row();
  @include flex-center();

  .running-progress {
    position: relative;
    cursor: pointer;

    &:hover {
      &::before {
        content: 'To Dashboard';

        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        margin: auto;
        z-index: 2;
        text-align: center;
        vertical-align: baseline;
        line-height: 100%;

        color: var(--el-color-primary);
        @include title-4-size();
        font-weight: bold;

        @include flex-row();
        @include flex-center();

        background-color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}
</style>
