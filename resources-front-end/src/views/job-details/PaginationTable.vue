<template>
  <div class="flex flex-col justify-center">
    <div class="flex flex-row space-between table-search">
      <slot name="form">
        <span />
      </slot>
      <div class="flex flex-row flex-end">
        <el-input
          v-if="hasSearch"
          :value="searchFor"
          placeholder="searching"
          class="search-input"
          clearable
          @keyup.enter.native="searchData"
          @input="inputSearch"
          @clear="clearCurrentStuff"
        >
          <el-button slot="append" icon="el-icon-search" @click="searchData" />
        </el-input>
        <slot name="formAppend" />
      </div>
    </div>
    <el-table
      v-if="reload"
      ref="tableTemplate"
      :data="tablePageData"
      :cell-class-name="cellClassNameRow"
      v-bind="$attrs"
      highlight-current-row
      fit
      border
      empty-text="No data"
      element-loading-text="Loading"
      style="margin-bottom: 20px;"
      @row-click="currentChange"
      @sort-change="defaultSortable"
      @current-change="currentChangeRow"
    >
      <el-table-column
        v-if="haveDefaultIndex"
        :label="typeof haveDefaultIndex === 'string' ? haveDefaultIndex : 'index'"
        type="index"
        width="100px"
        align="center"
      />
      <el-table-column
        v-if="haveIndex"
        prop="tablePageIndex"
        label="index"
        width="100px"
        align="center"
      />
      <el-table-column
        v-for="(item,index) in header"
        :key="index"
        :label="item.label"
        :prop="item.prop"
        :min-width="item.width ? item.width : ''"
        :sortable="item.sortable ? 'custom' : false"
        align="center"
        show-overflow-tooltip
      />
    </el-table>
    <div v-if="hasPagination && !showingNoData" class="flex flex-end">
      <el-pagination
        :total="tableData.length"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        background
        layout="prev, pager, next"
        @current-change="changePage"
      />
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

export default {
  name: 'DataOutput',
  components: {
    Pagination
  },
  props: {
    header: {
      type: Array,
      default() {
        return []
      }
    },
    tableData: {
      type: Array,
      default() {
        return []
      }
    },
    pageSize: {
      type: Number,
      default: 10
    },
    haveIndex: {
      type: Boolean | String,
      default: true
    },
    haveDefaultIndex: {
      type: String | Boolean,
      default: false
    },
    hasSearch: {
      type: Boolean,
      default: true
    },
    hasPagination: {
      type: Boolean,
      default: true
    },
    // {col: 列对应属性， filter:[]需要保留的值}
    filters: {
      type: Array,
      default: () => []
    },
    cellClassName: {
      type: Function,
      default: obj => ''
    },
    height: {
      type: Number | String,
      default: '60vh'
    }
  },
  data() {
    return {
      reload: true,
      currentPage: 1,
      searchFor: '',
      searchIndex: 1,
      sortableOrder: '',
      currentRowInfo: '',
      showingNoData: false
    }
  },
  computed: {
    tablePageData() {
      let data = []
      if (this.showingNoData) {
        return data
      }
      const currentTable = this.sortBy(
        JSON.parse(JSON.stringify(this.tableData))
      )
      if (this.hasPagination) {
        for (let i = 0; i < currentTable.length; i++) {
          const row = currentTable[i]
          const limitPre = i >= (this.currentPage - 1) * this.pageSize
          const limitNext = i < this.currentPage * this.pageSize
          // console.log(i, limitPre, limitNext)
          if (limitPre && limitNext) {
            if (this.haveIndex) {
              row.tablePageIndex = i + 1
            }
            data.push(row)
          }
        }
      } else {
        data = currentTable
      }
      if (this.filters.length > 0) {
        data = data.filter(item => {
          for (const val of this.filters) {
            if (val.filter.indexOf(item[val.col]) >= 0) {
              return true
            }
          }
          return false
        })
      }
      return data
    }
  },
  methods: {
    changePage(page) {
      this.currentPage = page
    },
    sliceArray(arr) {
      let index = 0
      const newArr = []
      while (index < arr.length) {
        newArr.push(arr.slice(index, (index += this.pageSize)))
      }
      return newArr
    },
    searchData() {
      const that = this
      const tableData = this.sortBy(
        JSON.parse(JSON.stringify(this.tableData))
      )
      this.showingNoData = false
      if (!this.searchFor) {
        this.$refs.tableTemplate.setCurrentRow()
        this.searchIndex = 1
      } else {
        let index = 1
        let searched = false
        let had = false
        for (let i = 0; i < tableData.length; i++) {
          for (const key in tableData[i]) {
            if (
              tableData[i][key].toString().indexOf(this.searchFor) >= 0
            ) {
              had = true
              if (index === this.searchIndex) {
                const page = Math.ceil((i + 1) / this.pageSize)
                if (page === this.currentPage) {
                  for (const key in tableData[i]) {
                    if (tableData[i][key] !== this.currentRowInfo[key]) {
                      this.$refs.tableTemplate.setCurrentRow(tableData[i])
                      break
                    }
                  }
                  this.currentRowInfo = tableData[i]
                  this.$emit('currentChange', tableData[i], i)
                  // this.reloading()
                } else {
                  this.changePage(page)
                  const searchRow = tableData[i]
                  const index = i
                  this.$nextTick(() => {
                    for (const key in searchRow) {
                      if (searchRow[key] !== that.currentRowInfo[key]) {
                        that.$refs.tableTemplate.setCurrentRow(searchRow)
                        break
                      }
                    }
                    that.currentRowInfo = tableData[i]
                    that.$emit('currentChange', searchRow, index)
                    // that.reloading()
                  })
                }
                searched = true
              } else {
                index++
              }
              break
            }
          }
          if (searched) {
            this.searchIndex++
            break
          }
        }
        if (!searched) {
          this.searchIndex = 1
          if (had) {
            this.searchData()
          } else {
            this.showingNoData = true
          }
        }
      }
    },
    currentChange() {
      this.searchIndex = 1
    },
    inputSearch(val) {
      this.searchFor = val
      this.searchIndex = 1
      if (!val) {
        this.searchData()
      }
    },
    defaultSortable(val) {
      this.searchIndex = 1
      if (!val.order) {
        this.sortableOrder = null
      } else {
        this.sortableOrder = val
      }
    },
    sortBy(currentTable) {
      const vm = this
      const val = this.sortableOrder
      if (val) {
        currentTable.sort(function(a, b) {
          let av = ''
          let bv = ''
          if (Number.isNaN(parseFloat(a[val.prop]))) {
            av = a[val.prop]
          } else {
            if (
              a[val.prop]
                .toString()
                .toLowerCase()
                .match(/[a-z|]/)
            ) {
              av = a[val.prop]
            } else {
              av = parseFloat(a[val.prop])
            }
          }
          if (Number.isNaN(parseFloat(b[val.prop]))) {
            bv = b[val.prop]
          } else {
            if (
              b[val.prop]
                .toString()
                .toLowerCase()
                .match(/[a-z|]/)
            ) {
              bv = b[val.prop]
            } else {
              bv = parseFloat(b[val.prop])
            }
          }
          if (val.order === 'ascending') {
            const sortF = vm.bigger(av, bv)
            if (sortF === 0) return 0
            else if (sortF) return 1
            else return -1
          } else {
            const sortF = vm.bigger(av, bv)
            if (sortF === 0) return 0
            else if (sortF) return -1
            else return 1
          }
        })
      }
      return currentTable
    },
    bigger(a, b) {
      if (a.toString() === b.toString()) {
        return 0
      }
      if (typeof a === 'number') {
        return a > b
      } else {
        const compare = function(ass, bss) {
          if (!ass || !bss) return true
          ass = ass.replace(/[\.\-]/g, '_')
          bss = bss.replace(/[\.\-]/g, '_')
          let aStart = ass.toString().match(/^([a-z]|[A-Z])+_?/)
          let bStart = bss.toString().match(/^([a-z]|[A-Z])+_?/)
          if (aStart && bStart && aStart[0] !== bStart[0]) {
            return aStart[0] > bStart[0]
          } else {
            if (aStart && bStart && aStart[0] && bStart[0]) {
              ass = ass.replace(aStart[0], '')
              bss = bss.replace(bStart[0], '')
              if (ass === '' && bss !== '') {
                return false
              } else if (ass !== '' && bss === '') {
                return true
              } else if (ass === '' && bss === '') {
                return true
              }
            }
            aStart = ass.toString().match(/^([0-9])+_?/)
            bStart = bss.toString().match(/^([0-9])+_?/)
            if (bStart && aStart) {
              const anum = aStart[0].replace('_', '')
              const bnum = bStart[0].replace('_', '')
              if (anum && bnum && parseFloat(anum) !== parseFloat(bnum)) {
                return parseFloat(anum) > parseFloat(bnum)
              } else {
                ass = ass.replace(aStart[0], '')
                bss = bss.replace(bStart[0], '')
                return compare(ass, bss)
              }
            } else {
              return compare(ass, bss)
            }
          }
        }
        return compare(a, b)
      }
    },
    reloading() {
      const that = this
      this.reload = false
      this.$nextTick(() => {
        that.reload = true
      })
    },
    currentChangeRow(row, oldRow) {
      if (!row) return
      const that = this
      let check = true
      Object.keys(row).forEach(item => {
        if (row[item] !== that.currentRowInfo[item]) {
          check = false
        }
      })
      this.currentRowInfo = check ? '' : row
    },
    cellClassNameRow(obj) {
      const that = this
      const { row } = obj
      let check = true
      let str = ''
      str += this.cellClassName(obj)
      if (this.currentRowInfo) {
        Object.keys(row).forEach(item => {
          if (
            that.currentRowInfo[item] &&
						row[item] !== that.currentRowInfo[item]
          ) {
            check = false
          }
        })
        str += check ? ' selction-row-choosed' : ''
      }
      return str
    },
    clearCurrentStuff() {
      this.showingNoData = false
    }
  }
}
</script>

<style lang="scss">
.table-search {
	margin-bottom: 20px;
	.search-input {
		max-width: 250px;
	}
}
</style>
