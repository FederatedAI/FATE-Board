<template>
  <section class="f-sub-tabs">
    <el-tooltip
      v-for="(item, key) in options"
      :key="key"
      :content="`id: ${String(item.label)}`"
      effect="dark"
      placement="top">
      <article
        :style="{ backgroundColor: colorGet(item) }"
        :class="{
          'f-sub-item': true,
          'f-sub-item--active': key === current
        }"
        @click.stop="choose(item)">
      </article>
    </el-tooltip>
  </section>
</template>

<script lang="ts" setup>
import { toRGBA } from 'fate-tools';
import { computed, ref, withDefaults } from 'vue';

interface Props {
  options: Array<{
    label: string
    weight: number,
    value: keyof any
  }> | undefined,
  color?: string
  max: number
  min: number
}

const props = withDefaults(defineProps<Props>(), {
  options: undefined,
  color: '#409eff',
  max: -1,
  min: -1
})
const emits = defineEmits(['choose'])

const current = ref(0)

const limitation = computed(() => {
  let max = props.max, min = props.min
  if (props.max > 0 && props.min > 0) {
    return {
      max: props.max,
      min: props.min
    }
  } else if (props.options) {
    props.options.forEach((item: any) => {
      if (max === -1 || item.weight > max) {
        max = item.weight
      }
      if (min === -1 || item.weight < min) {
        min = item.weight
      }
    })
    return { max, min }
  } else {
    return { max, min }
  }
})

function colorGet(option: any) {
  if (parseInt(option.size) !== 0) {
    const colors = toRGBA(props.color)
      .toLowerCase()
      .replace('rgba(', '')
      .replace(')', '')
      .split(',')
    colors[3] =
      1 -
      0.8 *
      ((limitation.value.max - (typeof option === 'object' ? option.size : option)) / limitation.value.max)
    return 'rgba(' + colors.join(',') + ')'
  } else {
    return '#909399'
  }
}

function choose(item: any) {
  current.value = item.value
  emits('choose', current.value)
}
</script>

<style lang="scss" scoped>

</style>
