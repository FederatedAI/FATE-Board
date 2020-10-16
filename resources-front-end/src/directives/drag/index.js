
/**
 *
 *  Copyright 2019 The FATE Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

export default {
  bind: (el, binding) => {
    if (binding.value === false) {
      return void 0
    }
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
