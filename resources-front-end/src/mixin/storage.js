
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

/**
 * Storage for page check (session storage)
 */

const storageMixin = {
  methods: {
    setCache(key, val) {
      this.necessaryParam(key, val)
      sessionStorage.setItem(key, JSON.stringify(val))
    },

    getCache(key) {
      this.necessaryParam(key)
      return JSON.parse(sessionStorage.getItem(key))
    },

    setLongCache(key, val) {
      this.necessaryParam(key, val)
      localStorage.setItem(key, JSON.stringify(val))
    },

    getLongCache(key) {
      this.necessaryParam(key)
      return JSON.parse(localStorage.getItem(key))
    }
  }
}

export default storageMixin
