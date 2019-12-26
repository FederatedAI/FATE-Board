export function createGradient(ctx, sn, en, colors) {
  const gradient = ctx.createLinearGradient(sn.x, sn.y, en.x, en.y)
  for (const val of colors) {
    gradient.addColorStop(val.pos, val.color)
  }
  return gradient
}
