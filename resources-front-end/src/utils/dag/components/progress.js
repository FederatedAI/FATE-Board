import { Rect, Text, Icon } from '../basePath'
import { measureText } from '../basePath/text'
import { connect as Connect, LINEWIDTH } from './connect'
import { colorRgb } from '../../tools/color'

import { TIMES } from '../const'

const CHOOSE = '#494ece'
const SUCCESS = '#24b68b'
const DISABLE = '#e8e8ef'
const RUNNING = '#24b68b'
const ERROR = '#ff6464'
const UNRUN = '#e8e8ef'
const COULDNOTRUN = '#BBBBC8'

const PROGRESS = 'rgba(36,182,139,0.6)'
const DISABLE_PROGRESS = 'rgba(187,187,200,0.6)'

const BALCK_TEXT = '#7f7d8e'
const WHITE_TEXT = '#ffffff'
const DISABLE_TEXT = '#534C77'
const FONT_SIZE = 8 * TIMES

const TIME_TEXT = '#cccccc'
const TIME_FONT_SIZE_DIS_ORIGIN = 1 * TIMES

const ICON_ = 10 * TIMES

const STROKE_LINE = 3 * TIMES

const BETWEEN_MODEL_ICON = 6 * TIMES

const HEIGHT_ = 10 * TIMES

const RADIUS = 4 * TIMES

const EXTENDS = 2 * TIMES

/**
 * static function
 */

function getRectColor(type, disable) {
  if (type.indexOf('_choose') >= 0) {
    return CHOOSE
  } else if (disable && type !== 'unrun') {
    return UNRUN
  } else if (disable && type === 'unrun') {
    return COULDNOTRUN
  } else if (type === 'success') {
    return SUCCESS
  } else if (type === 'running') {
    return RUNNING
  } else if (type === 'disable') {
    return DISABLE
  } else if (type === 'error') {
    return ERROR
  } else if (type === 'unrun') {
    return UNRUN
  }
}

function getTextColor(type, disable) {
  if (disable && type.indexOf('unrun') < 0) {
    if (type.indexOf('_choose') >= 0) {
      return WHITE_TEXT
    } else {
      return BALCK_TEXT
    }
  } else if (disable && type.indexOf('unrun') >= 0) {
    if (type.indexOf('_choose') >= 0) {
      return WHITE_TEXT
    } else {
      return DISABLE_TEXT
    }
  } else if (type.indexOf('success') >= 0) {
    return WHITE_TEXT
  } else if (type.indexOf('disable') >= 0) {
    return BALCK_TEXT
  } else if (type.indexOf('running') >= 0) {
    return BALCK_TEXT
  } else if (type.indexOf('error') >= 0) {
    return WHITE_TEXT
  } else if (type.indexOf('unrun') >= 0) {
    return BALCK_TEXT
  }
}

function cubicEaseOut(t, b, c, d) {
  b = parseFloat(b)
  c = parseFloat(c)
  d = parseFloat(d)
  t = parseFloat(t)
  return c * ((t = t / d - 1) * t * t + 1) + b
}

/**
 * export function
 */

/**
 * x, y, width, height, text : Number | String
 * type : 'success | error | unrun | disable | running | xxx_choose'
 * rectStyle : '#xxxxxx'
 * textStyle : color:'#xxxxxx', size, family
 * time : 'hh:mm:ss'
 * icon : Image
 * timeColor: color: #xxxxxx
 */
function path(ctx, state) {
  const layer = this
  const { x, y, width, text, type, icon, time = '00:00:00', progress = 0, model, output, noDataOutput, disable } = state
  let { rectStyle, textStyle, timeColor, progressStyle } = state
  rectStyle = rectStyle || getRectColor(type, disable)
  textStyle = textStyle || {}
  textStyle.color = textStyle.color || getTextColor(type, disable)
  textStyle.size = textStyle.size || FONT_SIZE
  const height = textStyle.size + HEIGHT_

  let wholeWidth = width
  let wholeHeignt = height
  const startX = x - width / 2 - 1
  const startY = y - height / 2 - 1

  // draw container rect
  const containerState = { x, y, radius: RADIUS }
  containerState.stroke = { strokeStyle: rectStyle, lineWidth: STROKE_LINE }
  containerState.width = width - STROKE_LINE
  containerState.height = height - STROKE_LINE
  layer.drawLayer('container', {
    canvas: layer.canvas,
    state: containerState,
    path: Rect.path
  })

  // draw running component
  let currentWidth = 0
  let runningX = 0
  let curRadius = 0
  if (type.indexOf('running') >= 0) {
    currentWidth = progress * (width - STROKE_LINE * 2 + EXTENDS)
    runningX = x - (width - STROKE_LINE * 2 + EXTENDS) / 2 + currentWidth / 2
    progressStyle = progressStyle || (disable ? DISABLE_PROGRESS : PROGRESS)
    curRadius = RADIUS
  } else {
    currentWidth = (width - STROKE_LINE * 2 + EXTENDS)
    runningX = x
    progressStyle = progressStyle || rectStyle
    curRadius = 0
  }
  layer.drawLayer('running', {
    canvas: layer.canvas,
    state: {
      x: runningX, y, width: currentWidth, height: height - STROKE_LINE * 2 + EXTENDS, fill: { fillStyle: progressStyle }, radius: curRadius
    },
    path: Rect.path
  })

  // draw content of progress
  layer.drawLayer('content', {
    canvas: layer.canvas,
    state: {
      x, y, text/* : type.match(/disable/) ? '********' : text*/, font: textStyle
    },
    path: Text.path
  })

  if (type.match(/success|error/)) {
    const iconWidth = height - ICON_
    const iconX = x + width / 2 + BETWEEN_MODEL_ICON + iconWidth / 2
    layer.drawLayer('icon', {
      canvas: layer.canvas,
      state: {
        x: iconX, y, width: iconWidth, height: iconWidth, image: icon
      },
      path: Icon.path
    })
    wholeWidth += BETWEEN_MODEL_ICON + iconWidth
  }

  // draw clock
  if (type.indexOf('running') >= 0) {
    timeColor = timeColor || TIME_TEXT
    const timeSize = textStyle.size - TIME_FONT_SIZE_DIS_ORIGIN
    const size = measureText(ctx, time, { size: timeSize })
    const timeX = x + width / 2 + BETWEEN_MODEL_ICON + size.width / 2
    layer.drawLayer('time', {
      canvas: layer.canvas,
      state: {
        x: timeX, y, text: time, font: { color: timeColor, size: timeSize, family: textStyle.family }
      },
      path: Text.path
    })
    wholeWidth += BETWEEN_MODEL_ICON + size.width
  }

  // draw connect point
  layer.drawLayer('connect', {
    canvas: this.canvas,
    state: {
      x, y, width, height, model, output, noDataOutput, disable, type
    },
    path: Connect.path,
    here: Connect.here,
    events: Connect.events
  })
  wholeHeignt += LINEWIDTH / 2
  layer.setMeta('wholeSize', { w: wholeWidth + EXTENDS, h: wholeHeignt + EXTENDS / 2, sx: startX, sy: startY })
}

function here(state, cx, cy, ctx) {
  const size = this.getMeta('wholeSize')
  const { x, y, width } = state
  const sx = x - width / 2 - 1
  const ex = sx + size.w
  if (cx >= sx &&
    cx <= ex &&
    cy >= y - size.h / 2 &&
    cy <= y + size.h / 2) {
    return true
  }
  return false
}

function clear(ctx, state) {
  const size = this.getMeta('wholeSize')
  const { x, y, width } = state
  const sx = x - width / 2 - 1
  ctx.clearRect(sx, y - size.h / 2 - 1, size.w, size.h)
}

const events = [
  {
    type: 'click',
    callback: function(meta, check, pos, state) {
      if (check) {
        if (state.type.indexOf('_choose') === -1) {
          state.type = state.type + '_choose'
          state.textStyle.color = getTextColor(state.type, state.disable)
        }
      } else {
        if (state.type.indexOf('_choose') >= 0) {
          state.type = state.type.replace('_choose', '')
          state.textStyle.color = getTextColor(state.type, state.disable)
        }
      }
    }
  }
]

const animations = {
  loading: {
    name: 'loading',
    callback: function(state) {
      if (state.type.indexOf('_choose') >= 0) {
        if (state.complete && state.complete.indexOf('_choose') < 0) {
          state.complete += '_choose'
        }
      } else {
        if (state.complete && state.complete.indexOf('_choose') >= 0) {
          state.complete = state.complete.replace('_choose', '')
        }
      }
      const layer = this
      let s = state.progressStyle || (state.disable ? DISABLE_PROGRESS : PROGRESS)
      const p = state.progress || 0
      if (p < 1) {
        layer.setStates({ progress: p + 0.005 })
      } else {
        s = s.replace('rgba(', '').replace(')', '').split(',')
        if (state.complete) {
          if (parseFloat(s[s.length - 1]) <= 1) {
            s[s.length - 1] = parseFloat(s[s.length - 1]) + 0.02
            // color for progress
            if (state.complete.indexOf('_choose') >= 0) {
              const start = (s[3] - 0.6) / 0.02
              const end = 20
              const to = [73, 78, 206]
              s[0] = cubicEaseOut(start, s[0], to[0] - s[0], end)
              s[1] = cubicEaseOut(start, s[1], to[1] - s[1], end)
              s[2] = cubicEaseOut(start, s[2], to[2] - s[2], end)
            } else if (state.complete === 'error') {
              const start = (s[3] - 0.6) / 0.02
              const end = 20
              const to = [255, 100, 100]
              s[0] = cubicEaseOut(start, s[0], to[0] - s[0], end)
              s[1] = cubicEaseOut(start, s[1], to[1] - s[1], end)
              s[2] = cubicEaseOut(start, s[2], to[2] - s[2], end)
            }
            s = 'rgba(' + s.join(',') + ')'
            layer.setStates({ progressStyle: s })

            // color for rect
            if (state.complete === 'error') {
              let r = state.rectStyle || colorRgb(getRectColor(state.type, state.disable))
              r = r.replace('rgba(', '').replace(')', '').split(',')
              const start = (s[3] - 0.6) / 0.02
              const end = 20
              const to = [255, 100, 100]
              r[0] = cubicEaseOut(start, r[0], to[0] - r[0], end)
              r[1] = cubicEaseOut(start, r[1], to[1] - r[1], end)
              r[2] = cubicEaseOut(start, r[2], to[2] - r[2], end)
              r[3] = 1
              layer.setStates({ rectStyle: 'rgba(' + r.join(',') + ')' })
            }

            // color for timer
            let t = state.timeColor || colorRgb(TIME_TEXT)
            t = t.replace('rgba(', '').replace(')', '').split(',')
            t[3] = t[3] || 1
            t[3] = parseFloat(t[3]) - 0.05
            layer.setStates({ timeColor: 'rgba(' + t.join(',') + ')' })

            // color for font
            let ts = ''
            if (!state.textStyle) {
              ts = colorRgb(getTextColor(state.type, state.disable))
            } else {
              ts = colorRgb(state.textStyle.color)
            }
            ts = ts.replace('rgba(', '').replace(')', '').split(',')
            const start = (1 - t[3]) / 0.05
            const end = 20
            const to = [255, 255, 255]
            ts[0] = cubicEaseOut(start, ts[0], to[0] - ts[0], end)
            ts[1] = cubicEaseOut(start, ts[1], to[1] - ts[1], end)
            ts[2] = cubicEaseOut(start, ts[2], to[2] - ts[2], end)
            const newTextStyle = {}
            ts[3] = ts[3] || 1
            for (const key in state.textStyle) {
              if (key === 'color') {
                newTextStyle[key] = 'rgba(' + ts.join(',') + ')'
              } else {
                newTextStyle[key] = state.textStyle[key]
              }
            }
            layer.setStates({ textStyle: newTextStyle })
          } else {
            const s = state.type.replace('running', state.complete)
            layer.setStates({ type: s, progressStyle: null, rectStyle: null, complete: null })
            layer.forceRedrawing()
            return false
          }
        } else if (parseFloat(s[s.length - 1]) > 0) {
          s[s.length - 1] -= 0.02
          s = 'rgba(' + s.join(',') + ')'
          layer.setStates({ progressStyle: s })
        } else {
          layer.setStates({ progress: 0, progressStyle: state.disable ? DISABLE_PROGRESS : PROGRESS })
        }
      }
    }
  },
  startLoading: {
    name: 'startLoading',
    callback: function(state) {
      if (state.type.indexOf('_choose') >= 0) {
        if (state.complete && state.complete.indexOf('_choose') < 0) {
          state.complete += '_choose'
        }
      } else {
        if (state.complete && state.complete.indexOf('_choose') >= 0) {
          state.complete = state.complete.replace('_choose', '')
        }
      }
      const layer = this
      let t = state.progressStyle || colorRgb(getRectColor(state.type, state.disable))
      t = t.replace('rgba(', '').replace(')', '').split(',')
      let finish = false
      t[3] = t[3] || 1
      const s = state.start || 0
      if (state.complete === 'success' && s < 50) {
        const start = s + 1
        const end = 50
        const to = [36, 182, 139]
        t[0] = cubicEaseOut(start, t[0], to[0] - t[0], end)
        t[1] = cubicEaseOut(start, t[1], to[1] - t[1], end)
        t[2] = cubicEaseOut(start, t[2], to[2] - t[2], end)
        layer.setStates({ start, rectStyle: 'rgba(' + t.join(',') + ')', progressStyle: 'rgba(' + t.join(',') + ')' })
        let font = colorRgb(state.textStyle.color || getRectColor(state.type, state.disable))
        font = font.replace('rgba(', '').replace(')', '').split(',')
        const toFont = [255, 255, 255]
        font[0] = cubicEaseOut(start, font[0], toFont[0] - font[0], end)
        font[1] = cubicEaseOut(start, font[1], toFont[1] - font[1], end)
        font[2] = cubicEaseOut(start, font[2], toFont[2] - font[2], end)
        font[3] = 1
        const c = JSON.parse(JSON.stringify(state.textStyle))
        c.color = 'rgba(' + font.join(',') + ')'
        layer.setStates({ start, rectStyle: 'rgba(' + t.join(',') + ')', progressStyle: 'rgba(' + t.join(',') + ')', textStyle: c })
      } else if (state.complete === 'success') {
        finish = true
      }

      if (state.complete === 'success_choose' && s < 50) {
        const start = s + 1
        const end = 50
        let font = colorRgb(state.textStyle.color || getRectColor(state.type, state.disable))
        font = font.replace('rgba(', '').replace(')', '').split(',')
        const toFont = [255, 255, 255]
        font[0] = cubicEaseOut(start, font[0], toFont[0] - font[0], end)
        font[1] = cubicEaseOut(start, font[1], toFont[1] - font[1], end)
        font[2] = cubicEaseOut(start, font[2], toFont[2] - font[2], end)
        font[3] = 1
        const c = JSON.parse(JSON.stringify(state.textStyle))
        c.color = 'rgba(' + font.join(',') + ')'
        layer.setStates({ start, textStyle: c })
      } else if (state.complete === 'success_choose') {
        finish = true
      }

      if (state.complete === 'error' && s < 50) {
        const start = s + 1
        const end = 50
        const to = [255, 100, 100]
        t[0] = cubicEaseOut(start, t[0], to[0] - t[0], end)
        t[1] = cubicEaseOut(start, t[1], to[1] - t[1], end)
        t[2] = cubicEaseOut(start, t[2], to[2] - t[2], end)
        let font = colorRgb(state.textStyle.color || getRectColor(state.type, state.disable))
        font = font.replace('rgba(', '').replace(')', '').split(',')
        const toFont = [255, 255, 255]
        font[0] = cubicEaseOut(start, font[0], toFont[0] - font[0], end)
        font[1] = cubicEaseOut(start, font[1], toFont[1] - font[1], end)
        font[2] = cubicEaseOut(start, font[2], toFont[2] - font[2], end)
        font[3] = 1
        const c = JSON.parse(JSON.stringify(state.textStyle))
        c.color = 'rgba(' + font.join(',') + ')'
        layer.setStates({ start, rectStyle: 'rgba(' + t.join(',') + ')', progressStyle: 'rgba(' + t.join(',') + ')', textStyle: c })
      } else if (state.complete === 'error') {
        finish = true
      }

      if (state.complete === 'error_choose' && s < 50) {
        const start = s + 1
        const end = 50
        let font = colorRgb(state.textStyle.color || getRectColor(state.type, state.disable))
        font = font.replace('rgba(', '').replace(')', '').split(',')
        const toFont = [255, 255, 255]
        font[0] = cubicEaseOut(start, font[0], toFont[0] - font[0], end)
        font[1] = cubicEaseOut(start, font[1], toFont[1] - font[1], end)
        font[2] = cubicEaseOut(start, font[2], toFont[2] - font[2], end)
        font[3] = 1
        const c = JSON.parse(JSON.stringify(state.textStyle))
        c.color = 'rgba(' + font.join(',') + ')'
        layer.setStates({ start, textStyle: c })
      } else if (state.complete === 'error_choose') {
        finish = true
      }

      if (state.complete === 'running' && t[3] > 0) {
        t[3] = parseFloat(t[3]) - 0.01
        t = 'rgba(' + t.join(',') + ')'
        layer.setStates({ progressStyle: t })

        let r = state.rectStyle || colorRgb(getRectColor(state.type, state.disable))
        r = r.replace('rgba(', '').replace(')', '').split(',')
        const start = (1 - t[3]) / 0.01
        const end = 100
        const to = [36, 182, 139]
        r[0] = cubicEaseOut(start, r[0], to[0] - r[0], end)
        r[1] = cubicEaseOut(start, r[1], to[1] - r[1], end)
        r[2] = cubicEaseOut(start, r[2], to[2] - r[2], end)
        r[3] = 1
        layer.setStates({ rectStyle: 'rgba(' + r.join(',') + ')' })
      } else if (state.complete === 'running') {
        finish = true
      }

      if (state.complete === 'running_choose' && t[3] > 0) {
        t[3] = parseFloat(t[3]) - 0.01
        t = 'rgba(' + t.join(',') + ')'
        layer.setStates({ progressStyle: t })
      } else if (state.complete === 'running_choose') {
        finish = true
      }

      if (finish) {
        if (state.complete.indexOf('running') >= 0) {
          layer.addAnimation(animations.loading.name, animations.loading.callback)
          layer.addAnimation(animations.tiktok.name, animations.tiktok.callback, 1000)
        }
        layer.setStates({ type: state.complete, rectStyle: null, progressStyle: null, start: null, complete: null })
        layer.forceRedrawing()
        return false
      }
    }
  },
  tiktok: {
    name: 'tiktok',
    callback: function(state) {
      const layer = this
      if (state.complete) {
        return false
      }
      let s = state.time || '00:00:00'
      s = s.split(':')
      s[2] = parseInt(s[2]) + 1
      if (s[2] >= 60) {
        s[2] = 0
        s[1] = parseInt(s[1]) + 1
      }
      if (s[1] >= 60) {
        s[1] = 0
        s[0] = parseInt(s[0]) + 1
      }
      if (parseInt(s[2]) < 10) {
        s[2] = '0' + parseInt(s[2])
      }
      if (parseInt(s[1]) < 10) {
        s[1] = '0' + parseInt(s[1])
      }
      if (parseInt(s[0]) < 10) {
        s[0] = '0' + parseInt(s[0])
      }
      layer.setStates({ time: s.join(':') })
    },
    time: 1000
  }
}

const connectRedraw = function(layer) {
  const connect = layer.getLayer('connect')
  connect.instance.forceRedrawing()
}

const progress = { path, here, clear, events, animations }

export { progress, HEIGHT_, connectRedraw }
