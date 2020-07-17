const setScale = (el, binding) => {
  const changeEl = el.children[0]
  const val = binding.value
  if (val.whole) {
    changeEl.style.transform = `scale(${val.x})`
  } else {
    const now = parseFloat(changeEl.style.transform.replace('scale(', ''))
    changeEl.style.transform = `scale(${now + val.x})`
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
    const changeEl = el.children[0]
    const exchange = e => {
      e = e || window.event
      if (e.stopPropagation) {
        e.stopPropagation()
      } else {
        e.cancelBubble()
      }
      if (e.preventDefault) {
        e.preventDefault()
      } else {
        e.returnValue = false
      }
      scaleFunction(changeEl, e.deltaY)
    }
    if (window && /Firefox/i.test(window.navigator.userAgent)) {
      el.addEventListener('DOMMouseScroll', exchange)
    } else {
      el.addEventListener('mousewheel', exchange)
    }
  },
  update: setScale
}
