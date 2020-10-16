
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

const cache = {
  namespace: true,
  state: {
    cache: []
  },
  mutations: {
    setItem(state, val) {
      state.cache.push(val)
    },

    getItem(state, key) {
      state.cache.forEach(data => {
        if (data.key === key) {
          return data.val
        }
      })
    },

    removeItem(state, key) {
      state.cache.map((item, index) => {
        if (item.key === key) {
          state.cache.splice(index, 1)
          return
        }
      })
    },

    clear(state) {
      state.cache = []
    }
  }
}

export default cache
