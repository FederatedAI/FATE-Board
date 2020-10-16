<template>
  <div class="dialog-icons flex flex-center">
    <icon-hover-and-active
      :class-name="'img-wrapper'"
      :default-url="icons.normal[getScreenStatus()]"
      :hover-url="icons.hover[getScreenStatus()]"
      :active-url="icons.active[getScreenStatus()]"
      @clickFn="switchFullscreen"
    />
    <icon-hover-and-active
      :class-name="'img-wrapper'"
      :default-url="icons.normal.close"
      :hover-url="icons.hover.close"
      :active-url="icons.active.close"
      @clickFn="switchVisible"
    />
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

import IconHoverAndActive from '@/components/IconHoverAndActive'
import { mapGetters } from 'vuex'

export default {
  name: 'ViewSwitch',
  components: {
    IconHoverAndActive
  },
  props: {
    fullscreen: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['icons'])
  },
  methods: {
    switchFullscreen() {
      this.$emit('switchFullscreen')
    },
    switchVisible() {
      this.$emit('switchVisible')
    },
    getScreenStatus() {
      return this.fullscreen ? 'offscreen' : 'fullscreen'
    }
  }
}
</script>

<style>
</style>
