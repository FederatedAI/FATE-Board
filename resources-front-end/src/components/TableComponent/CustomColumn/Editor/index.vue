<template>
  <editor :value="cell.row[cell.column.property]" @change="change" />
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

import editor from '../../../FormComponent/Editor'
export default {
  name: 'EditorCol',
  components: {
    editor
  },
  props: {
    cell: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    change(updated) {
      this.$emit('change', updated)
    }
  }
}
</script>

<style lang="" scoped>
</style>
