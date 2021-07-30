
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
import store from '../store'
import router from '../router'

// import Vue from 'vue'

function combine(origin, entity) {
  return `${origin};entity=${new Date().getTime() + entity}`
}

export function setLocal(key, value, entity) {
  localStorage.setItem(key, combine(value, entity))
}

export function removeLocal(key) {
  localStorage.removeItem(key)
}

export function getLocal(key) {
  let mid = localStorage.getItem(key)
  mid = mid ? mid.split(';entity=') : [mid]
  if (!mid[1] || (mid[1] && new Date().getTime() <= parseFloat(mid[1]))) {
    return mid[0]
  } else {
    removeLocal(key)
    return null
  }
}

// const vue = new Vue()
window.addEventListener('storage', function() {
  const user = localStorage.getItem('CurrentUser') // 用户信息
  if (user) {
    store.dispatch('setInfo', user.split(';entity=')[0])
    router.push({
      name: 'RUNNING'
    })
  } else {
    store.dispatch('removeInfo')
    router.push({
      name: 'login'
    })
  }
})
