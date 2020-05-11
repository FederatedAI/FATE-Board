export default {
  bind: el => {
    const changeEl = el.children[0]
    el.onmousedown = e => {
      e = e || window.event
      e.preventDefault()
      const disX = e.clientX
      const disY = e.clientY
      let elLeft = Number.parseInt(changeEl.style.left)
      if (isNaN(elLeft)) {
        elLeft = 0
        changeEl.style.left = 0
      }
      let elTop = Number.parseInt(changeEl.style.top)
      if (isNaN(elTop)) {
        elTop = 0
        changeEl.style.top = 0
      }
      document.onmousemove = e => {
        e.preventDefault()
        const left = e.clientX - disX
        const top = e.clientY - disY
        changeEl.style.left = `${elLeft + left}px`
        changeEl.style.top = `${elTop + top}px`
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
    const changeEl = el.children[0]
    if (typeof binding.value !== 'object') {
      return
    } else {
      if (binding.value.left !== binding.oldValue.left || binding.value.top !== binding.oldValue.top || binding.value.original) {
        changeEl.style.left = `${binding.value.left}px`
        changeEl.style.top = `${binding.value.top}px`
      } else {
        return
      }
    }
  }
}
