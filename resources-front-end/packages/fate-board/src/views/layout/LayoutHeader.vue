<template>
  <el-row class="l-header">
    <el-col :span="18" class="l-header-title">
      <LayoutIcon></LayoutIcon>
    </el-col>
    <el-col :span="6" class="l-header-operation">
      <el-row>
        <el-col :span="16">
          <LayoutPageTag></LayoutPageTag>
        </el-col>
        <el-col :span="8">
          <LayoutUserInfo></LayoutUserInfo>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import LayoutIcon from './LayoutIcon.vue';
import LayoutPageTag from './LayoutPageTag.vue';
import LayoutUserInfo from './LayoutUserInfo.vue';
</script>

<style lang="scss" scoped>
@import '@/style/index.scss';
.l-header {
  @include box-stretch();
  @include flex-row();
  @include flex-stretch();

  background-color: var(--el-color-primary);
}
</style>
