<template>
  <div class="combination__container">
    <group v-if="!showNoData && group.length > 0" :options="group" />
    <div v-if="showNoData" class="template_nodata">No Data</div>
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

import Group from '@/components/ComponentGroup'

export default {
  name: 'DataOutput',
  components: {
    Group
  },
  props: {
    data: {
      type: Object | Array,
      default: () => {}
    }
  },
  data() {
    return {
      group: [],
      showNoData: false
    }
  },
  watch: {
    data: {
      handler() {
        this.showNoData = false
        this.handleOptions()
        this.$forceUpdate()
      }
    }
  },
  mounted() {
    if (Object.keys(this.data).length > 0) {
      this.showNoData = false
      this.handleOptions()
      this.$forceUpdate()
    }
  },
  methods: {
    handleOptions() {
      const tableHeader = {}
      let tableBody = {}
      const options = []
      let total = []
      const group = []
      if (this.data && this.data.meta && this.data.meta.header.length) {
        for (let i = 0; i < this.data.meta.header.length; i++) {
          const header = []
          const body = []
          this.data.meta.header[i] &&
						this.data.meta.header[i].forEach((item, index) => {
						  header.push({
						    prop: item.replace('.', '') + index,
						    label: item,
						    showOverflowTooltip: true
						  })
						})
          this.data.data[i].forEach(oldRow => {
            const newRow = {}
            header.forEach((item, index) => {
              let value = oldRow[index]
              if (value !== null && typeof value === 'object') {
                value = JSON.stringify(value)
              }
              newRow[item.prop] =
								value !== null ? value && value.toString() : '-'
            })
            body.push(newRow)
          })
          if (header.length && header.length > 0) {
            header.unshift({ type: 'index', label: 'index' })
          }
          tableHeader[this.data.meta.names[i]] = header
          if (this.data.meta.header.length === 1) {
            tableBody = body
            total = this.data.meta.total[i]
          } else {
            options.push({
              label: this.data.meta.names[i],
              value: this.data.meta.names[i]
            })
            total.push({
              label: this.data.meta.names[i],
              value: this.data.meta.total[i]
            })
            tableBody[this.data.meta.names[i]] = body
          }
        }
      }
      const { disable: disableHeader, commonHeader } = this.getHeader(
        tableHeader
      )
      if (Object.keys(commonHeader).length > 0) {
        if (
          Object.keys(tableBody).length > 0 &&
					this.data.meta.header.length > 1
        ) {
          group.push({
            type: 'form',
            props: {
              form: [
                {
                  type: 'f-select',
                  props: {
                    options: options
                  },
                  connect: [1]
                },
                {
                  type: 'text',
                  props: {
                    content: 'Outputting {total} instances',
                    subContent: '(only 100 instances are shown in the table)',
                    className: 'small-form-text',
                    data: {
                      '{total}': val => {
                        const cval = Array.isArray(val) ? val[0] : val
                        for (const item of total) {
                          if (item.label === cval) {
                            return item.value
                          }
                        }
                      }
                    },
                    inner: true
                  }
                }
              ]
            }
          })
        } else {
          group.push({
            type: 'text',
            props: {
              content: `Outputting ${total} instances`,
              subContent: '(only 100 instances are shown in the table)',
              className: 'small-form-text'
            }
          })
        }
        group.push({
          type: 'table',
          props: {
            header: {
              disable: disableHeader,
              header: commonHeader
            },
            data: tableBody,
            zeroFormat: '0',
            nullFormat: 'null',
            headerPagination: true,
            pageSize: 10
          }
        })
        this.group = group
      } else {
        this.showNoData = true
      }
    },
    getHeader(headers) {
      const disable = {}
      const commonHeaderObj = {}
      const commonHeader = []
      Object.keys(headers).forEach((h, i) => {
        headers[h].forEach(value => {
          if (!commonHeaderObj[value.prop]) {
            commonHeaderObj[value.prop] = true
            commonHeader.push(value)
          }
        })
      })
      Object.keys(headers).forEach((h, i) => {
        disable[h] = this.disabledHeader(headers[h], commonHeader)
      })
      return { disable, commonHeader: commonHeader }
    },
    disabledHeader(header, common) {
      const result = []
      const headerProps = []
      header.forEach(item => {
        headerProps.push(item.prop)
      })
      common.forEach(item => {
        if (headerProps.indexOf(item.prop) < 0) {
          result.push(item.prop)
        }
      })
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../styles/position';
.combination__container {
	width: 100%;
	height: 100%;
	position: relative;
}
.template_nodata {
	@include flex(column, center, center);
	width: 100%;
	min-height: 200px;
	font-size: 1.45em;
	font-weight: bold;
}
</style>

