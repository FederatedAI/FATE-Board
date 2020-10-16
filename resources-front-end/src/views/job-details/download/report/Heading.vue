<template>
  <div class="heading">
    <div class="title">
      <slot name="title">
        <span>{{ title }}</span>
      </slot>
      <slot name="append" />
    </div>
    <slot name="tip">
      <div v-if="tip" class="tip">{{ tip }}</div>
    </slot>
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
  props: {
    title: {
      type: String,
      default: ''
    },
    tip: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/common/color';
.title {
	font-size: 16px;
	font-weight: 700;
	color: $gray-deep;
}

.tip {
	font-size: 12px;
	color: $gray;
}

.title,
.tip {
	margin-bottom: 0.5em;
}
</style>
