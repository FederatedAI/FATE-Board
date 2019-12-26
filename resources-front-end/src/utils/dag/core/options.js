/**
 * Operating options for canvas class
 */
import { callhook } from './lifecycle'

export function optionInit(Layer) {
  Layer.prototype._initOptions = function({ canvas, state, path, imageData, here, clear, $parent, delay, transfiguration }) {
    const layer = this
    initState(layer, state)
    initLayers(layer)
    initBrush(layer, canvas)
    initPath(layer, path)
    initHere(layer, here)
    initClear(layer, clear)
    initImageData(layer, imageData)
    initMeta(layer)
    initParent(layer, $parent)
    initDelay(layer, delay)
    initTrans(layer, transfiguration)
    callhook(layer, 'afterInit')
  }

  Layer.prototype.setLayer = function setLayer(name, object) {
    const layer = this
    const index = layer.$layers.length++
    layer.$layers[name] = { state: object, index: index, instance: null }
    return layer.$layers[name]
  }

  Layer.prototype.getLayer = function getLayer(name) {
    const layer = this
    if (name) {
      return layer.$layers[name]
    } else {
      return layer.$layers
    }
  }

  Layer.prototype.setParent = function setParent(parent) {
    const layer = this
    layer.$parent = parent
  }

  Layer.prototype.setMeta = function setMeta(name, value) {
    const layer = this
    layer.$meta[name] = value
  }

  Layer.prototype.getMeta = function getMeta(name) {
    const layer = this
    if (layer.$meta[name]) return layer.$meta[name]
    const ls = layer.getLayer()
    let final
    for (const key in ls) {
      if (key !== 'length') {
        final = ls[key].instance.getMeta(name)
        if (final) return final
      }
    }
    return null
  }

  Layer.prototype.setStates = function(obj) {
    const layer = this
    for (const key in obj) {
      if (layer.state[key] !== undefined) {
        layer.state[key] = obj[key]
      } else {
        initState(layer, { [key]: obj[key] })
        this.$willUpdate()
      }
    }
  }

  Layer.prototype.addState = function(obj) {
    const layer = this
    initState(layer, obj)
  }
}

// For init state for layer
function initState(layer, options) {
  layer.state = layer.state ? layer.state : {}
  // add origin value
  for (const key in options) {
    layer.state['$' + key] = options[key]
  }
  // set properties
  for (const key in options) {
    (function() {
      const ok = '$' + key
      const k = key
      const o = layer.state
      Object.defineProperty(o, k, {
        enumerable: true,
        configurable: true,
        get: function getState() {
          return o[ok]
        },
        set: function setState(newValue) {
          if (equal(newValue, o[ok])) {
            callhook(layer, 'beforeUpdate')
            o['$' + k] = newValue
            callhook(layer, 'afterUpdate')
          }
        }
      })
    })()
  }
}

function equal(a, b) {
  if (!a || !b) {
    return true
  }
  if (typeof a === 'object' && typeof b === 'object') {
    for (const key in a) {
      if (b[key]) {
        if (a[key] !== b[key]) {
          return true
        }
      } else {
        return true
      }
    }
    return false
  } else {
    return a !== b
  }
}

// check layer this instance have
function initLayers(layer) {
  layer.$layers = {
    length: 0
  }
}

function initBrush(layer, canvas) {
  layer.context = canvas.getContext('2d')
  layer.canvas = canvas
}

function initPath(layer, path) {
  layer.path = path
}

function initImageData(layer, imageData) {
  layer.$imageData = null
  if (imageData && imageData.put && imageData.get) {
    layer.$getImageData = function getImageData() {
      layer.$imageData = imageData.get(layer.state)
    }
    layer.$putImageData = function putImageData() {
      imageData.put(layer.$imageData, this.state)
    }
  }
}

function initHere(layer, here) {
  layer.$here = here
}

function initClear(layer, clear) {
  layer.$clear = clear
}

function initMeta(layer) {
  layer.$meta = {}
}

function initParent(layer, parent) {
  layer.$parent = parent
}

function initDelay(layer, delay) {
  layer.$delay = delay
}

function initTrans(layer, transfiguration) {
  layer.$transfiguration = transfiguration
}
