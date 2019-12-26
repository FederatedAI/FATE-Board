const setScale = (el, binding) => {
  const val = binding.value
  if (val.whole) {
    el.style.transform = `scale(${val.x})`
  } else {
    const now = parseFloat(el.style.transform.replace('scale(', ''))
    el.style.transform = `scale(${now + val.x})`
  }
}

const scaleFunction = function(el, deltaY) {
  let scaleStr = el.style.transform
  if (!scaleStr) {
    scaleStr = 'scale(1)'
    el.style.transform = 'scale(1)'
  }
  let scaleNum = scaleStr.replace(/[a-z\(\)]+/g, '')
  if (deltaY < 0) {
    // if (scaleNum <= 4) {
    scaleNum *= 1 + 0.05
    // }
  } else {
    // if (scaleNum >= 0.25) {
    scaleNum *= 1 - 0.05
    // }
  }
  el.style.transform = `scale(${scaleNum})`
}

export default {
  bind: el => {
    el.onmousewheel = e => {
      e = e || window.event
      if (e.stopPropagation) {
        e.stopPropagation()
      } else {
        e.cancelBubble
      }
      if (e.preventDefault) {
        e.preventDefault()
      } else {
        e.returnValue = false
      }
      scaleFunction(el, e.deltaY)
    }
  },
  update: setScale
}
