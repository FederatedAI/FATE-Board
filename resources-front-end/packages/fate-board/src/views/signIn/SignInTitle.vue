<template>
  <p class="login-title title-1">Welcome to FATEBoard</p>
</template>

<style lang="scss" scoped>
@import '@/style/index.scss';
.title-1 {
  @include title-1-size();
  @include text-bold();
}

.login-title {
  background: linear-gradient(159deg, #5e7feb 0%, #0ec7a5 100%);
  background-clip: initial;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
