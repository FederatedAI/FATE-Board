<template>
  <section @keydown.enter="signInSubmit" class="s-login_container">
    <section class="form_item">
      <el-input
        v-model="formForLoginParameter.username"
        v-focus
        placeholder="Username"
      />
    </section>
    <section class="form_item">
      <el-input
        v-model="formForLoginParameter.password"
        type="password"
        placeholder="Password"
        show-password
      />
    </section>
    <section class="form_item">
      <el-button type="primary" class="s-login_submit" @click="signInSubmit"
        >Sign in</el-button
      >
    </section>
  </section>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';

const emits = defineEmits(['signIn']);
const formForLoginParameter = reactive({
  username: '',
  password: '',
});

function signInSubmit() {
  emits('signIn', formForLoginParameter);
}
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';

.s-login_container {
  position: relative;
  min-width: 260px;
  @include flex-col();
  @include flex-center();

  .form_item {
    width: 100%;
    @include flex-row();
    @include flex-center();
    margin-bottom: $pale;
  }

  .s-login_submit {
    min-width: 120px;
  }
}
</style>
