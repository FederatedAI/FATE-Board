<template>
  <div
    v-show="show"
    :class="className"
    :title="btnTitle"
    @mouseenter="mouseenter"
    @mouseout="mouseout"
    @mousedown="mousedown"
    @mouseup="mouseup"
    @click.stop="click"
  >
    <img :src="imgUrl" class="wh-100" alt >
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
    show: {
      type: Boolean,
      default: true
    },
    className: {
      type: String,
      default: ''
    },
    defaultUrl: {
      type: String,
      default: ''
    },
    hoverUrl: {
      type: String,
      default: ''
    },
    activeUrl: {
      type: String,
      default: ''
    },
    disableUrl: {
      type: String,
      default: ''
    },
    origin: {
      type: String,
      default: 'default'
    },
    hold: {
      type: Boolean,
      default: false
    },
    btnTitle: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      status: 'default',
      holded: 'default'
    }
  },
  computed: {
    imgUrl() {
      let url = ''
      if (this.disabled) {
        url = this.disableUrl
      } else if (this.status === 'default') {
        url = this.defaultUrl
      } else if (this.status === 'hover') {
        url = this.hoverUrl
      } else if (this.status === 'active') {
        url = this.activeUrl
      }
      return url
    }
  },

  beforeMount() {
    this.inited()
  },

  methods: {
    inited() {
      this.status = this.origin
    },
    mouseenter() {
      if (!this.disabled) {
        if (this.hold) {
          this.holded = this.status
        }
        if (this.hoverUrl) {
          this.status = 'hover'
        }
      }
    },
    mouseout() {
      if (!this.disabled) {
        if (this.hold) {
          this.status = this.holded
        } else {
          this.status = 'default'
        }
      }
    },
    mousedown() {
      if (!this.disabled) {
        if (this.activeUrl) {
          if (this.holded) {
            this.holded = 'active'
          }
          this.status = 'active'
        }
      }
    },
    mouseup() {
      if (!this.disabled) {
        if (this.status === 'active' && !this.hold) {
          this.status = 'default'
        }
      }
    },
    click() {
      if (!this.disabled) {
        this.$emit('clickFn')
      }
    },
    restart() {
      this.holded = 'default'
      this.status = this.holded
    },
    setActive() {
      this.holded = 'active'
      this.status = 'active'
    }
  }
}
</script>

<style scoped>
</style>
