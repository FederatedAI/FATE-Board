<template>
  <button @click="change">change</button>
  <div class="app_container">
    <DAGGraphic ref="dag" :data="demo" @choose="choose" @retry="retry" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import DAGGraphic from '../lib/DAGGraphic/DAG.vue';

const dag = ref();

const demo = JSON.parse(
  "{\"component_module\":{\"binning_1\":\"hetero_feature_binning\",\"binning_0\":\"hetero_feature_binning\",\"psi_0\":\"psi\"},\"component_stage\":{\"binning_1\":\"train\",\"binning_0\":\"train\",\"psi_0\":\"default\"},\"component_list\":[{\"component_name\":\"binning_1\",\"status\":\"waiting\"},{\"component_name\":\"binning_0\",\"status\":\"waiting\"},{\"component_name\":\"psi_0\",\"time\":1699479165158,\"status\":\"failed\"}],\"component_need_run\":{\"binning_1\":true,\"binning_0\":true,\"psi_0\":true},\"dependencies\":{\"binning_1\":[{\"component_name\":\"binning_0\",\"model_type\":\"data\",\"up_output_info\":[\"train_output_data\"],\"type\":\"train_data\",\"data_source\":false}],\"binning_0\":[{\"component_name\":\"psi_0\",\"model_type\":\"data\",\"up_output_info\":[\"output_data\"],\"type\":\"train_data\",\"data_source\":false}],\"psi_0\":[{\"name_space\":\"experiment\",\"model_type\":\"data\",\"name\":\"breast_hetero_guest\",\"up_output_info\":[],\"type\":\"input_data\",\"data_source\":true}]}}");

function choose(data: object) {
  console.log('choose component', data);
}

function retry(data: object) {
  console.log('retry component', data);
}

function change() {
  dag.value.setStatus('homo_lr_0', 'fail');
}
</script>

<style lang="scss" scoped>
.app_container {
  position: relative;
  min-width: 1000px;
  min-height: 500px;
  font: 14px '微软雅黑';
  overflow: hidden;
}
</style>
