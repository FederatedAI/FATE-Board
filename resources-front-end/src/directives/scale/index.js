
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
  bind: (el, binding) => {
    if (binding.value === false) {
      return void 0
    }
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
