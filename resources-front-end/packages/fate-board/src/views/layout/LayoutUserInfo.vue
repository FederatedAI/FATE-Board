<template>
  <FRow ref="trigger" :content="username" :class="$attrs.class" class="l-username" />

  <el-popover
    v-if="username"
    ref="information"
    trigger="click"
    width="200"
    :virtual-ref="trigger"
    placement="top-start"
    virtual-triggering
    persistent
  >
    <section class="l-username-popover">
      <FRow :content="username" class="l-username-popover--content"></FRow>
      <el-button type="primary" @click="toSignIn"> Exit </el-button>
    </section>
  </el-popover>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const trigger = ref();
const information = ref();

const store = useStore();
const router = useRouter();

const username = computed(() => store.state.auth.username)

const toSignIn = () => {
  store.dispatch('signOut');
  store.dispatch('toSignIn')
};
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';

.l-username {
  justify-content: center;
  color: $default-white;
  cursor: pointer;
}

.l-username-popover {
  @include flex-col();
  @include flex-stretch();

  .l-username-popover--content {
    justify-content: flex-start;

    width: 90%;
    max-width: 240px;

    padding: $pale 0px ;
    font-weight: bold;
  }

  .el-button {
    width: 90%;
  }
}
</style>
