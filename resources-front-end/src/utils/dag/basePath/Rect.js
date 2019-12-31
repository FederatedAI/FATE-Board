import { TIMES } from '../const'

const ANGLE = true
const RADIUS = 4 * TIMES

const path = function(
  ctx,
  {
    x,
    y,
    width,
    height,
    radius = RADIUS,
    all = ANGLE,
    topLeft,
    topRight,
    bottomLeft,
    bottomRight
  }
) {
  if (height <= RADIUS * 2) {
    radius = height / 2
  }
  const checkW = function() {
    if (width < radius * 2) {
      radius -= 1
      checkW()
    }
  }
  checkW()
  x = x + radius - width / 2
  y = y - height / 2

  ctx.beginPath()
  ctx.moveTo(x, y)
  if (all || topRight) {
    ctx.lineTo(x + width - 2 * radius, y)
    ctx.arc(
      x + width - 2 * radius,
      y + radius,
      radius,
      (Math.PI / 180) * 270,
      0,
      false
    )
  } else {
    ctx.lineTo(x + width - radius, y)
  }
  if (all || bottomRight) {
    ctx.lineTo(x + width - radius, y + height - radius)
    ctx.arc(
      x + width - 2 * radius,
      y + height - radius,
      radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 90,
      false
    )
  } else {
    ctx.lineTo(x + width - radius, y + height)
  }
  if (all || bottomLeft) {
    ctx.lineTo(x, y + height)
    ctx.arc(
      x,
      y + height - radius,
      radius,
      (Math.PI / 180) * 90,
      (Math.PI / 180) * 180,
      false
    )
  } else {
    ctx.lineTo(x - radius, y + height)
  }
  if (all || topLeft) {
    ctx.lineTo(x - radius, y + radius)
    ctx.arc(
      x,
      y + radius,
      radius,
      (Math.PI / 180) * 180,
      (Math.PI / 180) * 270,
      false
    )
    ctx.lineTo(x, y)
  } else {
    ctx.lineTo(x - radius, y)
    ctx.lineTo(x, y)
  }
  return true
}

const here = function(state, px, py, ctx) {
  const { x, y, width, height } = state
  if (
    px >= x - width / 2 &&
    px <= x + width * 2 &&
    py >= y - height / 2 &&
    py <= y + height / 2
  ) {
    return true
  } else {
    return false
  }
}

const clear = function(ctx, state) {
  const { x, y, width, height } = state
  ctx.clearRect(x - width / 2 - 1, y - height / 2 - 1, x + width / 2 + 1, y + height / 2 + 1)
}

const imageData = {
  put: function(ctx, state, imageData) {
    const { x, y, width, height } = state
    ctx.putImageData(imageData, x - width / 2 - 1, y - height / 2 - 1)
  },
  get: function(ctx, state) {
    const { x, y, width, height } = state
    ctx.getImageData(x - width / 2 - 1, y - height / 2 - 1, x + width / 2 + 1, y + height / 2 + 1)
  }
}

const rect = { path, here, clear, imageData }

export { rect }
