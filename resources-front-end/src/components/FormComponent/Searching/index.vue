<template>
  <cinput
    ref="cusInput"
    :class-name="className"
    :input-class-name="inputClassName"
    :placeholder="placeholder || 'Search Variables'"
    @change="valueChange"
    @clear="searching"
    @keyup.enter.native="searching"
  >
    <i slot="suffix" class="el-icon-search input__search" @click.stop="searching" />
  </cinput>
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

import cinput from '../Input'
import basicOperation from '@/mixin/BasicOperation'
export default {
  name: '',
  components: {
    cinput
  },
  mixins: [basicOperation],
  props: {
    className: {
      type: String,
      default: ''
    },
    inputClassName: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      inputed: ''
    }
  },
  methods: {
    valueChange(res) {
      this.inputed = res
    },
    searching() {
      this.$emit('search', this.inputed)
    },
    disable() {
      this.$refs['cusInput'].disable()
    },
    able() {
      this.$refs['cusInput'].able()
    },
    getParam() {
      return this.inputed
    },
    setParam(value) {
      this.$refs['cusInput'].setParam(value)
      this.inputed = value
    }
  }
}
</script>

<style lang="scss" scoped>
.input__search {
	line-height: 22px;
	padding-right: 6px;
	padding-left: 2px;
	margin-top: 1px;
	margin-bottom: 1px;
	background-color: rgb(248, 248, 250);
	cursor: pointer;
}
</style>
