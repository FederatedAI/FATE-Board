<template>
  <div
    v-show="show"
    :class="className"
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
    origin: {
      type: String,
      default: 'default'
    },
    hold: {
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
      if (this.status === 'default') {
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
      if (this.hold) {
        this.holded = this.status
      }
      if (this.hoverUrl) {
        this.status = 'hover'
      }
    },
    mouseout() {
      if (this.hold) {
        this.status = this.holded
      } else {
        this.status = 'default'
      }
    },
    mousedown() {
      if (this.activeUrl) {
        if (this.holded) {
          this.holded = 'active'
        }
        this.status = 'active'
      }
    },
    mouseup() {
      if (this.status === 'active' && !this.hold) {
        this.status = 'default'
      }
    },
    click() {
      this.$emit('clickFn')
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
