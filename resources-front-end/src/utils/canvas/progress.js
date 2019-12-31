import canvas from './index'

class Progress extends canvas {
  constructor(options) {
    super()
    this.x = options.x
    this.y = options.y
    this.width = options.width
    this.height = options.height
    this.text = options.text
    this.strokeWidth = options.strokeWidth
    this.strokeStyle = options.strokeStyle
    this.fillStyle = options.fillStyle
  }

  // draw Progress , options {x, y, width, height, text, textStyle, progress, strokeStyle, fillStyle, strokeWidth, radius}
  drawProgress(options) {
    const { x, y, width, height, progress, text, radius } = options
    this.drawFillProgress({ x, y, width, height, radius, progress, style: options.fillStyle })
    this.drawFillArcRect({ x, y, width, height, radius, stroke: true, strokeWidth: options.strokeWidth, style: options.strokeStyle })
    this.drawFillText({ x, y, text, style: options.textStyle })
  }
}

export default Progress
