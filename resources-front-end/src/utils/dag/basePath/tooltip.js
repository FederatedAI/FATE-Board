import { rect as Rect } from './rect'
import { text as Text, measureText } from './text'
import { TIMES } from '../const'

const FONT_SIZE = 10 * TIMES
const BACKGROUND = 'rgba(127,125,142, 0.7)'
const TEXT_COLOR = 'rgba(255, 255, 255, 1)'
const ROW_PADDING = 8 * TIMES
const COL_PADDING = 6 * TIMES
const RADIUS = 2 * TIMES

/**
 * static function
 */

function calculateSize(ctx, text, font) {
  const size = measureText(ctx, text, font)
  return { width: size.width + ROW_PADDING, height: size.height + COL_PADDING }
}

/**
 * export function
 */

function path(ctx, state) {
  const layer = this
  const { x, y, text, background = BACKGROUND, position, hidden = false } = state
  let font = state.font
  if (!hidden) return
  font = font || {}
  font.size = font.size || FONT_SIZE
  font.color = font.color || TEXT_COLOR
  font.family = font.family || 'Lato'
  const rectSize = calculateSize(ctx, text, font)
  layer.drawLayer('rect', {
    canvas: layer.canvas,
    state: {
      x,
      y,
      width: rectSize.width,
      height: rectSize.height,
      fill: { fillStyle: background },
      radius: RADIUS
    },
    path: Rect.path
  })

  layer.drawLayer('text', {
    canvas: layer.canvas,
    state: {
      x, y, text, font, position
    },
    path: Text.path
  })
}

function here(state, cx, cy, ctx) {
  const { x, y, text, font } = state
  const { width, height } = calculateSize(ctx, text, font)
  Rect.here({ x, y, width, height }, cx, cy, ctx)
}

function clear(ctx, state) {
  const { x, y, text, font } = state
  const { width, height } = calculateSize(ctx, text, font)
  Rect.here(ctx, { x, y, width, height })
}

const imageData = {
  put: function(ctx, state, imageData) {
    const { x, y, text, font } = state
    const { width, height } = calculateSize(ctx, text, font)
    ctx.putImageData(imageData, x - width / 2, y - height / 2)
  },
  get: function(ctx, state) {
    const { x, y, text, font } = state
    const { width, height } = calculateSize(ctx, text, font)
    return ctx.getImageData(x - width / 2, y - height / 2, x + width / 2, y + height / 2)
  }
}

const tooltip = { path, here, clear, imageData }

export { tooltip, FONT_SIZE, ROW_PADDING, COL_PADDING }
