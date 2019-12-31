export function animationInit(Layer) {
  Layer.prototype._initAnimation = function({ animations }) {
    const layer = this
    layer.$animations = {}
    if (animations) {
      for (const val of animations) {
        layer.addAnimation(val.name, val.callback, val.time)
      }
    }
  }

  Layer.prototype.addAnimation = function(name, callback, time) {
    const layer = this
    layer.$animations[name] = { callback, time }
    startAnimation(layer, name)
  }

  Layer.prototype.removeAnimation = function(name) {
    const layer = this
    stopAnimation(layer, name)
    delete layer.$animations[name]
  }

  Layer.prototype.remveAllAnimation = function() {
    const layer = this
    stopAllAnimation(layer)
    layer.$animations = {}
  }

  Layer.prototype.getAnimation = function(name) {
    const layer = this
    return layer.$animations[name]
  }
}

// For compatible
export function animateCompatible() {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame =
      window.webkitRequestAnimationFrame ||
      function(callback) {
        return setTimeout(callback, 1000 / 60)
      }
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame =
      window.webkitCancelAnimationFrame ||
      function(ID) {
        window.clearTimeout(ID)
      }
  }
}

function startAnimation(layer, name) {
  const animation = layer.$animations[name]
  let methods = null
  // if (animation.time) {
  methods = function() {
    animation.$animate = setTimeout(function() {
      const ret = animation.callback.call(layer, layer.state)
      if (ret === false) {
        stopAnimation(layer, name)
      } else {
        layer.redrawing()
        methods()
      }
    }, animation.time || 10)
  }
  methods()
}

function stopAnimation(layer, name) {
  const animation = layer.$animations[name]
  if (!animation) {
    return
  }
  window.clearTimeout(animation.$animate)
}

function stopAllAnimation(layer) {
  const animation = layer.$animations
  for (const key in animation) {
    window.clearTimeout(animation[key])
  }
}
