/**
 * Events object which handle component eves
 * events: [{type, callback, meta}]
 *  -type: dom event type, now support click, mousemove, mousedown, mouseup
 *  -callback: will have three argument meta, inOrOut, layer.state
 */

export function eventsInit(Layer) {
  Layer.prototype._initEvents = function({ events }) {
    const layer = this
    layer.$events = {}
    layer.$connectEvents = {}
    if (events) {
      for (const key of events) {
        layer.addEvent(key.type, key.callback, key.meta)
      }
    }
  }

  Layer.prototype.addEvent = function(type, callback, meta) {
    const layer = this
    if (!layer.$events[type]) {
      layer.$events[type] = []
    }
    layer.$events[type].push({ callback, meta })

    // addevent to parent
    function connectLayer(lay) {
      if (lay.$parent) {
        if (!lay.$connectEvents[type]) {
          const method = function() {
            lay.emit(type, arguments[2])
          }
          lay.$parent.addEvent(type, method)
          lay.$connectEvents[type] = method
        }
      }
    }
    connectLayer(layer)
  }

  Layer.prototype.removeEvents = function(type, callback) {
    const layer = this
    if (layer.$events[type]) {
      if (!callback) {
        delete layer.$events[type]

        // clear eventsconnect to parent
        if (this.$parent) {
          this.$parent.removeEvents(type, layer.$connectEvents[type])
        }
      } else {
        const li = layer.$events[type]
        for (let index = 0; index < li.length; index++) {
          if (li[index].callback === callback) {
            li.splice(index, 1)
          }
        }
      }
    }
  }

  Layer.prototype.removeAllEvents = function(type, callback) {
    const layer = this
    for (const key in layer.$events[type]) {
      delete layer.$events[key]
    }
  }

  Layer.prototype.emit = function emit(type, pos, params) {
    const layer = this
    if (layer.$events[type]) {
      const list = layer.$events[type]
      for (const call of list) {
        const check = layer.$here && layer.$here(layer.state, pos.x, pos.y, layer.context)
        call.callback.call(layer, call.meta, check, pos, layer.state, params)
      }
    }
  }
}
