<template>
  <section :key="refresh" class="f-dataset-container">
    <article v-show="current" class="f-dataset">
      <span class="f-dataset-title"
        >dataset
        <span class="f-dataset-seperator">:</span>
      </span>

      <section class="f-dataset-content f-dataset-hidden">
        <FRow
          v-for="(each, key) in current"
          :key="key"
          :content="`${each.namespace}.${each.name}`"
          :contentClassName="'f-dataset-item'"
        ></FRow>
      </section>
    </article>

    <article v-show="others">
      <article v-for="(other, key) in others" :key="key" class="f-dataset">
        <span class="f-dataset-title"
          >{{ key }}
          <span class="f-dataset-seperator">:</span>
        </span>

        <el-popover placement="right" trigger="click" width="350">
          <template #reference>
            <section class="f-dataset-popover">
              <span>{{ Object.keys(other).length }}</span>
              <el-link type="primary" class="f-dataset-view">view</el-link>
            </section>
          </template>

          <section class="f-dataset-content f-dataset-pop-content">
            <section class="f-d-c-row f-d-c-title">
              <article>Party ID</article>
              <article>Dataset</article>
            </section>
            <section
              v-for="(item, partyid) in other"
              :key="partyid"
              class="f-d-c-row"
            >
              <article>{{ partyid }}</article>
              <article class="f-d-c-col">
                <span v-for="each in item">{{
                  `${each.namespace}. ${each.name}`
                }}</span>
              </article>
            </section>
          </section>
        </el-popover>
      </article>
    </article>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';

const props = defineProps(['dataset']);

const refresh = ref(0);
const store = useStore();
const setExplain = (dataset: any, key: string) => {
  if (dataset?.[key]) {
    const parties = Object.keys(dataset[key]);
    if (parties.length > 0) {
      const datasetItem = dataset[key][parties[0]];
      if (datasetItem && datasetItem.length > 0) {
        return dataset[key];
      }
    }
  }
  return undefined;
};

const guest = computed(() => setExplain(props.dataset, 'guest'));
const host = computed(() => setExplain(props.dataset, 'host'));
const arbiter = computed(() => setExplain(props.dataset, 'arbiter'));
const role = computed(() => store.state.job.details?.fRole);
const party = computed(() => store.state.job.details?.fPartyId);

const current = computed(() => {
  if (role.value) {
    if (role.value.match(/guest/i)) {
      return guest.value?.[party.value];
    } else if (role.value.match(/host/i)) {
      return host.value?.[party.value];
    } else if (role.value.match(/arbiter/i)) {
      return arbiter.value?.[party.value];
    }
  }
  return undefined;
});
const others = computed(() => {
  if (role.value) {
    const result = <any>{};
    if (!role.value.match(/guest/i) && guest.value) {
      result.guest = guest.value;
    }
    if (!role.value.match(/host/i) && host.value) {
      result.host = host.value;
    }
    if (!role.value.match(/arbiter/i) && arbiter.value) {
      result.arbiter = arbiter.value;
    }
    return result;
  }
  return undefined;
});

watch(
  () => props.dataset,
  () => {
    refresh.value++;
  }
);

watch(
  () => role.value,
  () => {
    refresh.value++;
  }
);

watch(
  () => party.value,
  () => {
    refresh.value++;
  }
);
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-dataset-container {
  width: 100%;
  position: relative;
  @include flex-col();
  align-items: flex-start;
  justify-content: flex-start;
}
.f-dataset {
  width: 100%;
  @include flex-row();
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: nowrap;
  margin-bottom: $pale;

  &:last-child {
    margin-bottom: 0px;
  }

  .f-dataset-title {
    display: inline-block;
    @include text-size();
    min-width: 80px;
    color: var(--el-color-info);
    padding-bottom: math.div($pale, 4);
    flex: 1 1 auto;

    .f-dataset-seperator {
      padding: 0px math.div($pale, 4);
    }
  }

  .f-dataset-popover {
    @include flex-row();
    align-items: center;
    justify-content: flex-start;
    @include text-size-small();
    color: var(--el-color-info-dark-2);

    & > span {
      padding-right: $pale;
    }
  }

  .f-dataset-view {
    @include text-size-small();
  }
}

.f-dataset-content {
  @include flex-col();

  :deep(.f-dataset-item) {
    @include text-size-small();
    color: var(--el-color-info-dark-2);
  }

  .f-d-c-row {
    @include flex-row();
    :first-child {
      min-width: 100px;
    }
    .f-d-c-col {
      @include flex-col();
    }
  }

  .f-d-c-title {
    @include text-size();
    color: var(--el-color-info);
  }
}

.f-dataset-hidden {
  flex: 2 2 auto;
  width: calc(100% - 80px);
}

.f-dataset-pop-content {
  .f-d-c-row {
    margin-bottom: $pale;

    &:last-child {
      margin-bottom: 0px;
    }
  }
}
</style>
