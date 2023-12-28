<template>
  <section class="login-container">
    <SignInTitle />
    <SignInHint
      :status="hintStatus"
      :message="hintMessage"
      :display="hintDisplay"
      @reset="reset"
    />
    <SignInForm @signIn="signInRequest" />
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import Message from './message';
import SignInForm from './SignInForm.vue';
import SignInHint from './SignInHint.vue';
import SignInTitle from './SignInTitle.vue';

const hintMessage = ref('');
const hintStatus = ref('');
const hintDisplay = ref(true);
const store = useStore();

const hint = (type) => {
  hintMessage.value = Message[type].message;
  hintStatus.value = Message[type].status;
};
const reset = () => {
  hintMessage.value = '';
  hintStatus.value = '';
};

const signInRequest = async (ingredient) => {
  if (!ingredient.username) {
    hint('hintForUsername');
  } else if (!ingredient.password) {
    hint('hintForPassword');
  } else {
    const responseData = await store.dispatch('signIn', ingredient);
    
    if (!responseData) {
      hint('hintForSignInFailed');
    } else {
      store.dispatch('toRecord')
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';
.login-container {
  height: 75%;
  @include flex-col();
  @include flex-center();

  > :nth-child(n) {
    margin-bottom: $pale;
  }
}
</style>
