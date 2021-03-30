<template>
  <div>
    <el-table
      :data="paginatedData"
      size="mini"
      style="margin-bottom: 15px"
      header-cell-class-name="header-section-style default-cell-summary-font"
    >
      <el-table-column
        type="index"
        label="index"
        width="100"
        align="center"
        header-align="center"
        class-name="default-cell-style default-cell-first-col-style"
      />
      <el-table-column
        prop="origin"
        label="original variable"
        align="center"
        header-align="center"
        class-name="default-cell-style"
      />
      <el-table-column
        prop="modified"
        label="modified variable"
        align="center"
        header-align="center"
        class-name="default-cell-style"
      >
        <template slot-scope="{ row }">
          <input
            :value="row.modified"
            class="simple-input"
            @input="handleInput($event, row.origin)"
            @keyup.enter="handleInputEnter"
          >
        </template>
      </el-table-column>
    </el-table>
    <div class="flex flex-end">
      <el-pagination
        v-bind="page"
        :total="data.length"
        background
        @current-change="handleCurrentPageChange"
      />
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
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      page: {
        currentPage: 1,
        pageSize: 10,
        layout: 'total, prev, pager, next, jumper'
      }
    }
  },
  computed: {
    paginatedData() {
      const { currentPage, pageSize } = this.page
      return this.data.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      )
    }
  },
  methods: {
    handleCurrentPageChange(val) {
      this.page.currentPage = val
    },
    handleInput(event, variable) {
      const data = this.data.map(item => {
        if (item.origin === variable) {
          return {
            ...item,
            modified: event.target.value
          }
        }
        return item
      })
      this.$emit('update:data', data)
    },
    handleInputEnter(event) {
      event.target.blur()
    },
    tableDownload() {
      // 映射表下载
      const data = this.data
      const header = ['origin', 'modified']
      return {
        default: {
          'variable_modify.csv': {
            header,
            data
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scope>
@import '../../../../styles/common/table';
.simple-input {
	display: block;
	width: 100%;
	background: transparent;
	font-size: 12px;
	color: inherit;
	-webkit-appearance: none;
	border: 0;
	outline: 0;
	padding: 3px 7px;
	text-align: center;
	&:focus {
		text-align: left;
	}
}
</style>
