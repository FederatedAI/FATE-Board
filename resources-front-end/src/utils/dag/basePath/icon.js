// arr: [name, url]
function initImage(arr, callback) {
  return new Promise(function(resolve, reject) {
    const complete = { length: 0 }
    for (const val of arr) {
      (function() {
        const v = val
        const img = new Image()
        img.onload = function() {
          complete[v.name] = img
          complete.length += 1
          if (complete.length === arr.length) {
            callback(complete)
            resolve(complete)
          }
        }
        img.src = v.url
      })()
    }
  })
}

function path(ctx, state) {
  const { x, y, width, height, image } = state
  ctx.drawImage(image, x - width / 2, y - height / 2, width, height)
}

function here(state, px, py, ctx) {
  const { x, y, width, height } = state
  if (px >= x - width / 2 &&
    px <= x + width / 2 &&
    py >= y - height / 2 &&
    py <= y + height / 2) {
    return true
  } else {
    return false
  }
}

function clear(ctx, state) {
  const { x, y, width, height } = state
  ctx.clearRect(x - width / 2, y - height / 2, x + width / 2, y + height / 2)
}

const imageData = {
  put: function(ctx, state, imageData) {
    const { x, y, width, height } = state
    ctx.putImageData(imageData, x - width / 2, y - height / 2)
  },
  get: function(ctx, state) {
    const { x, y, width, height } = state
    return ctx.getImageData(x - width / 2, y - height / 2, x + width / 2, y + height / 2)
  }
}

const icon = { path, here, clear, imageData }

export { icon, initImage }
