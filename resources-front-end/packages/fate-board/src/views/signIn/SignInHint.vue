<template>
  <FRow
    :content="message"
    :class="{
      'hint-text': true,
      'hint-warning': isWarning,
      'hint-error': isError,
    }"
  >
    <template v-slot:prefix>
      <el-icon v-if="isWarning && message" class="hint-icon"><WarningFilled /></el-icon>
      <el-icon v-if="isError && message" class="hint-icon"><CircleCloseFilled /></el-icon>
    </template>
  </FRow>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';

const props = defineProps(['status', 'message']);
const emits = defineEmits(['reset']);

const isWarning = computed(() => props.status.match(/warning/i));
const isError = computed(() => props.status.match(/error/i));

watch(
  () => props.message,
  () => {
    setTimeout(() => {
      emits('reset');
    }, 2000);
  }
);
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.hint-text {
  @include flex-freeze();

  max-width: 80%;
  height: 24px;

  @include border-radius(5px);
  @include padding-pale(0, $pale);
  @include text-color($default-white);

  opacity: 0.6;
}

.hint-icon {
  padding: math.div($pale, 3);
}

.hint-warning {
  background-color: $warning;
}
.hint-error {
  background-color: $error;
}
</style>
