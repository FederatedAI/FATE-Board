export default function InitEvents(Layer) {
  Layer.prototype._InitEvents = function({ events }) {
    const lay = this
    lay.$events = events || {}
    lay.$events.$showing = function() {
      const layer = this
      layer.$visiable = true
      if (layer.$children.size > 0) {
        for (const val of layer.$children) {
          val[1].emit('$showing')
        }
      }
    }
    lay.$events.$hide = function() {
      const layer = this
      layer.$visiable = false
      if (layer.$children.size > 0) {
        for (const val of layer.$children) {
          val[1].emit('$hide')
        }
      }
    }
    lay.$events.$translate = function(x, y) {
      const layer = this
      if (!layer.$meta) layer.$meta = new Map()
      layer.$meta.set('$translate', { x: x || 0, y: y || 0 })
    }
  }

  Layer.prototype.$showing = function() {
    this.emit('$showing')
  }

  Layer.prototype.$hide = function() {
    this.emit('$hide')
  }

  Layer.prototype.emit = function(type, ...props) {
    const lay = this
    for (const val of lay.$children) {
      val[1].emit(type, ...props)
    }
    if (lay.$events[type]) {
      if (!Array.isArray(lay.$events[type])) {
        lay.$events[type] = [lay.$events[type]]
      }
      for (const val of lay.$events[type]) {
        val.call(lay, ...props)
      }
    }
  }

  Layer.prototype.addEvent = function(type, operation) {
    const lay = this
    if (!lay.$events[type]) lay.$events = []
    lay.$events.push(operation)
  }

  Layer.prototype.removeEvent = function(type) {
    const lay = this
    lay.$events[type] = []
  }
}
