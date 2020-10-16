<template>
  <el-button
    :type="$attrs['type'] || type"
    :size="size"
    :round="$attrs['round'] || round"
    :disabled="disabled"
    v-bind="$attrs"
    @click.stop="btnClick"
  >{{ label }}</el-button>
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

import basicOperation from '@/mixin/BasicOperation'
import disableCheck from '@/mixin/DisableCheck'
export default {
  name: 'CusButton',
  mixins: [basicOperation, disableCheck],
  props: {
    label: {
      type: String,
      default: 'btn'
    },
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      size: 'mini',
      type: 'primary',
      round: false
    }
  },
  methods: {
    btnClick() {
      this.$emit('clickBtn')
      if (this.value) {
        this.$emit('change', this.value)
        this.$emit('form', this.value)
      }
    }
  }
}
</script>

<style lang="" scoped>
</style>
