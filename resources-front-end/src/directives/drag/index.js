export default {
  bind: el => {
    el.onmousedown = e => {
      e = e || window.event
      e.preventDefault()
      const disX = e.clientX
      const disY = e.clientY
      let elLeft = Number.parseInt(el.style.left)
      if (isNaN(elLeft)) {
        elLeft = 0
        el.style.left = 0
      }
      let elTop = Number.parseInt(el.style.top)
      if (isNaN(elTop)) {
        elTop = 0
        el.style.top = 0
      }
      document.onmousemove = e => {
        e.preventDefault()
        const left = e.clientX - disX
        const top = e.clientY - disY
        el.style.left = `${elLeft + left}px`
        el.style.top = `${elTop + top}px`
        // console.log(disX, disY, e.clientX, e.clientY)
      }
      document.onmouseup = e => {
        e.preventDefault()
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  },
  update: (el, binding) => {
    if (typeof binding.value !== 'object') {
      return
    } else {
      if (binding.value.left !== binding.oldValue.left || binding.value.top !== binding.oldValue.top || binding.value.original) {
        el.style.left = `${binding.value.left}px`
        el.style.top = `${binding.value.top}px`
      } else {
        return
      }
    }
  }
}
