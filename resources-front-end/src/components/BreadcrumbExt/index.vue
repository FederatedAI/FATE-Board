<template>
  <div class="flex flex-row flex-center bread-crumb-container">
    <span
      v-for="(item, index) in usableBread"
      :key="index"
      :class="{'bread-link': item.type !== 'break', 'bread-break': item.type === 'break'}"
    >
      <i v-if="item.type === 'icon'" :class="item.val" @click="formatClick(item.click)" />
      <i v-else-if="item.type === 'break'" :class="item.val" />
      <span v-else @click="formatClick(item.click)">{{ item.val }}</span>
    </span>
  </div>
</template>

<script>
export default {
  name: 'BreadcrumbExt',

  props: {
    // [{type: icon | content, val: String}]
    breads: {
      type: Array,
      default: () => []
    },
    needHome: {
      type: Boolean,
      default: true
    },
    needBreak: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      usableBread: [],
      defaultBreak: {
        type: 'break',
        val: 'el-icon-arrow-right'
      },
      defaultHome: {
        type: 'icon',
        val: 'el-icon-s-home',
        click: this.$_defaultHomeLinkEvent
      }
    }
  },

  watch: {
    breads: {
      handler() {
        this.$_init()
      },
      deep: true
    },
    needHome() {
      this.$_init()
    },
    needBreak() {
      this.$_init()
    }
  },

  beforeMount() {
    this.$_init()
  },

  methods: {
    $_init() {
      const final = []
      if (this.needHome) {
        final.push(this.defaultHome)
      }
      if (this.needBreak) {
        final.push(this.defaultBreak)
      }
      for (let i = 0; i < this.breads.length; i++) {
        final.push(this.breads[i])
        if (this.breads[i + 1] && this.needBreak) {
          final.push(this.defaultBreak)
        }
      }
      this.usableBread = final
    },

    $_defaultHomeLinkEvent() {
      this.$router.push({
        path: '/'
      })
    },

    formatClick(cli) {
      if (typeof cli === 'function') {
        cli()
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import './scss/breadCrumb.scss';
</style>
