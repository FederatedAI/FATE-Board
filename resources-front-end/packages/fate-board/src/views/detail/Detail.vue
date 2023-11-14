<template>
  <div v-loading="detailLoading" class="f-detail">
    <section class="f-detail-header">
      <FCrumbs />
    </section>
    <section class="f-detail-main"> 
      <section class="f-detail-summary">
        <JobSummary :data="jobData" class="f-detail-summary-list"/>
        <section class="f-detail-summary-btn">
          <el-button type="primary" @click="toDashboard">Dashboard</el-button>
        </section>
      </section>
      <section class="f-detail-graphic">
        <Graphic class="f-detail-graphic-dag" @choose="componentChoose"/>
      </section>
      <section class="f-detail-parameter">
        <Parameter ref="parameter" class="f-detail-parameter-info"></Parameter>
        <section class="f-detail-parameter-btn">
          <el-button type="primary" :disabled="btnDisable" @click="detailDialog">View the Outputs</el-button>
        </section>
      </section>
    </section>
  </div>

  <OutputDialog ref="dialog"/>
</template>

<script lang="ts" setup>
import { FCrumbs } from '@/components/Crumbs';
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import Graphic from './DAGGraphic/Graphic.vue';
import OutputDialog from './Information/outputs.vue';
import JobSummary from './jobSummary/SummaryCard.vue';
import Parameter from './parameters/Parameter.vue';

const store = useStore();

const detailLoading = ref(true);
const parameter = ref()
const jobData = computed(() => store.state.job.details);
const btnDisable = ref(true) 

const componentChoose = async (comp: any) => {
  parameter.value.getParameter(comp)
  btnDisable.value = false
}

const toDashboard = () => store.dispatch('toDashboard')

const loadingCheck = () => Object.keys(store.state.job.dag).length > 0
watch(
  loadingCheck,
  () => detailLoading.value = false
)
if (loadingCheck()) detailLoading.value = false

const dialog = ref()
const detailDialog = () => {
  dialog.value.on()
}

onMounted(() => {
  setTimeout(() => {
    detailLoading.value = false
  }, 4000)
})

</script>

<style lang="scss" scoped>
@use 'sass:math';
@import '@/style/index.scss';

.f-detail {
  position: relative;
  width: 100%;
  height: 100%;
  @include flex-col();
  align-items: flex-start;
  justify-content: flex-start;
  overflow: hidden;

  .f-detail-header {
    position: relative;
    width: 100%;
    height: $pale * 2;
    min-height: $pale * 1.5;
    @include flex-freeze();
  }

  .f-detail-main {
    position: relative;
    width: 100%;
    height: calc(100% - $pale * 3);
    @include flex-row();
    justify-content: space-between;
    align-items: flex-start;
    padding-top: $pale;
  }

  .f-detail-summary {
    position: relative;
    height: 100%;
    flex: 1 2 20%;
    overflow-x: auto;
    padding: $pale;
    background-color: $default-bg;
    border-radius: math.div($pale, 3);
    
    .f-detail-summary-btn {
      width: 100%;
      position: sticky;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
      padding-top: $pale;

      .el-button {
        width: 100%;
      }
    }
  }

  .f-detail-graphic {
    position: relative;
    height: 100%;
    flex: 2 1 58%;
    margin: 0px $pale;
    padding: $pale;
    background-color: $default-bg;
    border-radius: math.div($pale, 3);

    .f-detail-graphic-dag {
      width: 100%;
      height: 100%;
    }
  }

  .f-detail-parameter {
    position: relative;
    height: 100%;
    flex: 2 1 20%;
    overflow-x: auto;
    background-color: $default-white;
    @include flex-col();
    justify-content: flex-start;
    align-items: center;
    padding: $pale;
    background-color: $default-bg;
    border-radius: math.div($pale, 3);

    .f-detail-parameter-info {
      flex: 1 1 95%;
      overflow: auto;
    }

    .f-detail-parameter-btn {
      width: 100%;
      flex: 1 1 5%;
      padding-top: $pale;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
