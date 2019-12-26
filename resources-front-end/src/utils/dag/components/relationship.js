import { Rect, Text } from '../basePath'
import { TIMES } from '@/utils/dag/const.js'
import { measureText } from '../basePath/text'
import MultText from './multLineText'

const times = TIMES * 1.5

const textToTable = 0.5 * times
const HINT_COLOR = '#000000'
const FONT_SIZE = 15 * times
const RECT_PADDING = 4 * times

const CONT_COLOR = '#000000'
const CONT_FAMILY = 'lato'
const MAX_FONT_LENGTH = 10

const getLongest = function(ctx, row, content, maxWidth) {
  const final = { size: 0, xtoTable: 0, yToTable: 0 }
  let longest = ''
  let rowLongest = ''
  for (const val of row) {
    if (longest.toString().length < val.toString().length) {
      longest = val
      rowLongest = val
    }
  }
  for (const item of content[0]) {
    if (item.text.toString().length > longest.toString().length) {
      longest = item.text
    }
  }
  if (longest.length > MAX_FONT_LENGTH) {
    longest = longest.substr(0, 10)
  }
  const getFontSize = function(fontsize) {
    final.actualWidth = parseFloat((measureText(ctx, longest.toString(), { size: fontsize }).width).toFixed(8))
    if (final.actualWidth < maxWidth - RECT_PADDING) {
      return fontsize
    } else {
      return getFontSize(fontsize - 0.5)
    }
  }
  final.size = getFontSize(FONT_SIZE)
  final.xtoTable = final.size * (rowLongest.toString().length > MAX_FONT_LENGTH ? MAX_FONT_LENGTH : rowLongest.toString().length) / 2 + textToTable
  final.ytoTable = final.size * (rowLongest.toString().length > MAX_FONT_LENGTH ? MAX_FONT_LENGTH : rowLongest.toString().length) / 2 + textToTable
  return final
}

// state : {x, y, showingText, width,table:{row:[], col:[], content: [[{text, color}]]}}
const path = function(ctx, state) {
  const layer = this
  const { x, y, width, table, showingText } = state
  const startX = x - (table.row.length - 1) / 2 * width
  const startY = y - (table.col.length - 1) / 2 * width
  const sizes = getLongest(ctx, table.row, table.content, width)
  for (let i = 0; i < table.row.length; i++) {
    layer.drawLayer('rowText' + i, {
      canvas: layer.canvas,
      state: {
        pos: { x: startX - width / 2 - sizes.xtoTable, y: startY + i * width },
        width: width - RECT_PADDING / 2,
        height: width - RECT_PADDING / 2,
        text: table.row[i],
        font: sizes.size,
        color: HINT_COLOR,
        startPos: 'middle',
        limitLine: 3
      },
      path: MultText.path,
      here: MultText.here,
      events: MultText.events
    })
  }
  for (let i = 0; i < table.col.length; i++) {
    layer.drawLayer('colText' + i, {
      canvas: layer.canvas,
      state: {
        pos: { x: startX + i * width, y: startY + (table.row.length - 0.5) * width + sizes.ytoTable },
        width: width - RECT_PADDING / 2,
        height: width - RECT_PADDING / 2,
        text: table.col[i],
        font: sizes.size,
        color: HINT_COLOR,
        startPos: 'middle',
        limitLine: 3
      },
      path: MultText.path,
      here: MultText.here,
      events: MultText.events
    })
  }
  for (let i = 0; i < table.content.length; i++) {
    const list = table.content[i]
    for (let j = 0; j < list.length; j++) {
      layer.drawLayer('block', {
        canvas: layer.canvas,
        state: {
          x: startX + i * width,
          y: startY + j * width,
          width,
          height: width,
          fill: { fillStyle: list[j].color },
          radius: 0
        },
        path: Rect.path
      })
      if (showingText) {
        layer.drawLayer('blockContent', {
          canvas: layer.canvas,
          state: {
            x: startX + i * width,
            y: startY + j * width,
            text: table.content[i][j].text,
            font: { color: CONT_COLOR, size: sizes.size, family: CONT_FAMILY }
          },
          path: Text.path
        })
      }
    }
  }
}

const clear = function(ctx, state) {
  const layer = this
  ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
}

const calculateWidth = function(row, width, height) {
  if (width > height) {
    return height / (row + 2)
  } else {
    return width / (row + 2)
  }
}

const relationship = { path, clear, calculateWidth }

export { relationship }
