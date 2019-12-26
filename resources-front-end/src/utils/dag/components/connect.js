import { tooltip as Tooltip, FONT_SIZE, ROW_PADDING } from '../basePath/tooltip'
import { measureText } from '../basePath/text'
import { TIMES } from '../const'

const LINEWIDTH = 3.6 * TIMES
const LINECAP = 'round'
const DATASTYLE = '#E6B258'
const MODELSTYLE = '#00cbff'
const DISABLESTYLECANINIT = '#BBBBC8'
const DISABLESTYLECANNOTINIT = '#7F7D8E'

function path(ctx, state) {
  const layer = this
  const { x, y, width, height, model, output, noDataOutput, tips, show = false, disable, type } = state
  const padding = state.padding || 12 * TIMES
  let { pos } = state
  const distance = width > (150 * TIMES) ? (10 * TIMES) : width * 0.06
  ctx.lineWidth = LINEWIDTH
  ctx.lineCap = LINECAP
  const left = x - width / 4
  const right = x + width / 4
  const top = y - height / 2
  const bottom = y + height / 2
  const save = { data: {}, model: {}}
  let text = ''
  let tipPadding = 0
  pos = pos || {}
  if (model) {
    ctx.beginPath()
    ctx.moveTo(left - distance / 2, top)
    ctx.lineTo(left + distance / 2, top)
    if (!noDataOutput) {
      ctx.moveTo(left - distance / 2, bottom)
      ctx.lineTo(left + distance / 2, bottom)
    }
    ctx.strokeStyle = disable ? (type.indexOf('unrun') < 0 ? DISABLESTYLECANINIT : DISABLESTYLECANNOTINIT) : DATASTYLE
    ctx.stroke()
    save.data.in = { x: left, y: top }
    if (!noDataOutput) {
      save.data.out = { x: left, y: bottom }
    }
    text = tips || 'data inputs'
    tipPadding = measureText(ctx, text, { family: 'Lato', size: FONT_SIZE }).width
    layer.drawLayer('data_in', {
      canvas: layer.canvas,
      state: {
        x: pos.x ? pos.x + padding + (tipPadding + ROW_PADDING) / 2 : left + padding + (tipPadding + ROW_PADDING) / 2,
        y: pos.y ? pos.y + padding : top + padding,
        text,
        hidden: show === 'data_in'
      },
      path: Tooltip.path,
      delay: true
    })
    if (!noDataOutput) {
      text = tips || 'data outputs'
      tipPadding = measureText(ctx, text, { family: 'Lato', size: FONT_SIZE }).width
      layer.drawLayer('data_out', {
        canvas: layer.canvas,
        state: {
          x: pos.x ? pos.x + padding + (tipPadding + ROW_PADDING) / 2 : left + padding + (tipPadding + ROW_PADDING) / 2,
          y: pos.y ? pos.y + padding : bottom + padding,
          text,
          hidden: show === 'data_out'
        },
        path: Tooltip.path,
        delay: true
      })
    }

    ctx.beginPath()
    ctx.moveTo(right - distance / 2, top)
    ctx.lineTo(right + distance / 2, top)
    if (!noDataOutput) {
      ctx.moveTo(right - distance / 2, bottom)
      ctx.lineTo(right + distance / 2, bottom)
    } else {
      ctx.moveTo(x - distance / 2, bottom)
      ctx.lineTo(x + distance / 2, bottom)
    }
    ctx.strokeStyle = disable ? (type.indexOf('unrun') < 0 ? DISABLESTYLECANINIT : DISABLESTYLECANNOTINIT) : MODELSTYLE
    ctx.stroke()
    save.model.in = { x: right, y: top }
    if (!noDataOutput) {
      save.model.out = { x: right, y: bottom }
    } else {
      save.model.out = { x: x, y: bottom }
    }
    text = tips || 'model inputs'
    tipPadding = measureText(ctx, text, { family: 'Lato', size: FONT_SIZE }).width
    layer.drawLayer('model_in', {
      canvas: layer.canvas,
      state: {
        x: pos.x ? pos.x + padding + (tipPadding + ROW_PADDING) / 2 : right + padding + (tipPadding + ROW_PADDING) / 2,
        y: pos.y ? pos.y + padding : top + padding,
        text,
        hidden: show === 'model_in'
      },
      path: Tooltip.path,
      delay: true
    })
    text = tips || 'model outputs'
    tipPadding = measureText(ctx, text, { family: 'Lato', size: FONT_SIZE }).width
    if (!noDataOutput) {
      layer.drawLayer('model_out', {
        canvas: layer.canvas,
        state: {
          x: pos.x ? pos.x + padding + (tipPadding + ROW_PADDING) / 2 : right + padding + (tipPadding + ROW_PADDING) / 2,
          y: pos.y ? pos.y + padding : bottom + padding,
          text,
          hidden: show === 'model_out'
        },
        path: Tooltip.path,
        delay: true
      })
    } else {
      layer.drawLayer('model_out', {
        canvas: layer.canvas,
        state: {
          x: pos.x ? pos.x + padding + (tipPadding + ROW_PADDING) / 2 : x + padding + (tipPadding + ROW_PADDING) / 2,
          y: pos.y ? pos.y + padding : bottom + padding,
          text,
          hidden: show === 'model_out'
        },
        path: Tooltip.path,
        delay: true
      })
    }
  } else {
    ctx.beginPath()
    ctx.moveTo(x - distance / 2, top)
    ctx.lineTo(x + distance / 2, top)
    if (output) {
      ctx.moveTo(x - distance / 2, bottom)
      ctx.lineTo(x + distance / 2, bottom)
    }
    ctx.strokeStyle = disable ? (type.indexOf('unrun') < 0 ? DISABLESTYLECANINIT : DISABLESTYLECANNOTINIT) : DATASTYLE
    ctx.stroke()
    save.data.in = { x, y: top }
    save.data.out = { x, y: bottom }
    text = tips || 'data inputs'
    tipPadding = measureText(ctx, text, { family: 'Lato', size: FONT_SIZE }).width
    layer.drawLayer('data_in', {
      canvas: layer.canvas,
      state: {
        x: pos.x ? pos.x + padding + (tipPadding + ROW_PADDING) / 2 : x + padding + (tipPadding + ROW_PADDING) / 2,
        y: pos.y ? pos.y + padding : top + padding,
        text,
        hidden: show === 'data_in'
      },
      path: Tooltip.path,
      delay: true
    })
    if (output) {
      text = tips || 'data outputs'
      tipPadding = measureText(ctx, text, { family: 'Lato', size: FONT_SIZE }).width
      layer.drawLayer('data_out', {
        canvas: layer.canvas,
        state: {
          x: pos.x ? pos.x + padding + (tipPadding + ROW_PADDING) / 2 : x + padding + (tipPadding + ROW_PADDING) / 2,
          y: pos.y ? pos.y + padding : bottom + padding,
          text,
          hidden: show === 'data_out'
        },
        path: Tooltip.path,
        delay: true
      })
    }
  }
  this.setMeta('connect', save)

  // draw tooltip
}

function here(state, cx, cy, ctx) {
  const layer = this
  const width = state.width
  const distance = width > (150 * TIMES) ? (10 * TIMES) : width * 0.06
  const connect = layer.getMeta('connect')
  const check = function({ x, y }) {
    if (!x || !y) return false
    if (cx >= x - distance &&
      cx <= x + distance &&
      cy >= y - LINEWIDTH / 2 &&
      cy <= y + LINEWIDTH / 2) {
      return true
    }
    return false
  }
  if (connect.data.in && check(connect.data.in)) {
    return 'data_in'
  } else if (connect.data.out && check(connect.data.out)) {
    return 'data_out'
  } else if (connect.model.in && check(connect.model.in)) {
    return 'model_in'
  } else if (connect.model.out && check(connect.model.out)) {
    return 'model_out'
  } else {
    return false
  }
}

const events = [
  {
    type: 'mousemove',
    callback: function(meta, check, pos, state) {
      const layer = this
      if (check) {
        layer.setStates({ show: check, padding: (12 * TIMES), pos })
      } else {
        layer.setStates({ show: false })
      }
    }
  }
]

const connect = { path, here, events }

export { connect, LINEWIDTH }
