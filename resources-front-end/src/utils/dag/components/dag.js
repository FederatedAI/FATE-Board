import { progress as Progress, HEIGHT_, connectRedraw } from './progress'
import { Line as Linking } from '../basePath'
import Tree from './dagInfo'
import { TIMES } from '../const'

/**
 * export function
 */

const path = function(ctx, state) {
  const { width, fontSize, betAR, betIR, tree, imgs } = state
  let { betLM } = state
  const layer = this
  const height = fontSize + HEIGHT_
  if (betLM > betIR) {
    betLM = betIR + 2 * TIMES
  }

  // init current data from tree
  const root = tree._root
  const levels = tree._level

  // drawing node
  const drawNode = function(node) {
    const pos = node.pos
    let type = 'success'
    let icon = null
    const animate = []
    if (node.status === 'success') {
      type = 'success'
      icon = node.disable ? imgs['disable_complete'] : imgs['complete']
    } else if (node.status === 'running') {
      type = 'running'
      animate.push(Progress.animations.loading)
      animate.push(Progress.animations.tiktok)
    } else if (node.status === 'error') {
      type = 'error'
      icon = node.disable ? imgs['disable_error'] : imgs['error']
    } else {
      type = 'unrun'
    }
    const model = !(node.model && node.model.toLowerCase().match(/(intersection|federatedsample|evaluation|upload|download|RSA)/i))
    const output = !(node.model && node.model.toLowerCase().match(/(evaluation|upload|download)/i))
    const noDataOutput = !!(node.model && node.model.toLowerCase().match(/(pearson)/i))
    layer.drawLayer(node.name, {
      canvas: layer.canvas,
      state: {
        x: pos.x,
        y: pos.y,
        width,
        text: node.name,
        textStyle: { size: fontSize },
        time: node.time,
        type,
        icon,
        model,
        output,
        noDataOutput,
        disable: node.disable
      },
      path: Progress.path,
      events: Progress.events,
      here: Progress.here,
      clear: Progress.clear,
      animations: animate
    }, true)
    return layer.getLayer(node.name).instance
  }
  // drawing connect line
  const drawLine = function(pn, tn, data) {
    // get out-point and in-point position
    let inn = null
    let outo = null
    if (data === 'data') {
      outo = pn.getDag().getMeta('connect').data.out
      inn = tn.getDag().getMeta('connect').data.in
    } else {
      outo = pn.getDag().getMeta('connect').model.out
      inn = tn.getDag().getMeta('connect').model.in
    }
    const pl = pn.level
    const tl = tn.level

    // get index of model into current level
    let indexTn = 0
    let indexPn = 0
    const tnc = levels[tl - 1]
    const pnc = levels[pl - 1]
    if (tnc.length > 1) {
      for (let i = 0; i < tnc.length; i++) {
        if (tnc[i].equal(tn)) {
          indexTn = i
          break
        }
      }
    }
    if (pnc.length > 1) {
      for (let i = 0; i < pnc.length; i++) {
        if (pnc[i].equal(pn)) {
          indexPn = i
          break
        }
      }
    }

    // when between two model there has other middle-chunk
    let checkpos = null
    let final = null
    let plpos = null
    let tlpos = null
    let across = false
    let lastPointer = null
    plpos = Tree.itemWidth(levels, { i: pl - 1, n1: indexPn + 1, w: width, h: height })
    tlpos = Tree.itemWidth(levels, { i: tl - 1, n2: indexTn - 1, w: width, h: height })
    // if (pn.name === 'feature_scale_0' && tn.name === 'hetero_feature_selection_0') debugger
    const pm = []
    if (plpos === 'last') {
      pm.push({ x: outo.x, y: outo.y + betAR / 4 })
    } else {
      pm.push({ x: outo.x, y: outo.y + betIR / 2 })
      if (plpos.sx + betLM <= outo.x) {
        checkpos = plpos
      } else {
        if (inn.x !== outo.x && ((inn.y - outo.y) / (inn.x - outo.x)) < ((plpos.ey + betLM - outo.y) / (plpos.sx - betLM - outo.x)) && data === 'model') {
          if (tl > pl + 1) {
            pm.push({ x: plpos.sx - betLM, y: plpos.ey + betLM })
          }
        }
      }
    }
    if (tl > pl + 1) {
      across = true
      for (let i = pl; i < tl - 1; i++) {
        const mid = Tree.itemWidth(levels, { i, w: width, h: height })
        if (data === 'data') {
          if (mid.sx - betLM > outo.x) {
            mid.sx = outo.x
          } else if (mid.ex + betLM < outo.x) {
            mid.ex = outo.x
          }
        } else if (data === 'model') {
          if (mid.ex + betLM < outo.x) {
            mid.ex = outo.x - betLM
          } else if (mid.sx + betLM > outo.x) {
            mid.sx = outo.x + betLM
          }
        }
        if (!checkpos) {
          checkpos = mid
        } else {
          if (checkpos.sx > mid.sx) checkpos.sx = mid.sx
          if (checkpos.ex < mid.ex) checkpos.ex = mid.ex
          checkpos.ey = mid.ey
        }
      }
    }
    if (tlpos instanceof Object) {
      if (data === 'data') {
        if (tlpos.ex - betLM >= inn.x) {
          if (!checkpos) {
            checkpos = tlpos
          } else {
            if (tlpos.sx < checkpos.sx) {
              checkpos.sx = tlpos.sx
            }
            checkpos.ey = tlpos.ey
          }
        } else {
          if (tl > pl + 1) {
            final = { x: inn.x, y: tlpos.sy - betAR }
          } else {
            const frontof = Tree.itemWidth(levels, { i: tl - 1, n1: indexTn - 1, n2: indexTn - 1, w: width, h: height })
            if (outo.x < inn.x) {
              if (frontof.ex > outo.x) {
                if (((frontof.sy - betLM - outo.y) / (frontof.ex + betLM - outo.x) < ((inn.y - outo.y) / (inn.x - outo.x)))) {
                  final = { x: frontof.ex + betLM, y: frontof.sy - betLM }
                }
              }
            } else if (outo.x > inn.x) {
              if (((frontof.ey + betLM - outo.y) / (frontof.ex + betLM - outo.x)) < ((inn.y - outo.y) / (inn.x - outo.x))) {
                final = { x: frontof.ex + betLM, y: frontof.ey + betLM }
              }
            } else if (outo.x === inn.x) {
              if (frontof.ex + betLM > outo.x) {
                final = { x: (frontof.ex + betLM), y: (frontof.sy + frontof.ey) / 2 }
              }
            }
          }
        }
      } else if (data === 'model') {
        if (tlpos.ex + betLM >= inn.x) {
          if (!checkpos) {
            checkpos = tlpos
          } else {
            if (checkpos.ex < tlpos.ex) checkpos.ex = tlpos.ex
            checkpos.ey = tlpos.ey
          }
        } else {
          if (tl > pl + 1) {
            final = { x: inn.x, y: tlpos.sy - betAR }
          } else {
            const frontof = Tree.itemWidth(levels, { i: tl - 1, n1: indexTn - 1, n2: indexTn - 1, w: width, h: height })
            if (frontof.ex + betLM > outo.x) {
              if (Math.abs((frontof.sy - betLM - outo.y) / (frontof.ex + betLM - outo.x)) < Math.abs((inn.y - outo.y) / (inn.x - outo.x))) {
                final = { x: frontof.ex + betLM, y: frontof.sy - betLM }
              }
            }
          }
        }
      }
    }
    lastPointer = pm[pm.length - 1]
    if (checkpos) {
      if (!(checkpos.ex < inn.x && checkpos.ex < outo.x) || !(checkpos.sx > inn.x && checkpos.sx > outo.x)) {
        if (Math.abs(checkpos.sx - outo.x) < Math.abs(checkpos.ex - outo.x)) {
          if (inn.x < checkpos.sx) {
            if (Math.abs((checkpos.sy - lastPointer.y) / (checkpos.sx - lastPointer.x)) < Math.abs((inn.y - lastPointer.y) / (inn.x - lastPointer.x))) {
              pm.push({ x: checkpos.sx - betLM, y: checkpos.sy - betLM })
            }
          } else {
            pm.push({ x: checkpos.sx - betLM, y: checkpos.sy - betLM })
            if (across) {
              if (checkpos.sx - betLM < outo.x && checkpos.sx - betLM < inn.x) { pm.push({ x: checkpos.sx - betLM * 2, y: (checkpos.sy + checkpos.ey) / 2 }) }
            }
            pm.push({ x: checkpos.sx - betLM, y: checkpos.ey + betLM })
          }
        } else {
          if (inn.x > checkpos.ex) {
            if (Math.abs((checkpos.sy - lastPointer.y) / (checkpos.ex - lastPointer.x)) < Math.abs((inn.y - lastPointer.y) / (inn.x - lastPointer.x))) {
              pm.push({ x: checkpos.ex + betLM, y: checkpos.sy - betLM })
            }
          } else {
            pm.push({ x: checkpos.ex + betLM, y: checkpos.sy - betLM })
            if (across) {
              if (checkpos.ex + betLM > outo.x && checkpos.ex + betLM > inn.x) { pm.push({ x: checkpos.ex + betLM * 2, y: (checkpos.sy + checkpos.ey) / 2 }) }
            }
            pm.push({ x: checkpos.ex + betLM, y: checkpos.ey + betLM })
          }
        }
      }
    }
    if (final) {
      pm.push(final)
    }
    if (tlpos === 'first') {
      pm.push({ x: inn.x, y: inn.y - betAR / 4 })
    } else {
      pm.push({ x: inn.x, y: inn.y - betIR / 2 })
    }
    layer.drawLayer('line:' + pn.name + tn.name, {
      canvas: layer.canvas,
      state: { ps: outo, pt: inn, pm },
      path: Linking.path
    })
    // connectsRedraw(layer)
  }
  // Drawing connect
  const draw = function(parent) {
    const pd = parent
    let dataList = parent.getDataChild()
    if (dataList) {
      for (const vald of dataList) {
        const c = draw(vald)
        drawLine(pd, c, 'data')
      }
    }
    dataList = parent.getModelChild()
    if (dataList) {
      for (const valm of dataList) {
        const c = draw(valm)
        drawLine(pd, c, 'model')
      }
    }
    return pd
  }
  // drawing all nodes
  const drawLevels = function() {
    for (const index of levels) {
      for (const val of index) {
        const pd = drawNode(val)
        val.setDag(pd)
      }
    }
    for (const r of root) {
      draw(r)
    }
  }
  drawLevels()
  // for (const val of this._component.progresses) {
  //   val.getDag().reDrawingConnect()
  // }
}

const clear = function(ctx, state) {
  const layer = this
  ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
}

const modelClick = function(layer, func) {
  const layers = layer.getLayer()
  for (const key in layers) {
    if (!key.indexOf('line:') >= 0 && key !== 'length') {
      func.call(layers[key].instance, key)
    }
  }
}

const connectsRedraw = function(layer) {
  const layers = layer.getLayer()
  for (const key in layers) {
    if (!(key.indexOf('line:') >= 0) && key !== 'length') {
      connectRedraw(layers[key].instance)
    }
  }
}

const dag = { path, clear }

export { dag, modelClick, connectsRedraw }
