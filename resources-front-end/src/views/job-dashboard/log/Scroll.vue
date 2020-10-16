<template>
  <component :is="tag" @scroll="onScroll">
    <slot />
  </component>
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

import throttle from 'lodash/throttle'

export default {
  props: {
    tag: {
      type: String,
      default: 'div'
    },
    distance: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  created() {
    this.onScroll = throttle(this.onScroll, 16)
  },
  mounted() {
    this.setRootHeight()
  },
  methods: {
    setRootHeight() {
      const callback = event => {
        const oldScrollHeight = this.rootScrollHeight || 0
        this.rootOffsetHeight = this.$el.offsetHeight
        this.rootScrollHeight = this.$el.scrollHeight
        let offset
        if ((offset = this.rootScrollHeight - oldScrollHeight) > 0) {
          this.$el.scrollTop = offset
        }
      }
      const observer = new MutationObserver(callback)
      observer.observe(this.$el, { childList: true, attributes: true })
      this.$once('hook:beforeDestory', () => {
        observer.disconnect(this.$el)
      })
      callback()
    },
    onScroll(event) {
      if (this.disabled) {
        return
      }
      const distance = this.distance
      const range = this.rootScrollHeight - this.rootOffsetHeight
      const scrollTop = event.target.scrollTop
      const offsetTop = scrollTop - this.distance
      const offsetBottom = range - scrollTop - distance
      if (offsetTop <= 0) {
        this.$emit('scroll-up')
      }
      if (offsetBottom <= 0) {
        this.$emit('scroll-down')
      }
    }
  }
}
</script>

<style>
</style>
