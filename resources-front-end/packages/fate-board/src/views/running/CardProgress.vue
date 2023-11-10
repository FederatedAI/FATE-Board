<template>
  <section class="running-body">
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
        content: ' ';
        @include box-stretch();

        position: absolute;
        top: 0;
        left: 0;

        background-color: rgba(255, 255, 255, 0.6);
      }
    }
  }
}
</style>
