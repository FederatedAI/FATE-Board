<template>
  <ElTableColumn v-bind="$attrs">
    <template #default="scope">
      <section class="fb-table-action">
        <template
          v-for="(btn, index) in isFunction(operations)
            ? operations(scope)
            : operations"
          :key="index"
        >
          <span
            v-if="index > 0"
            class="fb-table-action-seperator"
          >
            |
          </span>
          <FRow
            v-if="btn.label"
            :content="btn.label"
            class="fb-table-txRow fb-table-txRow--link"
            @click="btn.onClick(scope)"
          >
            <template #prefix>
              <ElIcon v-if="btn.icon" class="fb-table-icon">
                <component :is="btn.icon"></component>
              </ElIcon>
            </template>
          </FRow>
        </template>
      </section>
    </template>
  </ElTableColumn>
</template>

<script lang="ts" setup>
import { ElIcon, ElTableColumn } from 'element-plus';
import { isFunction } from 'lodash';
import FRow from '../../Text/Row.vue';

/**
 * [{
 *    label: string,
 *    icon: component,
 *    click: (row: any) => unknown
 * }]
 */
const props = defineProps(['operations']);
</script>
