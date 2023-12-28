<template>
  <section class="f-count-table" :key="refresh">
    <section class="f-count-header">
      <slot name="title">
        <span></span>
      </slot>

      <el-checkbox-group v-model="checkboxList" v-if="checkbox.length > 1 || checkbox[0].options" class="f-count-box">
        <section
          v-for="(item, key) in checkbox"
          :key="key"
          class="f-count-item"
        >
          <el-checkbox :label="item.label" class="f-count-checkbox"></el-checkbox>
          <FSelection
            v-if="item.options"
            v-model="selectedList[item.label]"
            :options="item.options"
            multiple
            collapse-tags
            :disabled="selectionDisabled(item.label)"
          ></FSelection>
        </section>
      </el-checkbox-group>
    </section>
    <section>
      <FTable :header="tableInfomation.header" :data="tableInfomation.data" :total="tableInfomation.data.length" :size="10" :index="true"></FTable>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from '@vue/runtime-core';
import { isUndefined } from 'lodash';

const props = defineProps<{
  data: {
    [checkbox: string]: {
      options?: [
        {
          label: string;
          value: keyof any;
        },
      ];
      header: {
        [prop: keyof any]: any[];
      } | any[]
      data: {
        [prop: keyof any]: any[];
      } | any[]
    };
  };
  header: any[]
}>();

const selectedList = ref<{
  [checkbox: string]: any[] | undefined
}>({});

const checkbox = computed(() => {
  const list: any = [];
  for (const key in props.data) {
    const value = props.data[key];
    list.push({
      label: key,
      options: value?.options,
    });
    if (value?.options) {
      selectedList.value[key] = value?.options[0].value ? [value?.options[0].value] : [];
    }
  }
  return list;
});
watch(
  () => checkbox.value,
  () => {
    for (const box of checkbox.value) {
      selectedList.value[box.label] = box.options ? box.options?.[0] ? [box.options?.[0].value] : undefined : undefined
    }
  },
  { deep: true }
)

const checkboxList = ref([checkbox.value[0].label]);
const selectionDisabled = (key: string) => {
  return !checkboxList.value.some((item) => item === key);
};

const tableInfomation = computed(() => {
  const header: any = [...(props.header || [])]
  const data: any = []
  for (const checked of checkboxList.value) {
    if (!isUndefined(selectedList.value[checked])) {
      const selections = selectedList.value[checked]
      if (selections) {
        for (const selected of selections) {
          if (props.data && props.data[checked]) {
            header.push(...(props.data[checked].header?.[selected] || []))
            data.push(...(props.data[checked].data[selected] || []))
          }
        }
      }
    } else {
      if (props.data && props.data[checked]) {
        header.push(...(<any[]>(props.data[checked].header) || []))
        data.push(...(<any[]>(props.data[checked].data) || []))
      }
    }
  }
  return {
    header, data
  }
});

const refresh = ref(0)

watch(
  () => checkbox,
  () => refresh.value++
)

watch(
  () => selectedList,
  () => refresh.value++,
  { deep: true }
)
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';
.f-count-table {
  @include flex-col();
  align-items: flex-start;
  justify-content: flex-start;

  & > * {
    width: 100%;
  }

  .f-count-header {
    @include flex-row();
    align-items: center;
    justify-content: space-between;
    margin-bottom: $pale;

    .f-count-box{
      @include flex-row();
      align-items: center;
      justify-content: flex-start;
    }

    .f-count-item {
      @include flex-row();
      align-items: center;
      justify-content: flex-start;
      padding-right: $pale * 3;

      &:last-child {
        padding-right: 0px;
      }

      .f-count-checkbox {
        padding-right: math.div($pale, 3);
      }
    }
  }
}
</style>
