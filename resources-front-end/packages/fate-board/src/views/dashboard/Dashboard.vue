<template>
  <section class="f-dashboard">
    <section class="f-dashboard-header">
      <FCrumbs />
    </section>
    <section class="f-dashboard-main">
      <section class="f-dashboard-information" :class="{
        'f-dashboard-information--expend': expand
      }">
        <Information class="f-dashboard-item f-dashboard-info"></Information>
        <Gauge class="f-dashboard-item f-dasboard-guage"></Gauge>
        <Dag class="f-dashboard-item f-dashboard-dag"></Dag>
      </section>
      <section class="f-dashboard-log" :class="{
        'f-dashboard-log--expend': expand
      }">
        <Logs @expand="expand_change"/>
      </section>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { FCrumbs } from '@/components/Crumbs';
import { ref } from 'vue';
import Dag from './DAG/DAG.vue';
import Gauge from './Gauge/Gauge.vue';
import Information from './Information/Information.vue';
import Logs from './Log/Log.vue';

const expand = ref(false)
const expand_change = (newExpend: boolean) => {
  expand.value = newExpend
}
</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-dashboard {
  position: relative;
  width: 100%;
  height: 100%;
  @include flex-col();
  align-items: flex-start;
  justify-content: flex-start;
  overflow: hidden;

  .f-dashboard-header {
    position: relative;
    width: 100%;
    height: $pale * 2;
    min-height: $pale * 1.5;
    @include flex-freeze();
  }

  .f-dashboard-main {
    position: relative;
    width: 100%;
    height: calc(100% - $pale * 3);
    @include flex-col();
    justify-content: space-between;
    align-items: flex-start;
    padding-top: $pale;

    .f-dashboard-information {
      width: 100%;
      padding-bottom: $pale;
      flex: 1 1 40%;
      max-height: 40%;

      @include flex-row();
      justify-content: space-between;

      .f-dashboard-item {
        height: 100%;
        flex: 1 1 26%;
        max-width: calc(33% - math.div($pale, 2));
        background-color: $default-bg;
        padding: $pale;
        border-radius: math.div($pale, 3);
      }
    }

    .f-dashboard-information--expend {
      display: none;
    }

    .f-dashboard-log {
      width: 100%;
      flex: 1 1 60%;
      max-height: 60%;
      background-color: $default-bg;

      @include flex-row();
      justify-content: space-between;
    }
    .f-dashboard-log--expend {
      flex: 1 1 100%;
      max-height: 100%;
    }
  }
}
</style>
