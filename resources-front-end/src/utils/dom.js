
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

const ieVersion = Number(document.documentMode)
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g
const MOZ_HACK_REGEXP = /^moz([A-Z])/
const camelCase = name => {
  return name.replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter
  }).replace(MOZ_HACK_REGEXP, 'Moz$1')
}

export const getStyle =
  ieVersion < 9
    ? function(element, styleName) {
      if (!element || !styleName) return null
      styleName = camelCase(styleName)
      if (styleName === 'float') {
        styleName = 'styleFloat'
      }
      try {
        switch (styleName) {
          case 'opacity':
            try {
              return element.filters.item('alpha').opacity / 100
            } catch (e) {
              return 1.0
            }
          default:
            return element.style[styleName] || element.currentStyle
              ? element.currentStyle[styleName]
              : null
        }
      } catch (e) {
        return element.style[styleName]
      }
    }
    : function(element, styleName) {
      if (!element || !styleName) return null
      styleName = camelCase(styleName)
      if (styleName === 'float') {
        styleName = 'cssFloat'
      }
      try {
        var computed = document.defaultView.getComputedStyle(element, '')
        return element.style[styleName] || computed
          ? computed[styleName]
          : null
      } catch (e) {
        return element.style[styleName]
      }
    }

export function setStyle(element, styleName, value) {
  if (!element || !styleName) return

  if (typeof styleName === 'object') {
    for (var prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        setStyle(element, prop, styleName[prop])
      }
    }
  } else {
    styleName = camelCase(styleName)
    if (styleName === 'opacity' && ieVersion < 9) {
      element.style.filter = isNaN(value)
        ? ''
        : 'alpha(opacity=' + value * 100 + ')'
    } else {
      element.style[styleName] = value
    }
  }
}
