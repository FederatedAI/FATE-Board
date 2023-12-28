<template>
  <el-container class="layout-container">
    <el-header class="layout-header">
      <LayoutHeader />
    </el-header>
    <el-main class="layout-body">
      <router-view v-slot="{ Component }">
        <!-- <transition name="fade"> -->
          <component :is="Component" />
        <!-- </transition> -->
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import LayoutHeader from './LayoutHeader.vue';
</script>

<style lang="scss">
@import 'element-plus/dist/index.css';
@import '@/style/index.scss';

.layout-container {
  position: relative;

  @include box-stretch();

  min-width: 900px;
  min-height: 500px;

  @include flex-row();
  @include flex-stretch();
  
  background-color: $default-white;
  overflow: hidden;

  .layout-header {
    position: relative;

    @include width-stretch();
    height: 48px;

    @include padding-pale(0, 0);
    @include flex-freeze();
  }

  .layout-body {
    position: relative;

    width: 96%;
    height: calc(100% - 48px);

    @include padding-pale(0, 0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0
}
</style>
