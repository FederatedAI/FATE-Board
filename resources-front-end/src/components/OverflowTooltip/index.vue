<template>
  <component :is="tag" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <slot />
    <el-tooltip ref="tooltip" v-bind="tooltipOptions" :effect="effect" :placement="placement">
      <slot slot="content" name="content">{{ tooltipContent }}</slot>
    </el-tooltip>
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

import { getStyle } from '@/utils/dom'
import debounce from 'throttle-debounce/debounce'

export default {
  name: 'OverflowTooltip',
  props: {
    tag: {
      type: String,
      default: 'div'
    },
    effect: {
      type: String,
      default: 'dark'
    },
    placement: {
      type: String,
      default: 'top'
    },
    tooltipOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      tooltipContent: ''
    }
  },
  created() {
    this.activateTooltip = debounce(50, tooltip => tooltip.handleShowPopper())
  },
  methods: {
    onMouseEnter() {
      let child = this.$slots.default[0].elm
      while (child && child.nodeType !== 1) {
        child = child.nextSibling
      }
      const range = document.createRange()
      range.setStart(child, 0)
      range.setEnd(child, child.childNodes.length)
      const rangeWidth = Math.floor(range.getBoundingClientRect().width)
      const padding =
				(+getStyle(child, 'paddingLeft') || 0) +
				(+getStyle(child, 'paddingRight') || 0)
      if (
        rangeWidth + padding > child.offsetWidth ||
				child.scrollWidth < child.offsetWidth
      ) {
        const tooltip = this.$refs.tooltip
        this.tooltipContent = child.innerText || child.textContent
        tooltip.referenceElm = child
        tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none')
        tooltip.doDestroy()
        tooltip.setExpectedState(true)
        this.activateTooltip(tooltip)
      }
    },
    onMouseLeave() {
      const tooltip = this.$refs.tooltip
      if (tooltip) {
        tooltip.setExpectedState(false)
        // tooltip.handleClosePopper()
        tooltip.debounceClose()
      }
    }
  }
}
</script>

<style>
</style>
