
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

const ColorExchange = {
  methods: {
    toHEX(color) {
      const reg = /^(rgb|RGB)/
      if (reg.test(color)) {
        let strHex = '#'
        const colorArr = color.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',')
        for (let i = 0; i < colorArr.length; i++) {
          let hex = Number(colorArr[i]).toString(16)
          if (hex === '0') {
            hex += hex
          }
          strHex += hex
        }
        return strHex
      } else {
        return String(color)
      }
    },
    toRGB(col) {
      const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
      let color = col.toLowerCase()
      if (reg.test(color)) {
        if (color.length === 4) {
          let colorNew = '#'
          for (let i = 1; i < 4; i += 1) {
            colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1))
          }
          color = colorNew
        }
        const colorChange = []
        for (let i = 1; i < 7; i += 2) {
          colorChange.push(parseInt('0x' + color.slice(i, i + 2)))
        }
        return 'RGBA(' + colorChange.join(',') + ',1' + ')'
      } else {
        return color
      }
    }
  }
}

export default ColorExchange
