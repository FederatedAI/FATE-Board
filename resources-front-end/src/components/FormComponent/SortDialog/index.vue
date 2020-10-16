<template>
  <div class="sortDialog__container">
    <div class="sortDialog__content">
      <slot>
        <i class="el-icon-sort" @click.stop="showDialog" />
      </slot>
    </div>
    <div v-show="dialog" class="sortDialog__dialog" @click.stop>
      <header class="sortDialog__header">Sort by</header>
      <search :input-class-name="'sortDialog__input'" class="sortDialog__search" @search="searching" />
      <main class="sortDialog__main">
        <checkbox-group
          v-show="currentOptions.length > 0"
          :options="currentOptions"
          :single="true"
          :group-class-name="'sortDialog__checkbox'"
          :class-name="'sortDialig__eachbox'"
          class="sortDialog__box"
          @change="sortChange"
        />
        <div v-show="currentOptions.length === 0" class="sortDialog__box">No Data</div>
      </main>
      <footer class="sortDialog__footer">
        <div class="sortDialog__left">
          <i class="el-icon-top" @click="sortMethod('ascending')" />
          <i class="el-icon-bottom" @click="sortMethod('descending')" />
        </div>
        <el-button :disabled="btnDisabled" class="sortDialog__right" @click="sorting">OK</el-button>
      </footer>
    </div>
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
  name: 'SortDialog',
  components: {
    checkboxGroup: () => import('../Checkbox'),
    search: () => import('../Searching')
  },
  props: {
    options: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      sortOrder: 'ascending',
      sortCol: '',
      dialog: false,
      btnDisabled: true,
      currentOptions: [...this.options]
    }
  },
  watch: {
    sortOrder() {
      this.btnDisabled = false
    },
    sortCol() {
      this.btnDisabled = false
    }
  },
  created() {
    document.addEventListener('click', this.hideDialog)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.hideDialog)
  },
  methods: {
    sortMethod(type) {
      this.sortOrder = type
    },
    sortChange(param) {
      if (param[0]) {
        this.sortCol = param[0]
      }
    },
    searching(param) {
      const res = []
      for (const val of this.options) {
        if (val.label.match(param)) {
          res.push(val)
        }
      }
      this.currentOptions = res
    },
    showDialog() {
      this.dialog = true
    },
    hideDialog() {
      this.dialog = false
    },
    sorting() {
      this.$emit('sorting', {
        col: this.sortCol,
        order: this.sortOrder
      })
      this.btnDisabled = true
      this.hideDialog()
    }
  }
}
</script>

<style lang="scss">
@import '../../../styles/position';
@import '../../../styles/common_style';
.sortDialog__container {
	position: relative;
	.sortDialog__dialog {
		@include flex(column, flex-start, center);
		min-width: 230px;
		max-height: 350px;
		padding: 12px;
		@include shadow(#aaa);

		position: absolute;
		top: 0;
		left: 0;

		background-color: #fff;
		.sortDialog__header {
			width: 100%;
			font-size: 1.12em;
			height: 25px;
			margin-bottom: 12px;
		}
		.sortDialog__search {
			width: 100%;
		}
		.sortDialog__input {
			width: 100%;
			max-width: 100%;
		}
		.sortDialog__main {
			width: 100%;
			max-height: calc(100% - 62px);
			min-height: 100px;

			.sortDialog__box {
				width: 100%;
			}
			.sortDialog__checkbox {
				@include flex(column, flex-start, center);
			}
			.sortDialig__eachbox {
				@include flex(row, flex-start, center);
				width: 100%;
				margin: 0px;
				padding-left: 5px;
				&:nth-child(2n) {
					background-color: #ddd;
				}
			}
		}
	}
}
</style>
