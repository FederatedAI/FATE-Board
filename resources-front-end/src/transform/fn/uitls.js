
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

export function wrap(func) {
  return function(data) {
    if (isEmpty(data.responseData)) {
      return null
    }
    return func(data)
  }
}

const isArray = Array.isArray

function baseEach(fromRight) {
  return function(collection, iteratee) {
    let length
    let index
    let keys
    let isNum
    let isObj
    if (typeof collection === 'number') {
      length = collection
      isNum = true
    } else {
      if (!isArray(collection)) {
        Object(collection)
        keys = Object.keys(collection)
        isObj = true
      }
      length = collection.length != null ? collection.length : keys.length
    }

    index = fromRight ? length : -1
    while (fromRight ? index-- : ++index < length) {
      const key = isObj ? keys[index] : index
      const value = !isNum ? isObj ? collection[key] : collection[key] : index
      if (iteratee(value, key) === false) {
        break
      }
    }
  }
}

export const each = baseEach(false)
export const eachRight = baseEach(true)

export function head(arr) {
  return (arr && arr.length) ? arr[0] : undefined
}

export function isEmpty(value) {
  if (value == null) {
    return true
  }
  if (isArray(value) || typeof value === 'string') {
    return !value.length
  }
  for (const key in value) {
    if (value.hasOwnProperty(key)) {
      return false
    }
  }
  return true
}

export function makeArray(length, fill) {
  return Array.from({ length: length }, fill)
}

export function freezeObj(obj) {
  each(obj, (val, key) => {
    if (val && typeof val === 'object') {
      obj[key] = freezeObj(val)
    }
  })
  return Object.freeze(obj)
}

export function getProp(obj, propName) {
  const rePropName = /[^.[\]]+|(\[(d+)\])/g
  const paths = []
  propName.replace(rePropName, (match, number, quote, subString) => {
    paths.push(match)
  })
  let index = 0
  const len = paths.length
  while (obj != null && index < len) {
    obj = obj[paths[index++]]
  }
  return (index && index === len) ? obj : undefined
}

export function groupBy(collection, prop) {
  const result = new Map()
  each(collection, col => {
    const p = getProp(col, prop)
    if (!result.has(p)) {
      result.set(p, [])
    }
    result.get(p).push(col)
  })
  return [...result]
}

export function upperFirst(str) {
  const first = str.slice(0, 1).toUpperCase()
  return first + str.slice(1).toLowerCase()
}

export const createHeader = (prop, label, other) => {
  if (label == null) {
    label = prop
  }
  if (typeof label === 'object' && other == null) {
    other = label
  }
  return Object.assign({ prop, label }, other)
}

export const flattenToTable = (collection, fn) => {
  const table = []
  let index = 0
  each(collection, (item, ind) => {
    each(item, (subitem, i) => {
      table.push(fn(subitem, i, item, ind, index++))
    })
  })
  return table
}

export const objToPairs = (obj, key = 'key', value = 'value') => {
  const result = []
  each(obj, (v, k) => {
    result.push({
      [key]: k,
      [value]: v
    })
  })
  return result
}

export const ascending = (a, b) => {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN
}

export const descending = (a, b) => {
  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN
}

function splitStrAndNum(str) {
  const arr = []
  str.replace(/\D|\d+/g, function(match) {
    const val = +match
    arr.push(isNaN(val) ? match : val)
  })
  return arr
}

export const sortByName = (arr, prop, isAscending = true) => {
  const result = new Map()
  arr.forEach(item => {
    let value
    if (typeof prop === 'string') {
      value = getProp(item, prop)
    } else if (typeof prop === 'function') {
      value = prop(item)
    } else {
      value = item
    }
    result.set(item, splitStrAndNum(value))
  })
  const func = isAscending ? ascending : descending
  arr.sort((a, b) => {
    a = result.get(a)
    b = result.get(b)
    const len = Math.min(a.length, b.length)
    for (let index = 0; index < len; index++) {
      const _a = a[index]
      const _b = b[index]
      const result = func(_a, _b)
      if (result !== 0) {
        return result
      }
    }
    return func(a.length, b.length)
  })
}
