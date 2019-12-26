
/**
 * Adding lifecycle function into class
 * @param {Pbject} Layer Layer instance
 */
export function lifecycleInit(Layer) {
  Layer.prototype._startLifecycle = function() {
    const layer = this

    // instance has update or not
    layer.$updated = false

    // for destory instances
    layer.$destroying = false
    layer.$destroyed = false
  }

  // ???-v2 will support async
  Layer.prototype.$afterInit = function() {
    const layer = this
    layer.afterInit && layer.afterInit(layer.state)
  }

  // ???-v2 will support async
  Layer.prototype.$beforeDrawing = function() {
    const layer = this
    layer.beforeDrawing && layer.beforeDrawing(layer.state)
  }

  // ???-v2 will support async
  Layer.prototype.$afterDrawing = function() {
    const layer = this
    layer.afterDrawing && layer.afterDrawing(layer.state)
    layer.getImageData && layer.getImageData(layer.state)
  }

  // ???-v2 will support async
  Layer.prototype.$beforeUpdate = function() {
    const layer = this
    layer.beforeUpdate && layer.beforeUpdate(layer.state)
  }

  // ???-v2 will support async
  Layer.prototype.$afterUpdate = function() {
    const layer = this
    layer.afterUpdate && layer.afterUpdate(layer.state)
    layer.$willUpdate()
    layer.$forceUpdate()
  }

  Layer.prototype.$willUpdate = function() {
    const will = function(layer) {
      if (layer) {
        layer.$updated = true
        will(layer.$parent)
      }
    }
    will(this)
  }

  Layer.prototype.$forceUpdate = function() {
    const will = function(layer) {
      const layers = layer.getLayer()
      if (layers) {
        for (const key in layers) {
          if (layers[key].instance) {
            layers[key].instance.$updated = true
            will(layers[key].instance)
          }
        }
      }
    }
    will(this)
  }

  Layer.prototype.$needToUpdate = function() {
    return this.$updated
  }

  Layer.prototype.$endUpdate = function() {
    const layer = this
    layer.$updated = false
    const list = layer.getLayer()
    for (const key in list) {
      if (list[key] instanceof Object) {
        list[key].instance.$endUpdate()
      }
    }
  }

  Layer.prototype._destory = function() {
    const layer = this
    callhook(layer, 'beforeDestory')
    layer.removeAllAnimation()
    layer.removeEvents()
    layer.$clear && layer.$clear(layer.context, layer.state)
    layer.$destroyed = true
    callhook(layer, 'afterDestory')
  }
}

/**
 * For calling hook function
 * @param {Object} layer Layer instance
 */
export function callhook(layer, hook) {
  if (layer['$' + hook]) {
    layer['$' + hook](layer.state, layer.$layers, layer.path)
  }
}
