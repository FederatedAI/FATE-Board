import { TIMES } from '../const'

const RADIUS = 5 * TIMES

const path = function(ctx, { x, y, radius = RADIUS, startArc, endArc, sequence }) {
  ctx.beginPath()
  ctx.arc(x, y, radius, startArc, endArc, sequence)
  return true
}

const here = function(state, px, py, ctx) {
  const { x, y, radius = RADIUS } = state
  let isHere = true
  if (!(px >= x - radius - 1 && px <= x + radius + 1)) {
    isHere = false
  }
  if (!(py >= y - radius - 1 && py <= y + radius + 1)) {
    isHere = false
  }
  return isHere
}

const clear = function(ctx, state) {
  const { x, y, radius = RADIUS } = state
  ctx.clearRect(x - radius - 1, y - radius - 1, x + radius + 1, y + radius + 1)
}

const imageData = {
  put: function(ctx, state, imageData) {
    const { x, y, radius = RADIUS } = state
    ctx.putImageData(imageData, x - radius - 1, y - radius - 1)
  },
  get: function(ctx, state) {
    const { x, y, radius = RADIUS } = state
    ctx.getImageData(x - radius - 1, y - radius - 1, x + radius + 1, y + radius + 1)
  }
}

const arc = { path, here, clear, imageData }

export { arc }
