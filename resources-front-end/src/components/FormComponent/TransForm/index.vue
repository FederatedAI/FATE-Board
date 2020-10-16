<template>
  <div :class="className" class="transform__container">
    <el-link @click.stop="showDialog">selected</el-link>
    <div v-show="dialogShowing" class="transform__dialog">
      <header class="transform__header">
        <slot name="header">
          <span class="transform__title">{{ label }}</span>
          <i class="el-icon-close transform__icon" @click.stop="closeDialog" />
        </slot>
      </header>
      <section class="transform__body">
        <div class="transform__list">
          <span class="transform__list-header">
            <div class="transform__header-op">
              <span>Select Variables</span>
              <el-link class="transform__header-link" @click.stop="selectAll">select all</el-link>
            </div>
          </span>
          <div class="tranform__list-body">
            <div v-for="(item, index) in choosed" :key="index" class="transform__list-item align-left">
              <el-checkbox v-model="item.checked" class="transform__checkbox" />
              <span class="transform__checkbox-label" @click.stop="changeItem(item)">{{ item.label }}</span>
            </div>
          </div>
        </div>
        <div class="transform__list">
          <span class="transform__list-header">Selectd</span>
          <div class="tranform__list-body">
            <div
              v-for="(item, index) in choosed"
              v-show="item.checked"
              :key="index"
              class="transform__list-item align-right"
              @click.stop="deleteItem(item)"
            >
              <span class="transform__item-span">{{ item.label }}</span>
              <i class="el-icon-close transform__icon" @click.stop="deleteItem(item)" />
            </div>
          </div>
        </div>
      </section>
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
  name: 'CusTransform',
  props: {
    label: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    className: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      choosed: [],
      dialogShowing: false
    }
  },
  watch: {
    options: {
      handler() {
        this.toDisplay()
      }
    }
  },
  created() {
    this.toDisplay()
  },
  methods: {
    toDisplay() {
      const res = []
      for (const val of this.options) {
        res.push({
          label: val,
          checked: true
        })
      }
      this.choosed = res
    },

    closeDialog() {
      this.dialogShowing = false
    },
    showDialog() {
      this.dialogShowing = true
    },
    deleteItem(val) {
      val.checked = false
      this.transform()
    },
    changeItem(val) {
      val.checked = !val.checked
      this.transform()
    },
    selectAll() {
      for (const val of this.choosed) {
        val.checked = true
      }
      this.transform()
    },
    getProperty() {
      const res = []
      for (const val of this.choosed) {
        if (val.checked) {
          res.push(val.label)
        }
      }
      return res
    },
    transform() {
      this.$emit('transform', this.getProperty())
    },
    setDefault() {
      this.transform()
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../styles/position';
@import '../../../styles/common_style';
.transform__container {
	position: relative;
	.transform__dialog {
		@include flex(column, flex-start, center);
		min-width: 450px;
		height: 350px;
		padding: 12px 25px;
		padding-right: 35px;
		@include shadow(#aaa);

		position: absolute;
		top: 0;
		left: 0;

		background-color: #fff;

		.transform__header {
			@include flex(row, space-between, center);
			width: 100%;
			min-height: 10px;
			margin-right: -55px;
			& > .transform__title {
				padding-left: 5px;
			}
		}
		.transform__body {
			@include flex(row, space-between, center);
			width: 100%;
			height: calc(100% - 10px);

			.transform__list:first-child {
				margin-right: 15px;
			}

			.transform__list {
				@include flex(column, flex-start, center);
				min-width: 50%;
				height: 100%;

				.transform__list-header {
					width: 100%;
					padding-left: 5px;
					margin-bottom: 12px;
					.transform__header-op {
						@include flex(row, space-between, center);
						font-weight: bold;
					}
					.transform__header-link {
						margin-right: 5px;
						font-size: 0.85em;
					}
				}
				.tranform__list-body {
					@include flex(column, flex-start, center);
					width: 100%;
					height: calc(100% - 30px);
					overflow: auto;
					padding: 2px;

					.transform__list-item {
						@include flex(row, space-between, center);
						width: 100%;
						min-height: 30px;
						& > .transform__item-span {
							padding-left: 5px;
							width: calc(100% - 35px);
							@include texthide;
							font-size: 0.86em;
							color: #494ece;
						}
						& > .transform__checkbox {
							padding-left: 5px;
							padding-right: 10px;
						}
						& > .transform__checkbox-label {
							width: calc(100% - 25px);
							@include texthide;
							font-size: 0.86em;
							color: #449944;
						}
					}

					.align-left {
						justify-content: flex-start;
						&:nth-child(2n) {
							background-color: #ddd;
						}
					}
					.align-right {
						border-bottom: 1px solid #aaa;
					}
				}
			}
		}
	}
	.transform__icon {
		cursor: pointer;
		&:hover {
			color: #494ece;
		}
		&:active {
			color: #494ece;
		}
	}
}
</style>
