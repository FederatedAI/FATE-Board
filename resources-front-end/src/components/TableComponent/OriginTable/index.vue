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

import spanMethod from './mixins/SpanMethod'
import dataSort from './mixins/DataSort'
import dataFormat from './mixins/DataFormat'
import cellClass from './mixins/CellClass'
import tableSearch from './mixins/TableSearch'
import clink from '../CustomColumn/Linking'
import ceditor from '../CustomColumn/Editor'
import cweight from '../CustomColumn/Weight'
export default {
  name: 'OriginTable',
  components: {
    clink,
    ceditor,
    cweight
  },
  mixins: [spanMethod, dataSort, dataFormat, cellClass, tableSearch],
  props: {
    data: {
      type: Array,
      default: () => []
    },
    header: {
      type: Array,
      default: () => []
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
    }
  },
  data() {
    return {
      currentTableData: [],
      biggestWeight: 100,
      dataCopyList: [],
      tableEvents: ['sort-change'],
      presetHeaderType: {
        link: 'clink',
        editor: 'ceditor',
        weight: 'cweight'
      },
      defaultHeaderType: 'ccustom',
      DEF_TABLE_ATTR: {
        emptyText: 'No data',
        elementLoadingText: 'Loading',
        size: 'mini',
        highlightCurrentRow: true
      },
      DEF_COLUMN_ATTR: {
        showOverflowTooltip: false,
        align: 'center'
      },
      hasWeight: -1
    }
  },
  watch: {
    data: {
      handler() {
        this.currentTableData = this.checkData(
          this.data,
          Array.isArray(this.header) ? this.header : this.header.header
        )
        this.sortChange({
          column: this.currentSortColumn,
          order: this.currentOrder
        })
        if (this.hasWeight >= 0) {
          this.biggestWeight =
						this.currentTableData.length > 0
						  ? this.currentTableData[0][this.header[this.hasWeight].prop]
						  : 0
        }
        this.notSearched()
      },
      deep: true
    },
    header: {
      handler() {
        this.checkWeight(this.header)
      },
      deep: true
    },
    currentTableData: {
      handler() {
        if (this.currentTableData.length > 0) {
          this.dataCopyList = this.currentTableData
        }
      }
    },
    range: {
      handler() {
        this.currentTableData = this.checkData(
          this.data,
          Array.isArray(this.header) ? this.header : this.header.header
        )
        this.sortChange({
          column: this.currentSortColumn,
          order: this.currentOrder
        })
        if (this.hasWeight >= 0) {
          this.biggestWeight = this.currentTableData[0][
            this.header[this.hasWeight].prop
          ]
        }
        this.notSearched()
      }
    }
  },
  mounted() {
    this.checkWeight(this.header)
    this.currentTableData = this.checkData(
      this.data,
      Array.isArray(this.header) ? this.header : this.header.header
    )
    this.sortChange({
      column: this.defaultSortColumn,
      order: this.defaultOrder
    })
    if (this.hasWeight >= 0 && this.currentTableData.length > 0) {
      this.biggestWeight = this.currentTableData[0][
        this.header[this.hasWeight].prop
      ]
    }
  },
  methods: {
    showNoData() {
      this.dataCopyList = this.currentTableData
      this.currentTableData = []
      this.$emit('show-no-data')
    },
    showData() {
      this.currentTableData = this.dataCopyList
      this.$emit('show-data')
    },
    checkWeight(li) {
      this.hasWeight = -1
      for (let i = li.length - 1; i >= 0; i--) {
        const val = li[i]
        if (val.type === 'weight') {
          this.defaultSortColumn = { property: li[i].prop }
          this.defaultOrder = 'descending'
          this.hasWeight = i
          break
        }
      }
    },

    checkBiggest(li, key) {
      let biggest = 0
      for (const item of li) {
        const mid = parseInt(item[key])
        if (mid > biggest) {
          biggest = mid
        }
      }
      return biggest
    },

    searchInTable(content, col) {
      this.search(this.currentTableData, content, col)
    },

    setCurrentRow(row) {
      this.$refs['cusTable'].setCurrentRow(this.currentTableData[row])
    },

    sortChange({ column, order }) {
      this.currentTableData = this.sortMethod(
        this.currentTableData,
        column,
        order
      )
    },

    replaceOrigin(str, rep, to) {
      let res = str
      while (res.match(rep)) {
        const fto = to(res.match(rep)[0])
        res = res.replace(rep, fto)
      }
      return res
    },

    events(events) {
      const res = {}
      for (const val of events) {
        res[val] = (...args) => {
          const name = this.replaceOrigin(val, /-[a-z]/, str => {
            return str.replace('-', '').toUpperCase()
          })
          if (this.$listeners[name]) {
            this.$emit(name, ...args)
          } else {
            if (this[name]) this[name](...args)
          }
        }
      }
      return res
    },

    eachColumn(h, attrs) {
      let childEle = []
      if (attrs.children) {
        childEle = this.columns(h, attrs.children)
      }
      const props = Object.assign({}, attrs)
      if (props.type === 'weight') {
        props.total = this.biggestWeight
      }
      if (['selection', 'index', 'expand'].indexOf(props.type) < 0) {
        delete props.type
      }
      delete props.children
      delete props.on
      const obj = {
        columnKey: attrs.prop || attrs.label
      }
      if (props.type === 'index') {
        obj.width = '70px'
        obj.align = 'center'
      }
      const originProps = Object.assign(
        obj,
        attrs.type !== 'index' ? this.DEF_COLUMN_ATTR : {},
        props
      )
      if (originProps.sortable) originProps.sortable = 'custom'
      const variable = {
        props: originProps,
        on: (() => {
          const res = attrs.on || {}
          for (const key in this.$listeners) {
            if (key.match(/^column-/)) {
              res[key.replace('column-', '')] = this.$listeners[key]
            }
          }
          return res
        })()
      }
      if (this.presetHeaderType[attrs.type]) {
        variable.scopedSlots = {
          default: cell => {
            return h(this.presetHeaderType[attrs.type], {
              props: Object.assign({ cell }, props),
              on: attrs.on || {}
            })
          }
        }
      }
      return h('el-table-column', variable, childEle)
    },

    columns(h, columns) {
      const cols = []
      columns.forEach(item => {
        cols.push(this.eachColumn(h, item))
      })
      return cols
    },

    filtersHeader(list) {
      const li = JSON.parse(JSON.stringify(list))
      if (this.hasWeight >= 0) {
        const weightProp = list[this.hasWeight].prop
        let biggest = 0
        for (const val of this.currentTableData) {
          if (
            typeof val[weightProp] === 'number' &&
						val[weightProp] > biggest
          ) {
            biggest = val[weightProp]
          }
        }
        if (!li[this.hasWeight].total || li[this.hasWeight].total < biggest) {
          li[this.hasWeight].total = biggest
        }
      }
      return list
    },

    table(h) {
      const variable = {
        props: Object.assign({}, this.DEF_TABLE_ATTR, {
          data: this.currentTableData,
          spanMethod: this.defaultSpanMethod(),
          cellClassName: this.cellClassName,
          headerCellClassName: this.headerCellClassName
        }),
        ref: 'cusTable',
        on: (() => {
          const res = this.events(this.tableEvents)
          for (const key in this.$listeners) {
            if (!key.match(/^column-/)) {
              res[key] = this.$listeners[key]
            }
          }
          return res
        })()
      }
      return h('el-table', variable, this.columns(h, this.header))
    }
  },
  render(h) {
    return this.table(h)
  }
}
</script>

<style lang="scss">
@import '../../../styles/position';
.ctable__header-cell {
	background-color: #deecfc !important;
	border: 1px solid #ffffff;
	color: #6a6c75;
	padding: 3px 0px;
	font-size: 0.86rem;
	.caret-wrapper {
		height: 22px;
		.ascending {
			top: 0px;
		}
		.descending {
			bottom: 0px;
		}
	}
}

.ctable__normal-deep {
	background-color: #5e7feb !important;
	color: #ffffff;
}

.ctable__much_deep {
	background-color: #4159d1 !important;
	color: #ffffff;
}

.ctable__cell {
	border: 1px solid #fff;
	border-bottom: 1px solid #fff !important;
	background-color: #fafbfc;
	color: #6a6c75;
	font-size: 0.86rem;
	font-size: 12px;
	padding: 3px 0px;
}

.ctabel__cell-deep {
	background-color: #ebedf0 !important;
	color: #6a6c75;
}

.ctable__cell-normal-deep {
	background-color: #ebedf0 !important;
	padding: 0px 12px !important;
}

.ctable__cell-much-deep {
	background-color: #f5f7fa !important;
}

.ctable__cell-disable {
	background-color: #ebedf0 !important;
	color: #999ba3;
}

.ctable__summary {
	background-color: #ebedf0 !important;
	color: #6a6c75;
}

.current-row {
	& > td {
		background-color: #ebedf0 !important;
	}
	.ctabel__cell-deep {
		background-color: #dcdde0 !important;
	}
	.ctable__cell-normal-deep {
		background-color: #dcdde0 !important;
	}
	.ctable__cell-much-deep {
		background-color: #ebedf0 !important;
	}
}

.mult-title {
	position: relative;
	height: 100%;
	@include flex(row, center, center);
	.split-inline {
		min-height: 20px;
		min-width: 30px;
		position: relative;
		&::before {
			content: ' ';
			width: 2px;
			background-color: white;
			position: absolute;
			top: 0;
			bottom: 0;
			margin: auto;
			-webkit-transform: rotate(7deg);
			transform: rotate(-30deg);
		}
	}
}
</style>
