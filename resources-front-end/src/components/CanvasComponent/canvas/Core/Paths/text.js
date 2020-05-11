/**
 * state: {
 *  point: {x, y}, // 绘制位置
 *  text: String, // 展示内容
 *
 *  width: Number, // 可以不传递
 *  height: Number, // 最大高度               |  breakLine: Number, // 最大行数
 *
 *  betweenEachLine: Number, // 两行之间的间距
 *  angle: Number, // 弧度制角度， 旋转角度（0-2PI）
 *  position: ENUM:[] // 通过对象传递的参数内容
 *  style: Object,
 * }
 */

import COMMON from './common'
import Layer from '../Basic'

const textComp = {
  drawText(obj, parent, name) {
    obj.canvas = parent ? parent.$canvas : obj.canvas
    obj.path = path
    if (parent) {
      if (!name) {
        name = Layer.getUUID('text')
      }
      parent.drawLayer(name, obj)
      return name
    } else {
      return new Layer(obj)
    }
  },
  LEFT: COMMON.LEFT,
  RIGHT: COMMON.RIGHT,
  CENTER: COMMON.CENTER
}

// function inCanvas() {
//   const lay = this
//   const canvas = lay.$canvas
//   const width = canvas.width
//   const height = canvas.height
//   const cp = lay.$meta.get('$translate')
//   const textInfo = measureText(lay.$ctx, lay.text, lay.style, lay.angle)
//   const fontSize = parseFloat(lay.style.font)
//   const xw = textInfo.xlength + fontSize * 2
//   const yw = textInfo.tlength + fontSize * 2
//   let p = {}
//   if (lay.position === textComp.RIGHT) {
//     p = { x: ''}
//   }
// }

function path() {
  const lay = this
  const style = JSON.parse(JSON.stringify(lay.style))
  style.textBaseline = COMMON.TEXTBASELINE
  style.textAlign = 'left'
  if (lay.position === textComp.RIGHT) {
    style.textAlign = 'right'
  } else if (lay.position === textComp.CENTER) {
    style.textAlign = 'center'
  }
  lay.style = style
  text.call(this)
}

export function text() {
  const lay = this
  lay.text = lay.text.toString()
  const ctx = lay.$ctx
  const textInfo = measureText(ctx, lay.text, lay.style)
  const lineWidth = lay.width || Math.ceil(textInfo.width)
  const lineHeight = parseInt(lay.style.font)
  const breakLine = lay.breakLine
    ? (lay.height
      ? (Math.floor(lay.height / (lineHeight + lay.betweenEachLine)) > lay.breakLine
        ? lay.breakLine
        : Math.floor(lay.height / (lineHeight + lay.betweenEachLine)))
      : lay.breakLine)
    : 1
  const finalLine = (lay.width && Math.ceil(parseInt(textInfo.width) / lay.width) < breakLine)
    ? Math.ceil(parseInt(textInfo.width) / lay.width)
    : breakLine
  const overFlow = finalLine * lineWidth < parseInt(textInfo.width)
  const x = lay.point.x || lay.point[0] || 0
  const y = lay.point.y || lay.point[1] || 0
  const lines = []
  let pos = 0
  for (let i = 0; i < finalLine; i++) {
    let lengthCheck = Math.floor(lay.text.length * (lineWidth * breakLine) / parseInt(textInfo.width))
    while (parseFloat(measureText(ctx, lay.text.substr(pos, lengthCheck), lay.style).width) > lineWidth) {
      lengthCheck--
    }
    lines.push(lay.text.substr(pos, lengthCheck))
    pos += lengthCheck
  }
  if (overFlow) {
    const middle = lines[lines.length - 1].split('')
    middle.splice(-3, 3, '...')
    lines[lines.length - 1] = middle.join('')
  }
  ctx.save()
  for (const key in lay.style) {
    ctx[key] = lay.style[key]
  }
  if (lay.angle) Layer.rotate(ctx, lay.point, lay.angle)
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineHeight + (lines.length > 1 ? lay.betweenEachLine : 0))
  }
  ctx.restore()
}

export function measureText(ctx, text, style, angle = 0) {
  const final = {}
  ctx.save()
  for (const key in style) {
    ctx[key] = style[key]
  }
  const stylus = ctx.measureText(text)
  final.width = stylus.width
  final.ylength = Math.cos(angle) !== 0 ? final.width * Math.cos(angle) : 0
  final.xlength = Math.sin(angle) !== 0 ? final.width * Math.cos(angle) : final.width
  ctx.restore()
  return final
}

export default textComp
