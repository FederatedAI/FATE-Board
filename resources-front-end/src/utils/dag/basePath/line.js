import { TIMES } from '../const'

const LINEWIDTH = 1 * TIMES
const LINECAP = 'round'
const COLOR = '#bbbbc8'

// line: {lineWidth, lineCap}
const path = function(ctx, { ps, pt, pm, line, color }) {
  line = line || {}
  ctx.lineWidth = line.lineWidth || LINEWIDTH
  ctx.lineCap = line.lineCap || LINECAP
  if (!pm || pm.length === 0) {
    ctx.beginPath()
    ctx.moveTo(ps.x, ps.y)
    ctx.lineTo(pt.tx, pt.ty)
  } else {
    ctx.beginPath()
    let start = ps
    let end = ps
    let mid = null
    for (let i = 0; i < pm.length; i++) {
      start = end
      mid = pm[i]
      if (pm[i + 1]) {
        end = { x: (pm[i].x + pm[i + 1].x) / 2, y: (pm[i].y + pm[i + 1].y) / 2 }
      } else {
        end = pt
      }
      ctx.moveTo(start.x, start.y)
      ctx.quadraticCurveTo(mid.x, mid.y, end.x, end.y)
    }
  }
  ctx.strokeStyle = color || COLOR
  ctx.stroke()
}

const line = { path }

export { line }
