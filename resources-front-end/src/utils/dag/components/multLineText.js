import { measureText } from '../basePath/text'
import { TIMES } from '../const'
import { Text } from '../basePath'
import { tooltip as Tooltip, ROW_PADDING } from '../basePath/tooltip'

const BETWEEN_TWO_LINE = 2 * TIMES
const CONT_FAMILY = 'lato'
const BOUNDERY = 4

const dismissText = function(ctx, width, text, font) {
  const compareW = measureText(ctx, text.toString(), { size: font }).width
  if (compareW < width - BOUNDERY) {
    return text
  } else {
    const len = Math.floor(text.length * Math.floor(width / compareW * 100) / 100)
    const finalPost = function(leng) {
      const s = text.substring(0, leng)
      const cw = measureText(ctx, s.toString(), { size: font }).width
      if (cw >= width) {
        return finalPost(leng - 1)
      } else {
        return s
      }
    }
    return finalPost(len)
  }
}

const path = function(ctx, state) {
  const layer = this
  // startPos: start, middle, end
  const { pos, width, height, font, text, color, startPos = 'start', limitLine, show = false } = state
  const eachlineHeight = measureText(ctx, text.toString(), { size: font }).height
  const maxLine = Math.floor(height / eachlineHeight) > limitLine ? limitLine : Math.floor(height / eachlineHeight)
  let changeText = text
  const padding = 12 * TIMES
  for (let i = 0; i < maxLine; i++) {
    if (changeText.length === 0) {
      break
    }
    const linePos = {}
    if (startPos === 'start') {
      linePos.x = pos.x
      linePos.y = pos.y + (i * (eachlineHeight + BETWEEN_TWO_LINE))
    } else if (startPos === 'middle') {
      linePos.x = pos.x
      linePos.y = pos.y + ((i - Math.floor(maxLine / 2)) * (eachlineHeight + BETWEEN_TWO_LINE))
    } else {
      linePos.x = pos.x
      linePos.y = pos.y + ((i - maxLine) * (eachlineHeight + BETWEEN_TWO_LINE))
    }
    let currentContent = dismissText(ctx, width, changeText, font)
    changeText = changeText.replace(currentContent, '')
    if (i === maxLine - 1 && changeText.length > 0) {
      currentContent = currentContent.split().splice(0, currentContent.length - 3)
      currentContent.push('...')
      currentContent = currentContent.join()
      const tipPadding = measureText(ctx, dismissText(ctx, width, changeText, font), { family: 'Lato', size: font }).width
      layer.drawLayer('data_out', {
        canvas: layer.canvas,
        state: {
          x: pos.x + padding + (tipPadding + ROW_PADDING) / 2,
          y: pos.y + padding,
          text,
          hidden: show,
          font: { size: font, family: CONT_FAMILY }
        },
        path: Tooltip.path,
        delay: true
      })
    }
    layer.drawLayer('lineText' + (i + 1), {
      canvas: layer.canvas,
      state: {
        x: linePos.x,
        y: linePos.y,
        text: currentContent,
        font: { color: color, size: font, family: CONT_FAMILY }
      },
      path: Text.path
    })
  }
}

const here = function(state, cx, cy, ctx) {
  const { width, height, pos } = state
  if (cx >= pos.x - width / 2 && cx <= pos.x + width / 2) {
    if (cy >= pos.y - height / 2 && cy <= pos.y + height / 2) {
      return true
    }
  }
  return false
}

const events = [
  {
    type: 'mousemove',
    callback: function(meta, check, pos, state) {
      const layer = this
      if (check) {
        layer.setStates({ show: true, padding: (12 * TIMES) })
      } else {
        layer.setStates({ show: false })
      }
    }
  }
]

const relationship = { path, here, events }

export default relationship
