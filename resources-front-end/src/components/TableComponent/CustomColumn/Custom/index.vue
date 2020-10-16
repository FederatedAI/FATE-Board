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
  name: 'CustomCol',
  data() {
    return {
      minWidth: 120,
      showOverflowTooltip: true
    }
  },
  methods: {
    column(h) {
      const variable = {
        props: Object.assign(
          {
            minWidth: this.minWidth,
            showOverflowTooltip: this.showOverflowTooltip
          },
          this.$attrs
        ),
        scopedSlots: {
          default: cell => {
            if (this.$scopedSlots['default']) {
              return this.$scopedSlots['default'](cell)
            } else {
              return cell.row[cell.column.property]
            }
          }
        }
      }
      return h('el-table-column', variable)
    }
  },
  render(h) {
    return this.column(h)
  }
}
</script>

<style lang="" scoped>
</style>
