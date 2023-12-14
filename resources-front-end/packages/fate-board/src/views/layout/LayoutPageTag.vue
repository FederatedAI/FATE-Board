<template>
  <el-row v-if="username && tags.length > 0" class="l-pagetag">
    <el-col v-for="tag in tags" :key="tag.name" :span="24 / tags.length">
      <el-link
        :underline="false"
        :class="{
          'l-pagetage-link': true,
          'l-pagetage-link--active': tag.name === current
        }"
        @click="() => router.push(tag)"
        >{{ tag.pageTag }}</el-link
      >
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import { RouterRecord } from '@/store/modules/crumb';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();

const username = computed(() => store.state.auth.username);
const current = computed(() => {
  const list: RouterRecord[] = store.state.crumb.crumbs
  return list[list.length - 1]?.name || ''
})
const tags = computed(() =>
  router.options.routes.reduce((pre: any[], route: any) => {
    if (route.pageTag) pre.push(route);
    return pre;
  }, [])
);
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';

.l-pagetage-link {
  @include flex-row();
  @include flex-center();

  cursor: pointer;
  color: $default-white;
  @include text-size();

  &:hover {
    color: $default-white;
    font-weight: 700;
  }
}

.l-pagetage-link--active {
  font-weight: bold;
}
</style>
