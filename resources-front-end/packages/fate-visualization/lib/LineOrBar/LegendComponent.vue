<template>
  <div class="legend_container">

    <article
      v-for="(item, i) in upper"
      :key="i"
      class="legend_group"
      @click="selecting(item)"
    >

      <div v-for="(name, j) in item" :key="name" class="legend_each_group">
        <span :style="{
          backgroundColor: colorCheck(name, i, j)
        }" class="legend_color"></span>
        <span class="legend_text">{{name}}</span>
      </div>
      
    </article>

    <ElPopover
      :width="400"
      placement="bottom-start"
      trigger="click"
      popper-style="z-index:2100;"
      @hide="openPopover=false"
    >

      <template #reference>
        <div class="popover_trigger" @click.stop="openPopover=true">
          <ArrowUpBold v-show="openPopover" :style="iconStyle"/>
          <ArrowDownBold v-show="!openPopover" :style="iconStyle"/>
        </div>
      </template>

      <div class="legend_container legend_popover_container">
        <article
          v-for="(item, i) in legend"
          :key="i"
          class="legend_group "
          @click="selecting(item)"
        >
          <div v-for="(name, j) in item" :key="name" class="legend_each_group">
            <span :style="{
              backgroundColor: colorCheck(name, i, j)
            }" class="legend_color"></span>
            <span class="legend_text">{{name}}</span>
          </div>
        </article>
      </div>
      
    </ElPopover>
  </div>
</template>

<script lang='ts' setup>
import { ElPopover } from 'element-plus';
import { computed, reactive, ref } from 'vue';

const props = defineProps(['legend', 'max', 'upperMax', 'color'])
const emits = defineEmits(['select'])
const selected: Set<string> = reactive(new Set())
const colorCheck = (name: string, i: number, j:number) => {
  if (selected.has(name)) {
    if (props.color) {
      return Array.isArray(props.color[i])
        ? props.color[i][j]
        : props.color[i]
    }
  }
  return '#8c8c8c'
}

const iconStyle = {
  width: '18px',
  height: '18px',
  'vertical-align': 'center'
}

const upper = computed(() => {
  const gp = props.legend[0]?.length || 1
  return props.legend.slice(0, props.upperMax || gp || 4)
})

const openPopover = ref(false)

function selecting (item?: string[]) {
  if (item) {
    for (const choosed of item) {
      const hasOption = selected.has(choosed)
      if (hasOption) {
        selected.delete(choosed)
      } else {
        selected.add(choosed)
      }
    }
  } else {
    const choosable = props.legend.flat(Infinity).slice(0, props.max || 12)
    for (const each of choosable) {
      selected.add(each)
    }
  }
  emits('select', [...selected.values()])
}

defineExpose({
  selecting
})
</script>

<style lang='scss' scoped>
.legend_container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}
.legend_popover_container {
  width: 100%;
  flex-wrap: wrap;
  & > article {
    flex-basis: 30%;
    margin-bottom: 6px;
  }
}
.legend_group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  margin-right: 12px;
}
.legend_each_group {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
}
.legend_color {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  margin-right: 5px;
  flex-grow: 0;
  flex-shrink: 0;
}
.popover_trigger {
  width: 20px;
  height: 20px;
  padding: 5px;
  border-radius: 15px;
  border: 1px solid #8c8c8c;
  font-size: 12px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
