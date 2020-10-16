
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

const FloatFormat = {
  methods: {
    _length(value) {
      if (typeof value !== 'number') {
        throw new TypeError('Needed A Number')
      }
      const sp = value.toString().split('.')
      return sp.length > 1 ? sp[1].length : 0
    },

    _pow(p, b = 10) {
      return Math.pow(b, p)
    },

    _nearby(val, bet) {
      const blen = this._length(bet)
      const vlen = this._length(val)
      const largeLen = this._pow(blen > vlen ? blen : vlen)
      const distance = (val * largeLen) % (bet * largeLen)
      let res = val * largeLen - distance
      if (distance > (bet * largeLen / 2)) {
        res += (bet * largeLen)
      }
      return res / largeLen
    }
  }
}

export default FloatFormat
