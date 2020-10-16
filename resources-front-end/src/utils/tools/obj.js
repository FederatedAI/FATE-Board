
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

const clone = function(obj) {
  let nOp = {}
  if (obj instanceof Array) {
    nOp = []
    for (const val of obj) {
      nOp.push(val)
    }
  } else if (obj instanceof Object) {
    for (const key in obj) {
      nOp[key] = obj[key]
    }
  } else {
    nOp = obj
  }
  return nOp
}

const deepClone = function(obj) {
  if (typeof obj !== 'object') { // ( obj  instanceof Object || obj  instanceof Array )
    return obj
  }
  const newobj = {}
  for (const attr in obj) {
    newobj[attr] = clone(obj[attr])
  }
  return newobj
}

const combine = function(obj, ...o) {
  let final = {}
  if (o.length > 0) {
    if (!obj) obj = {}
    final = obj
    for (const val of o) {
      if (val instanceof Object) {
        const c = clone(val)
        final = Object.assign(final, c)
      }
    }
  } else if (obj) {
    final = obj
  }
  return final
}

const deepCombine = function(obj, ...o) {
  let final = {}
  if (o.length > 0) {
    if (!obj) obj = {}
    final = obj
    for (const val of o) {
      if (val instanceof Object) {
        const c = clone(val)
        for (const k in c) {
          if (c[k] instanceof Object) {
            if (obj[k] instanceof Object) {
              obj[k] = deepCombine(obj[k], c[k])
            } else {
              if (obj[k]) c[k][k] = obj[k]
              obj[k] = c[k]
            }
          } else {
            if (obj[k] instanceof Object) {
              obj[k][k] = c[k]
            } else {
              obj[k] = c[k]
            }
          }
        }
      }
    }
  } else if (obj) {
    final = obj
  }
  return final
}

const getClassName = function(obj) {
  if (obj && obj.constructor && obj.constructor.toString()) {
    /*
     * for browsers which have name property in the constructor
     * of the object,such as chrome
     */
    if (obj.constructor.name) {
      return obj.constructor.name
    }
    const str = obj.constructor.toString()
    /*
     * executed if the return of object.constructor.toString() is
     * "[object objectClass]"
     */
    let arr = ''
    if (str.charAt(0) === '[') {
      arr = str.match(/\[\w+\s*(\w+)\]/)
    } else {
      /*
       * executed if the return of object.constructor.toString() is
       * "function objectClass () {}"
       * for IE Firefox
       */
      arr = str.match(/function\s*(\w+)/)
    }
    if (arr && arr.length === 2) {
      return arr[1]
    }
  }
  return undefined
}

export { clone, deepClone, combine, getClassName, deepCombine }
