<template>
  <ElBreadcrumb :separator-icon="ArrowRight" class="fb-breadcrumb">
    <ElBreadcrumbItem
      v-for="(item, key) in crumbs"
      :key="key"
      :to="item.href"
      class="fb-breadcrumb-item"
    >
      <template #default>
        <FRow :content="item.label" class="fb-breadcrumb-text">
          <template #prefix>
            <component
              v-if="item.icon"
              :is="item.icon"
              class="fb-breadcrumb-icon"
            ></component>
          </template>
        </FRow>
      </template>
    </ElBreadcrumbItem>
  </ElBreadcrumb>
</template>

<script lang="ts" setup>
import { ArrowRight } from '@element-plus/icons-vue';
import { ElBreadcrumb, ElBreadcrumbItem } from 'element-plus';
import FRow from '../Text/Row.vue';

defineProps(['crumbs']);
</script>

<style lang="scss" scoped></style>
