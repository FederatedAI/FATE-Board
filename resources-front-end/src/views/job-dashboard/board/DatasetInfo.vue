<template>
  <div class="flex flex-col col dataset-info">
    <!-- title -->
    <h3 class="list-title">Dataset info</h3>

    <!-- content -->
    <el-row v-for="(row,index) in list" :key="index" :gutter="24" class="dataset-row">
      <el-col :span="6">
        <div class="dataset-item">
          <p class="name dataset-title">{{ row.role }}</p>
          <p v-if="row.options.length===1" class="value">{{ row.roleValue }}</p>
          <el-select v-else :value="row.roleValue" @change="selectChange(row, $event)">
            <el-option
              v-for="(option,index) in row.options"
              :key="index"
              :value="option.value"
              :label="option.label"
            />
          </el-select>
        </div>
      </el-col>
      <el-col :span="14">
        <div class="dataset-item">
          <p class="name">dataset</p>
          <p class="value">
            <overflow-tooltip :tooltip-options="{ popperClass: 'tooltip-content' }" placement="top">
              <template slot="content">
                <p
                  v-for="(values, valIndex) in (row.datasetData[row.roleValue] || [])"
                  :key="valIndex"
                >{{ values }}</p>
              </template>
              <span
                slot="default"
                class="toolContent"
              >{{ row.datasetData ? Object.values(row.datasetData[row.roleValue]).join(', ') : '' }}</span>
            </overflow-tooltip>
          </p>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
/**
 *
 *  Copyright 2019 The FATE Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import OverflowTooltip from '@/components/OverflowTooltip'

export default {
  name: 'DatasetInfo',
  components: {
    OverflowTooltip
  },
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    selectChange(row, val) {
      row.roleValue = val
      this.$forceUpdate()
    }
  }
}
</script>
<style lang="scss">
.toolContent {
	display: inline-block;
	width: 100%;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: #4159d1;
}
</style>
