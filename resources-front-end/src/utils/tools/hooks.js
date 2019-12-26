class hooks {
  constructor(options) {
    this._hooks = options.hooks
  }

  call(name, val, func) {
    if (val instanceof Function) {
      func = val
      val = undefined
    }
    const index = this.indexOf(name)
    if (index !== -1) this._hooks[index].operation(val, this._hooks[index].meta)
    else if (func) {
      this._hooks.push({ name: name, operation: func })
      func(val)
    }
  }

  add(name, func) {
    if (typeof name === 'object') {
      func = name.operation
      const item = { name, func, meta: name }
      name = name.name
      this._hooks.push(item)
    }
  }

  remove(name) {
    const index = this.indexOf(name)
    return index !== -1 && this._hooks.splice(index, 1)
  }

  indexOf(name) {
    this._hooks.map((item, index) => {
      if (item.name === name) {
        return index
      }
    })
    return -1
  }
}

export default hooks
