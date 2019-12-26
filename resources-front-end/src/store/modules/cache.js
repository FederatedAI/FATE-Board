const cache = {
  namespace: true,
  state: {
    cache: []
  },
  mutations: {
    setItem(state, val) {
      state.cache.push(val)
    },

    getItem(state, key) {
      state.cache.forEach(data => {
        if (data.key === key) {
          return data.val
        }
      })
    },

    removeItem(state, key) {
      state.cache.map((item, index) => {
        if (item.key === key) {
          state.cache.splice(index, 1)
          return
        }
      })
    },

    clear(state) {
      state.cache = []
    }
  }
}

export default cache
