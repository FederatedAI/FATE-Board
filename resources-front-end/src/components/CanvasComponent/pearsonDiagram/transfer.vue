<template>
  <div class="flex flex-row">
    <div class="flex flex-col col-list col-left">
      <div class="flex flex-col flex-start title-part text-title">
        <span class="selected-title">Select Variables</span>
        <div class="flex flex-row flex-center space-between searching-part">
          <el-input
            v-model="searchInput"
            size="mini"
            placeholder="Search Variables"
            class="search-input"
          >
            <el-button slot="append" size="mini" icon="el-icon-search" />
          </el-input>
          <span class="select_all" @click="chooseingAll">select all</span>
        </div>
      </div>
      <div class="choose-list choose-list-allinfo">
        <ul class="for-selected">
          <li v-for="(item, index) in infos" v-show="match(item.label)" :key="index">
            <el-checkbox v-model="item.checked" @change="chooseing(item, index)">{{ item.label }}</el-checkbox>
          </li>
        </ul>
      </div>
    </div>
    <div class="flex flex-col col-list col-right">
      <div class="title-part text-title">
        <span class="selected-title">Selected</span>
        <div class="searching-part" />
      </div>
      <div class="choose-list choose-list-choosed">
        <ul class="being-selected">
          <li
            v-for="(item, index) in infos"
            v-show="item.checked"
            :key="index"
            class="flex flex-row flex-center space-between"
          >
            <span>{{ item.label }}</span>
            <i class="el-icon-close close-btn" @click="disChoosing(item, index)" />
          </li>
        </ul>
      </div>
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
  name: 'Transfer',

  props: {
    allInfo: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      searchInput: '',
      inited: false,
      infos: [],
      choosed: []
    }
  },

  watch: {
    allInfo: {
      handler(oldValue, value) {
        this.inited = false
        this.initing()
      }
    }
  },

  beforeMount() {
    this.initing()
  },

  methods: {
    initing() {
      const final = []
      for (const val of this.allInfo) {
        const item = {}
        item.checked = true
        item.label = val
        item.key = val
        final.push(item)
      }
      this.infos = final
    },
    chooseing(label, index) {
      this.infos.splice(index, 1, JSON.parse(JSON.stringify(label)))
      this.$emit('change', this.infos)
    },
    disChoosing(label, index) {
      const item = JSON.parse(JSON.stringify(this.infos[index]))
      item.checked = false
      this.chooseing(item, index)
    },
    chooseingAll() {
      for (const val of this.infos) {
        val.checked = true
      }
      this.$emit('change', this.infos)
    },
    match(label) {
      if (!this.searchInput) {
        return true
      }
      if (label.match(this.searchInput)) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>

<style lang="scss">
.col-list {
	width: 50%;
	max-height: 100%;
	padding: 10px;
	.choose-list {
		width: 100%;
		overflow: auto;
	}
	.title-part {
		margin-bottom: 5px;
		.selected_title {
			margin-bottom: 5px;
		}
		.searching-part {
			min-height: 30px;
		}
		.select_all {
			min-width: 60px;
			margin-right: 12px;
			font-size: 12px;
			padding-left: 10px;
			color: #4159d1;
			text-decoration: underline;
			cursor: pointer;
		}
		.search-input {
			max-width: 150px;
			.el-input__inner {
				background: #f8f8fa;
				height: 24px;
				border: 0px;
				border-radius: 2px;
				width: 130px;
				padding-right: 20px;
				line-height: 24px;
			}
			.el-input-group__append {
				border: 0px;
				border-radius: 2px;
				background: #f8f8fa;
				padding-right: 10px;
				padding-left: 0px;
			}
			.el-input__icon {
				line-height: 24px;
			}
		}
	}
	.text-title {
		font-size: 16px;
		font-family: 'lato';
		font-weight: 'bold';
	}
	ul {
		padding-right: 7px;
		font-size: 14px !important;
		background: #fafbfc;
		li {
			padding: 7px 0px;
			&:nth-child(2n) {
				background-color: #ffffff;
			}
		}
		.el-checkbox {
			color: #999ba3 !important;
			.el-checkbox__label {
				color: #999ba3;
			}
		}
	}
	.for-selected {
		color: #999ba3 !important;
	}
	.being-selected {
		color: #4159d1;
		li {
			.close-btn {
				color: #c6c8cc;
				cursor: pointer;
			}
		}
	}
}

.col-left {
	padding-right: 14px;
	border-right: 1px solid #e8e8ef;
	min-width: 205px;
}

.col-right {
	padding-left: 14px;
	min-width: 205px;
}
</style>
