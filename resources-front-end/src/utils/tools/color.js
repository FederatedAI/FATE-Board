
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

export function colorHex(color) {
  const that = color
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  if (/^(rgb|RGB)/.test(that)) {
    const aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',')
    let strHex = '#'
    for (let i = 0; i < aColor.length; i++) {
      let hex = Number(aColor[i]).toString(16)
      if (hex.length < 2) {
        hex = '0' + hex
      }
      strHex += hex
    }
    if (strHex.length !== 7) {
      strHex = that
    }
    return strHex
  } else if (reg.test(that)) {
    const aNum = that.replace(/#/, '').split('')
    if (aNum.length === 6) {
      return that
    } else if (aNum.length === 3) {
      let numHex = '#'
      for (let i = 0; i < aNum.length; i += 1) {
        numHex += (aNum[i] + aNum[i])
      }
      return numHex
    }
  }
  return that
}

export function colorRgb(color) {
  let sColor = color.toLowerCase()
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = '#'
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
      }
      sColor = sColorNew
    }
    const sColorChange = []
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
    }
    return 'rgba(' + sColorChange.join(',') + ')'
  }
  return sColor
}
