<template>
  <section class="f-crumbs">
    <FBreadCrumb :crumbs="crumbs" />
  </section>
</template>

<script lang="ts" setup>
import { HomeFilled } from '@element-plus/icons-vue';
import { capitalize } from 'lodash';
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const crumbs = computed(() => {
  const hrefs: any[] = [];
  for (const each of store.state.crumb.crumbs) {
    hrefs.push({
      icon: each.name === 'running' ? HomeFilled : undefined,
      href: each,
      label:
        each.name === 'running'
          ? 'Home'
          : `${capitalize(each.name)}${
              store.state.job.jobId ? '(Job:' + store.state.job.jobId + ')' : ''
            }`,
    });
    return hrefs
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-crumbs {
  background-color: $default-bg;
  @include text-size-small();
  padding: math.div($pale, 3);
  color: var(--el-color-primary);
  border: math.div($pale, 3);
}
</style>
