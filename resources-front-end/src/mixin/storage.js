import { mapState, mapMutations } from 'vuex'

const cache = {
  data() {
    return {
      cache: []
    }
  },

  computed: {
    ...mapState('cache', {
      vuexCache: 'cache'
    })
  },

  methods: {
    ...mapMutations('cache', [
      'setItem',
      'getItem',
      'removeItem',
      'clear'
    ]),

    addCache(key, value, local) {
      if (window) {
        local ? window.localStorage.setItem(key, value) : window.sessionStorage(key, value)
      } else if (this.vuexCache instanceof Array) {
        this.setItem({ key: key, val: value })
      } else {
        if (!this.cache) this._isVue && this.$set(this, 'cache', [])
        this.cache.push({ key: key, val: value })
      }
    },

    getCache(key, local) {
      if (window) {
        return local ? window.localStorage.getItem(key) : window.sessionStorage.getItem(key)
      } else if (this.vuexCache instanceof Array) {
        this.getItem(key)
      } else {
        if (!this.cache) this._isVue && this.$set(this, 'cache', [])
        for (const val of this.cache) {
          if (val.key === key) {
            return val.value
          }
        }
      }
    },

    removeCache(key, local) {
      if (window) {
        local ? window.localStorage.removeItem(key) : window.sessionStorage.removeItem(key)
      } else if (this.vuexCache instanceof Array) {
        this.removeItem(key)
      } else {
        if (!this.cache) this._isVue && this.$set(this, 'cache', [])
        for (let i = 0; i < this.cache.length; i++) {
          if (this.cache[i].key === key) {
            this.cache.splice(i, 1)
            break
          }
        }
      }
    },

    clearCache(local) {
      if (window) {
        local ? window.localStorage.clear() : window.sessionStorage.clear()
      } else if (this.vuexCache instanceof Array) {
        this.clear()
      } else {
        if (!this.cache) this._isVue && this.$set(this, 'cache', [])
        this.cache = []
      }
    }
  }
}

export { cache }
