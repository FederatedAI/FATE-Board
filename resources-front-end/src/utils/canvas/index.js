import { warn, error } from '@/utils/tools/dev'

class canvas {
  constructor(options) {
    // width and height for canvas
    this.$width = options.width || 100
    this.$height = options.height || 100

    // canvas instance
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : typeof options.el === 'object' ? options.el : ''

    this._init()
  }

  // initing canvas options
  _init() {
    if (!this.$el && process.env.NODE_ENV !== 'production') {
      warn(' Could not find canvas-instance')
    } else if (this.$el.getContext) {
      this.$canvas = this.$el.getContext('2d')
      this.$canvas.lineCap = 'round'
      this.$canvas.lineJoin = 'round'
      if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(callback) {
            return window.setTimeout(callback, 1000 / 60)
          })
      }
    } else {
      error(' Could not get context of canvas ')
    }
  }

  // {x, y, width, height, radius, style, stroke, corner:[tl,tr,bl,br]}
  drawArcRect(options) {
    const ctx = this.$canvas
    const radius = options.radius || 5
    const x = options.x + radius
    const y = options.y
    const w = options.width
    const h = options.height
    const tl = 'tl'.indexOf(options.corner.join('')) > 0
    const tr = 'tr'.indexOf(options.corner.join('')) > 0
    const bl = 'bl'.indexOf(options.corner.join('')) > 0
    const br = 'br'.indexOf(options.corner.join('')) > 0

    ctx.beginPath()
    ctx.moveTo(x, y)
    if (tr) {
      ctx.lineTo(x + w - radius, y)
    } else {
      ctx.lineTo(x + w - 2 * radius, y)
      ctx.arc(x + w - 2 * radius, y + radius, radius, Math.PI / 180 * 270, 0, false)
    }
    if (br) {
      ctx.lineTo(x + w - radius, y + h)
    } else {
      ctx.lineTo(x + w - radius, y + h - 2 * radius)
      ctx.arc(x + w - 2 * radius, y + h - 2 * radius, radius, 0, Math.PI / 180 * 90, false)
    }
    if (bl) {
      ctx.lineTo(x - radius, y + h)
    } else {
      ctx.lineTo(x, y + h)
      ctx.arc(x, y + h - radius, radius, Math.PI / 180 * 90, Math.PI / 180 * 180, false)
    }
    if (tl) {
      ctx.lineTo(x - radius, y)
      ctx.lineTo(x, y)
    } else {
      ctx.lineTo(x - radius, y + h - radius)
      ctx.arc(x, y + radius, radius, Math.PI / 180 * 180, Math.PI / 180 * 270, false)
    }

    if (!options.stroke) {
      ctx.fillStyle = options.style
      ctx.fill()
    } else {
      ctx.lineWidth = options.strokeWidth || 2
      ctx.strokeStyle = options.style
      ctx.stroke()
    }
  }

  // Drawing fill react options: {x, y, width, height, radius, style, stroke} x and y is the center of picture
  drawFullArcRect(options) {
    this.drawArcRect({ ...options, corner: ['tl', 'tr', 'bl', 'br'] })
  }

  // Draw fill progress, options: {x, y, width, height, radius, style}
  drawProgressRect(options) {
    this.drawArcRect({ ...options, corner: ['tl', 'bl'] })
  }

  // Draw fill text , options: {x, y, text, style}
  drawText(options) {
    const ctx = this.$canvas
    ctx.fillStyle = options.style
    ctx.textAlign = 'center'
    ctx.fillText(options.text, options.x, options.y)
  }

  // Draw Arrow line , options: {x, y, tx, ty, style}
  drawArrowLine(options) {
    const ctx = this.$canvas

    ctx.strokeStyle = options.style
    ctx.beginPath()
    ctx.moveTo(options.x, options.y)
    ctx.lineTo(options.tx, options.ty)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(options.tx, options.ty)
    ctx.lineTo(options.tx, options.ty - 3)
    ctx.lineTo(options.tx - 3, options.ty)
    ctx.fillStyle = options.color
    ctx.fill()
  }

  // Draw circle width blackground, options: {x, y, radius, fillStyle, strokeStyle, strokeWidth}
  drawCircle(options) {
    const ctx = this.$canvas
    options.radius = options.radius || 2
    const { x, y, radius, fillStyle, strokeStyle, strokeWidth } = options
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = fillStyle || ''
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
    ctx.strokeWidth = strokeWidth || 2
    ctx.strokeStyle = strokeStyle || ''
    ctx.stroke()
  }

  // {x, y, tx, ty, header, bottom, circleFillStyle, circleStrokeStyle, arrowStyle}
  drawCircleArrowLine(options) {
    // const ctx = this.$canvas
    // const { x, y, tx, ty } = options
  }

  // Draw Error Icon , options: {x, y, radius, stroke, style, strokeWidth, fillStyle}
  drawErrorIcon(options) {
    const ctx = this.$canvas
    const x = options.x
    const y = options.y
    const r = options.radius

    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI, false)
    if (!options.stroke) {
      ctx.fillStyle = options.fillStyle
      ctx.fill()
      ctx.beginPath()
    }

    ctx.moveTo(x - r / 2, y - r / 2)
    ctx.lineTo(x + r / 2, y + r / 2)

    ctx.moveTo(x - r / 2, y + r / 2)
    ctx.lineTo(x + r / 2, y - r / 2)

    ctx.strokeStyle = options.style
    ctx.strokeWidth = options.strokeWidth
    ctx.stroke()
  }

  animation(callback) {
    window.requestAnimationFrame(callback)
  }
}

export default canvas
