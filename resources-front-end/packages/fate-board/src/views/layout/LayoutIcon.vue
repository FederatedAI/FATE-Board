<template>
  <section class="l-title" @click="toHomePage">
    <span class="l-title--bold">FATE</span>Board
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
function toHomePage() {
  router.push('/');
}
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';
.l-title {
  @include padding-pale(0, $pale * 3);
  color: $default-white;
  @include title-2-size();
  cursor: pointer;
}

.l-title--bold {
  @include title-2-size();
  font-weight: bold;
}
</style>
