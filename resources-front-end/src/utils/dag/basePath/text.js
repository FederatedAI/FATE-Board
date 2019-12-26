import { TIMES } from '../const'

const FONT_COLOR = '#7f7d8e'
const FONT_SIZE = 18 * TIMES
const FONT_FAMILY = 'Arial'
const TEXTALIGN = 'center'
const TEXTBASELINE = 'middle'

function setFont(ctx, font, position) {
  ctx.textAlign = (position && position.textAlign) || TEXTALIGN
  ctx.textBaseline = (position && position.textBaseline) || TEXTBASELINE
  ctx.font = (font && font.weight ? font.weight : '') + ' ' + ((font && font.size) || FONT_SIZE) + 'px ' + ((font && font.family) || FONT_FAMILY)
  ctx.fillStyle = (font && font.color) || FONT_COLOR
}

// calculate text size
function measureText(ctx, text, font) {
  setFont(ctx, font)
  return { width: ctx.measureText(text).width, height: font.size || FONT_SIZE }
}

// state: {x, y, font: {size, family, color}, position: {textAlign, textBaseline}}
const path = function(ctx, state) {
  const { x, y, text, font, position } = state
  setFont(ctx, font, position)
  ctx.fillText(text, x, y)
}

// here is for center position
const here = function(state, px, py, ctx) {
  const { x, y, text, font } = state
  const size = measureText(ctx, text, font)
  let isHere = true
  if (!(px >= x - size.width / 2 && px <= x + size.width / 2)) {
    isHere = false
  }
  if (!(py >= y - size.height / 2 && py <= y + size.height / 2)) {
    isHere = false
  }
  return isHere
}

// here is just for center position
const clear = function(ctx, state) {
  const { x, y, font, text } = state
  const size = measureText(ctx, text, font)
  ctx.clearRect(x - size.width / 2, y - size.height / 2, x + size.width / 2, y + size.height / 2)
}

const text = { path, here, clear }

export { text, measureText }
