<template>
  <section v-loading="tableLoading" class="ctable__container">
    <div class="ctable__table">
      <origin-table
        ref="originTable"
        :data="currentTableData"
        :header="currentTableHeader"
        :combine="headerPagination ? false : combine"
        :null-format="nullFormat"
        :zero-format="zeroFormat"
        :to-exp="toExp"
        :size="size"
        v-bind="$attrs"
        @sort-change="sortChange"
        @not-found="searchNotFound"
        @found="searchFound"
        @show-no-data="showNoData"
        @show-data="showData"
        v-on="$listeners"
      />
    </div>
    <div v-if="!outerPagination" :class="{'ctable_page_right': paginationRight}" class="ctable__pagination">
      <el-pagination
        v-show="isNotNoData"
        ref="pagination"
        :layout="'prev, pager, next'"
        :page-size="(pageSize < 0 || typeof pageSize === 'string') ? actualCurrentTotal : pageSize"
        :total="actualCurrentTotal"
        :current-page.sync="currentPage"
        :background="true"
        :hide-on-single-page="true"
      />
    </div>
  </section>
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

import dataSort from '../OriginTable/mixins/DataSort'
import tableSearch from './mixins/PageationTableSearch'
import originTable from '../OriginTable'
import dataReporter from './mixins/DataReport'
import { isArray } from 'lodash'
export default {
  name: 'PaginationTable',
  components: {
    originTable
  },
  mixins: [dataSort, tableSearch, dataReporter],
  props: {
    data: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Array | Object,
      default: () => []
    },
    header: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Array | Object,
      default: () => []
    },
    pageSize: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Number | String,
      default: 10
    },
    total: {
      type: Number,
      default: 10
    },
    async: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Function | Boolean,
      default: false
    },

    headerPagination: {
      type: Boolean,
      default: false
    },
    combine: {
      type: Boolean,
      default: true
    },
    nullFormat: {
      type: String,
      default: '-'
    },
    zeroFormat: {
      type: String,
      default: '-'
    },
    toExp: {
      type: Boolean,
      default: true
    },
    size: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Number | Boolean,
      default: 6
    },
    name: {
      type: String,
      default: ''
    },
    export: {
      type: String,
      default: ''
    },
    mapVariable: {
      type: String,
      default: 'variable'
    },
    outerPagination: {
      type: Boolean,
      default: false
    },
    paginationRight: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tableLoading: true,

      property: '',
      currentDatas: [],
      oldCurrentDatas: [],
      currentHeaders: [],

      dataFilter: [],
      headerFilter: [],

      currentPage: 1,
      currentTotal: this.total,

      // for Async
      sortColumn: '',
      sortOrder: '',

      formFilters: {},

      isNotNoData: true,
      filterForCurrent: null
    }
  },
  computed: {
    currentTableData() {
      let origin = this.currentDatas
      if (this.filterForCurrent) {
        origin = this.filterForCurrent(origin)
      }
      if (
        this.headerPagination ||
				this.pageSize < 0 ||
				this.pageSize === 'all' ||
				this.async
      ) {
        return origin
      } else {
        const start = (this.currentPage - 1) * this.pageSize
        return origin.slice(start, start + this.pageSize)
      }
    },
    currentTableHeader() {
      if (
        !this.headerPagination ||
				this.pageSize < 0 ||
				this.pageSize === 'all' ||
				this.async
      ) {
        return this.currentHeaders
      } else {
        return this.getHeaderPageChange(
          this.currentHeaders,
          this.currentPage,
          this.pageSize
        )
      }
    },
    actualCurrentTotal() {
      if (!this.headerPagination && this.filterForCurrent) {
        return this.filterForCurrent(this.currentDatas).length
      }
      return this.currentTotal
    }
  },
  watch: {
    data: {
      handler() {
        this.setProperty(this.property)
        if (this.async) {
          this.searchAfter()
        }
        this.$nextTick(() => {
          this.tableLoading = false
          this.$emit('refreshed')
        })
      }
    },
    currentPage: {
      handler() {
        if (this.async) {
          this.request()
        }
      },
      deep: true
    },
    total: {
      handler() {
        if (this.async) {
          this.currentTotal = this.total
        }
      }
    }
  },
  beforeMount() {
    this.init()
  },
  methods: {
    init() {
      this.setProperty(this.property)
      if ((this.data.length === 0 || this.header.length === 0) && this.async) {
        this.request()
      } else {
        this.tableLoading = false
        this.$emit('refreshed')
      }
    },
    showNoData() {
      this.isNotNoData = false
    },
    showData() {
      this.isNotNoData = true
    },
    getList(obj, pro) {
      const res = [...obj]
      const list = Array.isArray(pro) ? pro : [pro]
      for (let i = 0; i < list.length; i++) {
        const val = list[i]
        for (let j = 0; j < res.length; j++) {
          if (res[j][val.property] === undefined || !res[j][val.property].toString().match(new RegExp('(' + val.filter.join('|') + ')'))) {
            res.splice(j, 1)
            j--
          }
        }
      }
      return res
    },
    originGetList(obj, pro) {
      const res = []
      const list = Array.isArray(pro) ? pro : [pro]
      for (const val of list) {
        if (obj[val] && Array.isArray(obj[val])) {
          res.push(...obj[val])
        } else if (obj[val]) {
          res.push(obj[val])
        }
      }
      return res
    },
    getHeaderList(obj, pro) {
      const res = [...obj.header]
      const list = pro ? (Array.isArray(pro) ? pro : [pro]) : []
      const disabled = obj.disabled || obj.disable
      if (disabled && list.length > 0) {
        const del = []
        for (const val of list) {
          const newDel = Array.isArray(disabled[val])
            ? disabled[val]
            : disabled[val]
              ? [disabled[val]]
              : []
          if (disabled[val]) {
            if (del.length === 0) {
              del.push(...newDel)
            } else {
              for (const item of del) {
                if (newDel.indexOf(item) < 0) {
                  del.splice(del.indexOf(item), 1)
                }
              }
            }
          }
        }
        for (let i = 0; i < res.length; i++) {
          const item = res[i]
          if (del.indexOf(item.prop) >= 0) {
            res.splice(i, 1)
            i--
          }
        }
      }
      return res
    },
    getCurrentHeader() {
      const list = Array.isArray(this.header)
        ? [...this.header]
        : this.getHeaderList(this.header, this.property)
      for (const val of list) {
        if (val.type === 'index') {
          val.pageFixed = true
          break
        }
      }
      return list
    },
    getHeaderPageChange(list, cp, ps) {
      const li = [...list]
      const res = []
      for (let i = 0; i < li.length; i++) {
        const val = li[i]
        if (val.pageFixed) {
          res.push(val)
          li.splice(i, 1)
          i--
        }
      }
      if (res.length > ps) {
        ps = res.length + 1
      }
      const rest = li.splice((cp - 1) * (ps - res.length), ps - res.length)
      res.push(...rest)
      return res
    },
    headerTotal(list) {
      let pf = 0
      for (const val of list) {
        if (val.pageFixed) {
          pf++
        }
      }
      const eachPage = this.pageSize - pf > 0 ? this.pageSize - pf : 1
      const actualTotalPage = Math.ceil((list.length - pf) / eachPage)
      return actualTotalPage * (pf >= this.pageSize ? pf + 1 : this.pageSize)
    },
    setProperty(value) {
      this.property = value
      this.filterForCurrent = null
      this.currentDatas = this.getList(this.filterData(Array.isArray(this.data)
        ? [...this.data]
        : this.originGetList(this.data, this.property)), this.dataFilter)
      this.oldCurrentDatas = []
      this.currentHeaders = this.filterHeader(this.getCurrentHeader(), this.headerFilter)
      if (!this.async) {
        this.sortChange({
          column: this.currentSortColumn,
          order: this.currentOrder
        })
        this.currentTotal = this.headerPagination
          ? this.headerTotal(this.currentHeaders)
          : this.currentDatas.length
      } else {
        this.currentTotal = this.total
      }
    },
    filterData(origin, list) {
      if (!list || Object.keys(list).length === 0) {
        return origin
      } else {
        const res = []
        for (const val of list) {
          for (const item of origin) {
            if (item[val.property].indexOf(val.filter) >= 0) {
              res.push(item)
            }
          }
        }
        return res
      }
    },
    filterHeader(origin, list) {
      if (!list || Object.keys(list).length === 0) {
        return origin
      } else {
        const res = []
        for (const item of origin) {
          if (item.pageFixed || list.indexOf(item.label) >= 0 || list.indexOf(item.prop) >= 0) {
            res.push(item)
          }
        }
        return res
      }
    },
    sortChange({ column, order }) {
      if (this.async) {
        this.currentSortColumn = order ? column : ''
        this.currentOrder = order
        this.request()
      } else {
        if (!this.oldCurrentDatas.length) {
          this.oldCurrentDatas = this.currentDatas
        }
        this.currentDatas = this.sortMethod(
          [...this.currentDatas],
          column,
          order
        )
        if (!order) {
          this.currentDatas = this.oldCurrentDatas
        }
      }
    },
    async request() {
      this.tableLoading = true
      const res = Object.assign(
        {},
        {
          sortColumn: this.currentSortColumn,
          sortOrder: this.currentOrder,
          currentPage: this.currentPage,
          pageSize: this.pageSize
        },
        this.formFilters
      )
      if (typeof this.async === 'function') {
        const data = await this.async(res)
        this.currentDatas = data.data || this.currentDatas
        this.currentHeaders = data.header || this.currentHeaders
      } else {
        this.$emit('request', res)
      }
    },

    change() {
      // if (this.currentTableData.length > 0) {
      const res = Object.assign(
        {},
        {
          data: this.currentTableData,
          header: this.currentTableHeader,
          sortColumn: this.currentSortColumn,
          sortOrder: this.currentOrder,
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          total: this.currentTotal
        },
        this.formFilters
      )
      this.$emit('change', res)
      // }
    },

    toFirstPage() {
      this.currentPage = 1
    },

    pageTo(page) {
      const lastPage = Math.ceil(this.currentTotal / this.pageSize)
      this.currentPage = page <= 0 ? 1 : page > lastPage ? lastPage : page
    },

    linkageChange(param) {
      this.setProperty(param)
      this.change()
    },

    linkageForm(param) {
      if (this.async) {
        this.formFilters = param
        this.toFirstPage()
      }
    },

    // param 需要的内容包括列名，范围，当前只针对数字类型或者可以转换成数字类型的数值有用。
    linkageRange(param) {
      if (!param.columnName) {
        this.$refs['originTable'].linkageRange(param)
      } else {
        const filterOrigin = (param, list) => {
          if (isArray(list)) {
            return list.filter(item => {
              const origin = parseFloat(item[param.columnName])
              return origin >= param.min && origin <= param.max
            })
          } else {
            return list
          }
        }
        this.filterForCurrent = filterOrigin.bind(this, param)
        this.currentPage = 1
        // const filtersFunc = item => {
        //   const content = parseFloat(item[param.columnNmae])
        //   if (!content) {
        //     return false
        //   } else {
        //     return content >= param.min && content <= param.max
        //   }
        // }
        // this.currentDatas = this.currentDatas.filter(filtersFunc)
        // this.oldCurrentDatas = this.oldCurrentDatas.filter(filtersFunc)
      }
    },

    linkageHeaderPage(param) {
      this.currentPage = param
    },

    linkageFilterTable(param) {
      this.dataFilter = param.dataFilter
      this.headerFilter = param.headerFilter
      this.currentPage = 1
      this.currentSortColumn = ''
      this.currentOrder = ''
      this.init()
      this.$nextTick(() => {
        if (this.outerPagination) {
          this.$emit('change', this.currentHeaders)
        }
      })
    },

    setDefault() {
      this.change()
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../styles/position';
.ctable__container {
	@include flex(column, flex-start, flex-start);
	padding-bottom: 20px;
	.ctable__table {
		width: 100%;
	}
	.ctable__pagination {
		margin-top: 12px;
    font-weight: bold;
	}
  .ctable_page_right {
    width: 100%;
    @include flex(row, flex-end, center);
  }
}
</style>
