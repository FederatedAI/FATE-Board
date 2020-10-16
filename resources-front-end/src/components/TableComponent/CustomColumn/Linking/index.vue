<template>
  <div class="link__container">
    <el-link
      v-for="(item,index) in linkings"
      :key="index"
      :underline="true"
      :type="type"
      :disabled="disabled"
      class="link__linking"
      @click.stop="linkClick(item, cell)"
    >
      <slot :cell="cell">
        <slot :name="item" :cell="cell">{{ item }}</slot>
      </slot>
    </el-link>
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
  name: 'LinkingCol',
  props: {
    type: {
      type: String,
      default: 'primary'
    },
    content: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: String | Function,
      default: ''
    },
    cell: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      disabled: false
    }
  },
  computed: {
    linkings() {
      let res = []
      this.able()
      if (typeof this.content === 'string') {
        res = this.content.split('|')
      } else {
        res = this.content(this.cell).split('|')
      }
      for (let i = 0; i < res.length; i++) {
        const val = res[i]
        res[i] = val.trim()
      }
      return res || this.cell.row[this.cell.column.property] || []
    }
  },
  methods: {
    linkClick(item, cell) {
      this.$emit('click', item, cell)
    },
    disable() {
      this.disabled = true
    },
    able() {
      this.disabled = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../styles/position';
.link__container {
	@include flex(row, flex-start, center);
	.link__linking {
		margin-left: 10px;
	}
}
</style>
