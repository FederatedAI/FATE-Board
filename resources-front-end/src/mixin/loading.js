const loading = {
  created() {
    const _this = this
    if (_this.httpRequest) {
      new Promise(function(resolve, reject) {
        _this.httpRequest(resolve, reject)
      }).then(res => {
        _this.customerLoading = false
      })
    }
  },

  beforeMount() {
    if (this.initing) {
      this.initing()
    }
    if (this.setting) {
      this.setting()
    }
  },

  data() {
    return {
      customerLoading: true
    }
  }
}

export { loading }
