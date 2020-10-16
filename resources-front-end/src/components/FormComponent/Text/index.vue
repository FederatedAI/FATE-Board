<template>
  <span v-show="!hide" :class="className" class="text__content">
    {{ value }}
    <span v-if="subContent" :class="subClassName" class="text__sub-content">{{ subValue }}</span>
  </span>
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
  name: 'CustomText',
  props: {
    content: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default: () => {}
    },
    className: {
      type: String,
      default: ''
    },
    hidden: {
      type: Boolean,
      default: false
    },
    subContent: {
      type: String,
      default: ''
    },
    subClassName: {
      type: String,
      default: ''
    },
    inner: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      val: '',
      value: '',
      hide: this.hidden
    }
  },
  watch: {
    val: {
      handler() {
        this.textContent()
      },
      deep: true
    },
    hidden() {
      this.hide = this.hidden
    }
  },
  beforeMount() {
    this.textContent()
  },
  methods: {
    textContent() {
      let res = this.content
      let subRes = this.subContent
      for (const key in this.data) {
        const rep =
					typeof this.data[key] === 'function'
					  ? this.val
					    ? this.data[key](this.val)
					    : key
					  : this.data[key]
        res = res.replace(key, rep)
        subRes = subRes.replace(key, rep)
      }
      this.value = res
      this.subValue = subRes
    },
    linkageOutside(val) {
      if (!this.inner) {
        this.val = val
      }
    },
    visiable(bool) {
      this.hide = !bool
    },
    byChange(val) {
      if (this.inner) {
        this.val = val
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.text__content {
	font-size: 16px;
	font-weight: bold;
	color: #7f7d8e;
	line-height: 24px;
}
</style>
