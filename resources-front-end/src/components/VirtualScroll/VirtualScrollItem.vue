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
  name: 'VirtualScrollItem',
  inject: ['scrollData', 'scrollParent', 'scrollResizeObserver'],
  props: {
    item: {
      type: Object,
      required: true
    },
    active: {
      type: Boolean,
      required: true
    },
    index: {
      type: Number,
      default: undefined
    },
    tag: {
      type: String,
      default: 'div'
    }
  },
  computed: {
    id() {
      return this.item[this.scrollData.keyField]
    },
    size() {
      return (
        (this.scrollData.validSizes[this.id] &&
					this.scrollData.sizes[this.id]) ||
				0
      )
    },
    finalActive() {
      return this.active && this.scrollData.active
    }
  },
  watch: {
    id() {
      if (!this.size) {
        this.onDataUpdate()
      }
    },

    finalActive(value) {
      if (!this.size) {
        if (value) {
          if (!this.scrollParent.$_undefinedMap[this.id]) {
            this.scrollParent.$_undefinedSizes++
            this.scrollParent.$_undefinedMap[this.id] = true
          }
        } else {
          if (this.scrollParent.$_undefinedMap[this.id]) {
            this.scrollParent.$_undefinedSizes--
            this.scrollParent.$_undefinedMap[this.id] = false
          }
        }
      }

      if (this.scrollResizeObserver) {
        if (value) {
          this.observeSize()
        } else {
          this.unobserveSize()
        }
      } else if (value && this.$_pendingScrollUpdate === this.id) {
        this.updateSize()
      }
    }
  },
  created() {
    this.$_forceNextScrollUpdate = null
    if (!this.scrollResizeObserver) {
      this.vscrollParent.$on('vscroll:update', this.onScrollUpdate)
    }
  },
  mounted() {
    if (this.scrollData.active) {
      this.updateSize()
      this.observeSize()
    }
  },
  methods: {
    updateSize() {
      if (this.finalActive) {
        if (this.$_pendingSizeUpdate !== this.id) {
          this.$_pendingSizeUpdate = this.id
          this.$_forceNextScrollUpdate = null
          this.$_pendingScrollUpdate = null
          this.computeSize(this.id)
        }
      } else {
        this.$_forceNextScrollUpdate = this.id
      }
    },
    computeSize(id) {
      this.$nextTick(() => {
        if (this.id === id) {
          const width = this.$el.offsetWidth
          const height = this.$el.offsetHeight
          this.applySize(width, height)
        }
        this.$_pendingSizeUpdate = null
      })
    },
    applySize(width, height) {
      const size = Math.round(height)
      if (size && this.size !== size) {
        if (this.scrollParent.$_undefinedMap[this.id]) {
          this.scrollParent.$_undefinedSizes--
          this.scrollParent.$_undefinedMap[this.id] = undefined
        }
        this.$set(this.scrollData.sizes, this.id, size)
        this.$set(this.scrollData.validSizes, this.id, true)
      }
    },
    observeSize() {
      if (!this.scrollResizeObserver) return
      this.scrollResizeObserver.observe(this.$el)
      this.$el.addEventListener('resize', this.onResize)
    },
    unobserveSize() {
      if (!this.scrollResizeObserver) return
      this.scrollResizeObserver.unobserve(this.$el)
      this.$el.removeEventListener('resize', this.onResize)
    },
    onResize(event) {
      const { width, height } = event.detail.contentRect
      this.applySize(width, height)
    },
    onScrollUpdate({ force }) {
      // If not active, sechedule a size update when it becomes active
      if (!this.finalActive && force) {
        this.$_pendingScrollUpdate = this.id
      }

      if (this.$_forceNextScrollUpdate === this.id || force || !this.size) {
        this.updateSize()
      }
    },
    onDataUpdate() {
      this.updateSize()
    }
  },
  render(h) {
    return h(this.tag, this.$slots.default)
  }
}
</script>
