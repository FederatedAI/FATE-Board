<template>
  <div class="cweight__container" @click.stop="click(cell)">
    <el-progress :percentage="percentage(cell)" :show-text="showWeight" class="cweight__progress" />
    <span class="cweight__weight">{{ spanContent(cell) }}</span>
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

export default {
  name: 'WeightCol',
  props: {
    total: {
      type: Number | String,
      default: 100
    },
    showWeight: {
      type: Boolean,
      default: false
    },
    cell: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    percentage(cell) {
      let res =
				((!isNaN(parseFloat(cell.row[cell.column.property]))
				  ? parseFloat(cell.row[cell.column.property])
				  : 0) /
					parseFloat(this.total)) *
				100
      if (res > 100) res = 100
      else if (res < 0) res = 0
      return res
    },
    spanContent(cell) {
      return cell.row[cell.column.property] || 0
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../styles/position';
.cweight__container {
	@include flex(row, flex-start, center);
}

.cweight__progress {
	width: calc(100% - 100px);
	min-width: 100px;
	height: 10px;
}

.cweight__weight {
	margin-left: 10px;
	width: 100px;
}
</style>
