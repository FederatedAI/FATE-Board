<template>
  <section class="f-feature-importance" :key="refresh">
    <section class="f-fi-item f-fi-operation">
      <article class="f-fi-text">
        <article class="f-fi-title">
          <slot name="title" :title="title">
            {{ title }}
          </slot>
        </article>
        <article class="f-fi-subtext">
          <slot name="subtitle" :count="count">
            template{{ count }} features involved in model spliting
          </slot>
        </article>
      </article>
      <FSelection v-if="options.length > 0" v-model="selected" :options="options" class="f-fi-selection"></FSelection>
    </section>
    <section class="f-fi-item f-fi-main">
      <FTable :header="header" :data="data" :index="true" class="f-fi-table"></FTable>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  data: {
    [label: string]: {
      header: any[],
      data: any[]
    }
  },
  title: string
}>()

const options = computed(() => {
  const list: any = []
  for (const key in props.data) {
    list.push({
      label: key,
      value: key
    })
  }
  return list
})
const selected = ref(options.value[0] ? options.value[0].value : '')

const header = computed(() => {
  return selected.value ? props.data[selected.value].header || [] : []
})
const data = computed(() => {
  return selected.value ? props.data[selected.value].data || [] : []
})
const count = computed(() => {
  return data.value.length
})
const refresh = ref(0)

watch(
  () => options.value,
  () => {
    selected.value = options.value[0] ? options.value[0].value : ''
  },
  { deep: true }
)
watch(
  () => selected.value,
  () => {
    refresh.value ++ 
  }
)
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';

.f-feature-importance {
  width: 100%;
  position: relative;
  @include flex-col();
  align-items: flex-start;
  justify-content: flex-start;

  .f-fi-item {
    width: 100%;
    flex: 0 0 auto;
    margin-bottom: $pale;
  }

  .f-fi-operation {
    @include flex-row();
    align-items: center;
    justify-content: space-between;
    min-height: 45px;

    .f-fi-text {
      @include flex-row();
      align-items: center;
      justify-content: flex-start;

      .f-fi-title {
        @include title-3-size();
        color: var(--el-color-info-dark-2);
        padding-right: $pale * 3;
      }

      .f-fi-subtext {
        @include text-size();
        color: var(--el-color-info-light-3);
      }
    }
  }

  .f-fi-main {
    flex: 1 1 auto;
  }
}
</style>
