<template>
  <div
    v-observe-visibility="handleVisibilityChange"
    :class="{ ready }"
    class="scroller"
    @scroll.passive="handleScroll"
  >
    <div ref="wrapper" :style="{minHeight: totalSize + 'px'}" class="wrap">
      <virtual-scroll-item
        v-for="view in pool"
        :key="view.info.id"
        :item="view.item"
        :index="view.info.index"
        :active="view.info.used"
        :style="ready ? { transform: `translateY(${view.position}px)` } : null"
        class="item-view"
      >
        <slot :item="view.item" :index="view.info.index" :active="view.info.used" />
      </virtual-scroll-item>
    </div>
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

import ResizeObserver from 'resize-observer-polyfill'
import VirtualScrollItem from './VirtualScrollItem'
import { ObserveVisibility } from 'vue-observe-visibility'

let uid = 0
export default {
  name: 'VirtualScroll',
  directives: {
    ObserveVisibility
  },
  components: {
    VirtualScrollItem
  },
  provide() {
    this.$_resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target) {
          const event = new CustomEvent('resize', {
            detail: {
              contentRect: entry.contentRect
            }
          })
          entry.target.dispatchEvent(event)
        }
      }
    })
    return {
      scrollData: this.scrollData,
      scrollParent: this,
      scrollResizeObserver: this.$_resizeObserver
    }
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    distance: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    },
    minItemSize: {
      type: Number,
      required: true
    },
    buffer: {
      type: Number,
      default: 200
    },
    keyField: {
      type: String,
      default: 'lineNum'
    },
    emitScroll: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      pool: [],
      ready: false,
      totalSize: 0,
      scrollData: {
        active: true,
        sizes: {},
        validSizes: {},
        keyField: this.keyField
      }
    }
  },
  computed: {
    itemsWithSize() {
      const result = []
      const { items, keyField } = this
      const sizes = this.scrollData.sizes
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const id = item[keyField]
        let size = sizes[id]
        if (typeof size === 'undefined' && !this.$_undefinedMap[id]) {
          size = 0
        }
        result.push({
          item,
          id,
          size
        })
      }
      return result
    },
    sizes() {
      const sizes = {
        '-1': { accumulator: 0 }
      }
      const items = this.itemsWithSize
      const minItemSize = this.minItemSize
      let computedMinSize = 10000
      let accumulator = 0
      let current
      for (let i = 0, l = items.length; i < l; i++) {
        current = items[i].size || minItemSize
        if (current < computedMinSize) {
          computedMinSize = current
        }
        accumulator += current
        sizes[i] = { accumulator, size: current }
      }
      // eslint-disable-next-line
      this.$_computedMinItemSize = computedMinSize
      return sizes
    }
  },
  watch: {
    items() {
      this.forceUpdate()
    },
    sizes: {
      handler(value) {
        this.updateItems(false)
      },
      deep: true
    },
    itemsWithSize() {
      this.updateItems(true)
    }
  },
  beforeCreate() {
    // dynamic size
    this.$_updates = []
    this.$_undefinedSizes = 0
    this.$_undefinedMap = {}
  },
  created() {
    this.$_startIndex = 0
    this.$_endIndex = 0
    this.$_views = new Map()
    this.$_unusedViews = new Map()
    this.$_scrollDirty = false
    this.$_lastUpdateScrollPosition = 0
  },
  mounted() {
    this.$nextTick(() => {
      this.updateItems(true)
      this.ready = true
    })

    this.addResizeObserver()
  },
  methods: {
    addView(pool, index, item, key) {
      const view = {
        item,
        position: 0
      }
      const property = {
        id: uid++,
        index,
        used: true,
        key
      }
      Object.defineProperty(view, 'info', {
        configurable: false,
        value: property
      })
      pool.push(view)
      return view
    },
    unuseView(view, fake = false) {
      const unusedViews = this.$_unusedViews
      const type = view.info.type
      let unusedPool = unusedViews.get(type)
      if (!unusedPool) {
        unusedPool = []
        unusedViews.set(type, unusedPool)
      }
      unusedPool.push(view)
      if (!fake) {
        view.info.used = false
        view.position = -9999
        this.$_views.delete(view.info.key)
      }
    },
    handleScroll() {
      this.checkPosition()
      if (!this.$_scrollDirty) {
        this.$_scrollDirty = true
        requestAnimationFrame(() => {
          this.$_scrollDirty = false
          const { continuous } = this.updateItems(false, true)
          if (!continuous) {
            clearTimeout(this.$_refreshTimout)
            this.$_refreshTimout = setTimeout(this.handleScroll, 100)
          }
        })
      }
    },
    getRange(scroll) {
      let startIndex = 0
      let endIndex = 0
      const count = this.items.length
      const lastIndex = count - 1
      const sizes = this.sizes
      const buffer = this.buffer
      scroll.start -= buffer
      scroll.end += buffer

      let h
      let a = 0
      let b = lastIndex
      let i = ~~(count / 2)
      let oldI
      do {
        oldI = i
        h = sizes[i].accumulator
        if (h < scroll.start) {
          a = i
        } else if (i < lastIndex && sizes[i + 1].accumulator > scroll.start) {
          b = i
        }
        i = ~~((a + b) / 2)
      } while (i !== oldI)
      i < 0 && (i = 0)
      startIndex = i

      for (
        endIndex = i;
        endIndex < lastIndex && sizes[endIndex].accumulator < scroll.end;
        endIndex++
      );
      if (endIndex === -1) {
        endIndex = lastIndex
      } else {
        endIndex++
        endIndex > count && (endIndex = count)
      }
      return {
        startIndex,
        endIndex
      }
    },
    updateItems(checkItem, checkPositionDiff = false) {
      const { items, sizes, pool, keyField } = this
      const minItemSize = this.$_computedMinItemSize
      const views = this.$_views
      const unusedViews = this.$_unusedViews
      const count = items.length
      const scroll = this.getScroll()
      if (checkPositionDiff) {
        let positionDiff = scroll.start - this.$_lastStartPosition
        if (positionDiff < 0) positionDiff = -positionDiff
        if (positionDiff < minItemSize) {
          return {
            continuous: true
          }
        }
      }

      this.$_lastStartPosition = scroll.start

      const { startIndex, endIndex } = this.getRange(scroll)
      const totalSize = sizes[count - 1].accumulator
      this.totalSize = totalSize

      let view

      const continuous =
        startIndex <= this.$_endIndex && endIndex >= this.$_startIndex
      if (this.$_continuous !== continuous) {
        if (continuous) {
          views.clear()
          unusedViews.clear()
          for (let i = 0, l = pool.length; i < l; i++) {
            view = pool[i]
            this.unuseView(view)
          }
        }
        this.$_continuous = continuous
      } else if (continuous) {
        for (let i = 0, l = pool.length; i < l; i++) {
          view = pool[i]
          if (view.info.used) {
            if (checkItem) {
              view.info.index = items.findIndex(
                item => item[keyField] === view.item[keyField]
              )
            }
            if (
              view.info.index === -1 ||
              view.info.index < startIndex ||
              view.info.index >= endIndex
            ) {
              this.unuseView(view)
            }
          }
        }
      }

      const unusedIndex = continuous ? null : new Map()
      let item, type, unusedPool
      let v
      for (let i = startIndex; i < endIndex; i++) {
        item = items[i]
        const key = item[keyField]
        view = views.get(key)

        if (!sizes[i].size) {
          if (view) this.unuseView(view)
          continue
        }

        if (!view) {
          type = item.type
          unusedPool = unusedViews.get(type)
          if (continuous) {
            if (unusedPool && unusedPool.length) {
              view = unusedPool.pop()
              view.item = item
              view.info.used = true
              view.info.index = i
              view.info.key = key
            } else {
              view = this.addView(pool, i, item, key)
            }
          } else {
            v = unusedIndex.get(type) || 0
            if (!unusedPool || v >= unusedPool.length) {
              view = this.addView(pool, i, item, key)
              this.unuseView(view, true)
              unusedPool = unusedViews.get(type)
            }

            view = unusedPool[v]
            view.item = item
            view.info.used = true
            view.info.index = i
            view.info.key = key
            unusedIndex.set(type, v + 1)
            v++
          }
          views.set(key, view)
        } else {
          view.info.used = true
          view.item = item
        }
        view.position = sizes[i - 1].accumulator
      }

      this.$_startIndex = startIndex
      this.$_endIndex = endIndex

      clearTimeout(this.$_sortTimer)
      this.$_sortTimer = setTimeout(this.sortViews, 300)
      return {
        continuous
      }
    },
    getScroll() {
      const el = this.$el
      return {
        start: el.scrollTop,
        end: el.scrollTop + el.clientHeight
      }
    },
    sortViews() {
      this.pool.sort((viewA, viewB) => viewA.info.index - viewB.info.index)
    },
    checkPosition() {
      const scroll = this.getScroll()
      if (this.ready && scroll.start === 0) {
        this.$emit('scroll-top')
      }
      if (this.ready && this.$el.scrollHeight - scroll.end === 0) {
        this.$emit('scroll-bottom')
      }
      if (this.ready && this.emitScroll) {
        this.$emit('scroll', {
          ...scroll,
          top: scroll.start,
          bottom: this.$el.scrollHeight - scroll.end
        })
      }
    },
    handleVisibilityChange(isVisible, entry) {
      if (this.ready) {
        if (
          isVisible ||
          entry.boundingClientRect.width !== 0 ||
          entry.boundingClientRect.height !== 0
        ) {
          // visible
          this.$emit('vscroll:update', { force: false })
          requestAnimationFrame(() => {
            this.updateItems(false)
          })
        }
      }
    },
    addResizeObserver() {
      const resizeObserver = new ResizeObserver(this.handleResize)
      resizeObserver.observe(this.$el)
      this.$once('hook:beforeDestory', () => {
        resizeObserver.disconnect()
      })
    },
    handleResize() {
      if (this.ready) {
        this.updateItems(false)
        this.forceUpdate()
      }
    },
    scrollToItem(index) {
      const scroll = index > 0 ? this.sizes[index - 1].accumulator : 0
      this.scrollToPosition(scroll)
    },
    scrollToPosition(position) {
      this.$el.scrollTop = position
    },
    scrollToBottom() {
      if (this.$_scrollingToBottom) return
      this.$_scrollingToBottom = true
      const el = this.$el
      // Item is inserted to the DOM
      this.$nextTick(() => {
        el.scrollTop = el.scrollHeight + 5000
        // Item sizes are computed
        const cb = () => {
          el.scrollTop = el.scrollHeight + 5000
          requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight + 5000
            if (this.$_undefinedSizes === 0) {
              this.$_scrollingToBottom = false
            } else {
              requestAnimationFrame(cb)
            }
          })
        }
        requestAnimationFrame(cb)
      })
    },
    forceUpdate(clear = true) {
      if (clear) {
        this.scrollData.validSizes = {}
      }
      this.$emit('vscroll:update', { force: true })
    }
  }
}
</script>

<style lang="scss" scoped>
.scroller {
  position: relative;
  overflow-y: auto;
}

.wrap {
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.item-view {
  width: 100%;
}

.scroller.ready .item-view {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}
</style>
