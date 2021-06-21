<template>
  <span :style="styles" class="cus-title" @click.stop="clicked">{{ title || content }}</span>
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
  name: 'CustomTitle',
  props: {
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    styles: {
      type: String | Object,
      default: ''
    }
  },
  methods: {
    clicked() {
      this.$emit('click', this.title)
    }
  }
}
</script>

<style lang="scss" scoped>
.cus-title {
	font-size: 24px !important;
	color: #3e4052 !important;
	font-weight: bold;
}
</style>
