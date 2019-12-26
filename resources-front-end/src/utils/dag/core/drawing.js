import { callhook } from './lifecycle'

const delays = []
let drawingOrigin = null

export function drawingInit(Layer) {
  Layer.prototype._initDrawing = function(path) {
    const layer = this
    callhook(layer, 'beforeDrawing')
    drawingPath(layer, path)
    callhook(layer, 'afterDrawing')
  }

  Layer.prototype.redrawing = function(path) {
    const layer = this
    if (layer.$needToUpdate()) {
      layer.$clear && layer.$clear(layer.context, layer.state)
      drawingPath(layer, path)
    }
    layer.$endUpdate()
  }

  Layer.prototype.forceRedrawing = function(path) {
    const layer = this
    layer.$willUpdate()
    layer.$clear && layer.$clear(layer.context, layer.state)
    drawingPath(layer, path)
    layer.$endUpdate()
  }

  Layer.prototype.drawLayer = function(name, object, props) {
    const layer = this
    let lay = layer.getLayer(name)
    if (!lay) {
      lay = layer.setLayer(name, object)
    } else {
      if (typeof props === 'boolean') {
        if (!props) lay.instance.setStates(object.state)
      } else {
        if (Array.isArray(props)) {
          const originalState = JSON.parse(JSON.stringify(lay.instance.state))
          for (const val of props) {
            originalState[val] = object.state[val]
          }
          object.state = originalState
        }
        lay.instance.setStates(object.state)
      }
    }
    if (!lay.instance) {
      lay.instance = new Layer(Object.assign(object, { $parent: layer }))
      lay.instance.setParent(layer)
    } else {
      drawingPath(lay.instance)
    }
  }
}

function drawingPath(layer, path) {
  if (!drawingOrigin) {
    drawingOrigin = layer
  }
  const brush = path || layer.path
  let used = false
  let i = 0
  const drawing = function() {
    if (!layer.$willUpdate && layer.$imageData && layer.$putImageData) {
      layer.$putImageData(layer.context, layer.state, layer.$imageData)
    } else {
      if (layer.$transfiguration) {
        layer.$transfiguration(layer.context)
      }
      const autoDraw = brush.call(layer, layer.context, layer.state)
      if (autoDraw) {
        if (layer.state.fill) {
          setBrushStyle(layer.context, layer.state.fill)
          layer.context.fill()
          used = true
        }
        if (layer.state.stroke) {
          if (used) {
            brush.call(layer, layer.context, layer.state)
          }
          setBrushStyle(layer.context, layer.state.stroke)
          layer.context.stroke()
        }
      }
      if (layer.$getImageData) {
        layer.$imageData = layer.$getImageData(layer.context, layer.state)
      }
    }
  }
  if (layer.$delay) {
    for (i = 0; i < delays.length; i++) {
      if (delays[i] === layer) {
        drawing()
        break
      }
    }
    if (i === delays.length) {
      delays.push(layer)
    } else {
      delays.splice(i, 1)
    }
  } else {
    drawing()
  }
  if (drawingOrigin === layer) {
    drawingOrigin = null
    for (const val of delays) {
      drawingPath(val)
    }
  }
}

export function setBrushStyle(ctx, style) {
  for (const key in style) {
    ctx[key] = style[key]
  }
}
