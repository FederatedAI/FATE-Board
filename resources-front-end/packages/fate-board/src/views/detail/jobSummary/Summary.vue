<template>
  <section class="f-summary-list">
    <component
      v-for="(item, key) in information"
      :key="key"
      :is="item.tag"
      v-bind="item"
      class="f-summary-item"
    />
  </section>
</template>

<script lang="ts" setup>
import { toDate, toTime } from 'fate-tools';
import { isObject } from 'lodash';
import { onBeforeMount, reactive, watch } from 'vue';
import Download from './Download.vue';
import Edit from './Edit.vue';
import Text from './Text.vue';

const props = defineProps(['data']);

const information: any = reactive({
  fJobId: { tag: Text, title: 'Job ID', col: true },
  fStatus: { tag: Text, title: 'status', col: true },
  fDescription: { tag: Edit, title: 'notes' },
  fRole: { tag: Text, title: 'role' },
  fPartyId: { tag: Text, title: 'party ID' },
  fDownload: { tag: Download },
  fCreateTime: { tag: Text, title: 'submission time', col: true },
  fStartTime: { tag: Text, title: 'start time', col: true },
  fEndTime: { tag: Text, title: 'end time', col: true },
  fElapsed: {  tag: Text, title: 'duration', col: true },
});

const explain = () => {
  for (const key in props.data) {
    if (information[key]) {
      const value = props.data[key];
      if (isObject(value)) {
        information[key] = Object.assign(information[key], value);
      } else {
        if (key.match(/(time)/i)) information[key].content = toDate(value);
        else if (key.match(/elapsed/i)) information[key].content = toTime(value);
        else information[key].content = value;
      }
    }
  }
};

onBeforeMount(
  () => explain());

watch(
  () => props.data,
  explain,
  { deep: true });

</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-summary-list {
  @include box-stretch();
  @include flex-col();
  justify-content: flex-start;
  align-items: flex-start;

  .f-summary-item {
    width: 100%;
    padding-top: math.div($pale, 2);
    padding-bottom: math.div($pale, 2);
    border-bottom: 1px solid $default-white;
  }
}
</style>
