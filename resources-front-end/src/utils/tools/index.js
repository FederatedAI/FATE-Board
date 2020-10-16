
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

const request = function(func, params) {
  const getImplement = function(obj, impl) {
    let checkKey = obj
    if (checkKey === undefined) {
      return
    } else if (typeof impl === 'string') {
      impl = impl.split('.')
      for (const val of impl) {
        checkKey = checkKey[val]
        if (checkKey === undefined) {
          throw new Error('there has no such varible in this object')
        }
      }
    } else if (impl instanceof Function) {
      checkKey = impl(checkKey)
    } else if (typeof impl === 'object') {
      // object之中包含imple, default, callback
      checkKey = impl.imple ? getImplement(checkKey, impl.imple) : impl.default ? impl.default : ''
      checkKey = impl.callback ? impl.callback.call(null, checkKey, obj) : checkKey
    }
    return checkKey
  }

  const getreflect = function(obj, imple) {
    const item = {}
    try {
      for (const key in imple) {
        item[key] = getImplement(obj, imple[key])
      }
      return item
    } catch (err) {
      throw err
    }
  }

  return async function(imple, key, callback) {
    if (key instanceof Function) {
      callback = key
      key = undefined
    }
    const res = await func.call(this, params)
    let originData = getImplement(res, key)
    if (originData instanceof Object && !(originData instanceof Array)) {
      originData = [originData]
    }
    let final = []
    originData.forEach((val) => {
      final.push(getreflect(val, imple))
    })
    final = final.length > 1 ? final : final[0]
    callback && callback(final)
    final
  }
}

export { request }
