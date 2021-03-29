
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

const DEF = {
  $curves: ['roc', 'ks', 'lift', 'gain', ['precision', 'recall'], 'accuracy'],
  $loss: ['loss'],
  $stepwise: ['stepwise'],
  $dbi: ['dbi']
}
const result = new Map()

function reset() {
  result.clear()
}

function tabFormat(origin) {
  const exchange = {
    'roc': 'ROC',
    'ks': 'K-S',
    'lift': 'Lift',
    'gain': 'Gain',
    'precision_recall': 'Precision Recall',
    'precision recall': 'Precision Recall',
    'accuracy': 'Accuracy'
  }
  const newWord = exchange[origin.toLowerCase()]
  return newWord || origin
}

function tabSort(list) {
  const sort = ['roc', 'ks', 'lift', 'gain', 'precision_recall', 'precision recall', 'accuracy']
  return list.sort((a, b) => {
    const aIdx = sort.indexOf(a.label.toLowerCase())
    const bIdx = sort.indexOf(b.label.toLowerCase())
    if (aIdx < 0 || bIdx < 0) {
      return 0
    } else if (aIdx > bIdx) {
      return 1
    } else {
      return -1
    }
  })
}

function formatSort(list, getter) {
  const origin = ['train', 'val', 'predict']
  return list.sort((a, b) => {
    const aidx = findIn(getter ? getter(a) : a, origin)
    const bidx = findIn(getter ? getter(b) : b, origin)
    if (aidx >= 0 && bidx >= 0) {
      return aidx > bidx ? 1 : -1
    } else {
      return 0
    }
  })
}

function findIn(attr, list) {
  for (let i = 0, l = list.length; i < l; i++) {
    if (attr.toLowerCase().match(list[i])) {
      return i
    }
  }
  return -1
}

function deepJoin(list, str = '|') {
  if (!Array.isArray(list)) {
    return list
  }
  let res = ''
  list.forEach(item => {
    res = res + ((res ? str : '') +
      (Array.isArray(item)
        ? deepJoin(item, str)
        : item))
  })
  return res
}

function compareWith(val, list) {
  const compare = val.match(new RegExp('(' + deepJoin(list) + ')', 'g'))
  if (compare) {
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      if ((Array.isArray(item) && compareWith(val, item) >= 0) || compare[0] === item) {
        return i
      }
    }
  }
  return -1
}

function getGroupName(type, val, pos) {
  const pick = DEF['$' + type][pos]
  let sp = ''
  if (Array.isArray(pick)) {
    for (const item of pick) {
      sp = val.split('_' + item)
      if (sp.length >= 2) {
        break
      }
    }
  } else {
    sp = val.split('_' + pick)
  }
  return sp[0]
}

function toCurves(type, val, nameSpace, pos) {
  const content = result.get(type) || {
    tabs: [],
    property: {},
    group: []
  }
  let label = DEF['$' + type][pos]
  if (Array.isArray(label)) {
    label = deepJoin(label, '_')
  }
  const groupName = getGroupName(type, val, pos)
  extendsTabSelect(content.tabs, label.replace('_', ' ').toUpperCase(), nameSpace, label + '_' + nameSpace)
  content.property[label + '_' + nameSpace] = extendsMetrics(content.property[label + '_' + nameSpace], nameSpace, val)
  if (content.group.indexOf(groupName) < 0) {
    content.group.push(groupName)
  }
  result.set(type, content)
}

export const explainCurves = (name) => {
  const token = name.split('_')
  const nameSpace = token.splice(token.length - 1)
  const originName = deepJoin(token, '_')
  return {
    nameSpace,
    name: originName
  }
}

function toOthers(type, val, nameSpace) {
  const content = result.get(type) || {
    property: {}
  }
  extendsMetrics(content.property, nameSpace, val)
  result.set(type, content)
}

function toTheType(variable, nameSpace, type = 'others') {
  const pos = type !== 'others' ? compareWith(variable.toString().toLowerCase(), DEF['$' + type]) : 0
  const opera = ['curves', 'loss', 'dbi'].indexOf(type) >= 0 ? 'curves' : 'others'
  if (pos >= 0) {
    if (opera === 'others') {
      toOthers(type, variable, nameSpace, pos)
    } else {
      toCurves(type, variable, nameSpace, pos)
    }
    return true
  }
  return false
}

function splitVariable(variables, nameSpace) {
  for (const val of variables) {
    toTheType(val, nameSpace, 'curves') ||
      toTheType(val, nameSpace, 'loss') ||
      toTheType(val, nameSpace, 'stepwise') ||
      toTheType(val, nameSpace, 'dbi') ||
      toTheType(val, nameSpace)
  }
}

function sortTabs(list) {
  const getPos = (val, list) => {
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      if (val.match(Array.isArray(item) ? deepJoin(item, ' ') : item)) {
        return i
      }
    }
  }
  list.sort((a, b) => {
    const aPos = getPos(a.label, DEF.$curves)
    const bPos = getPos(b.label, DEF.$curves)
    if (aPos >= bPos) {
      return 1
    } else {
      return -1
    }
  })
  return list
}

function extendsTabSelect(origin = [], ...args) {
  const len = args.length
  if (args.length === 0) {
    throw TypeError('There has necessary param do not get')
  }
  let val = origin.find(t => t.label === args[0])
  if (!val) {
    val = {
      label: args[0]
    }
    origin.push(val)
  }
  if (len - 1 <= 0) {
    val.value = args[0]
  } else if (len - 1 === 1) {
    val.value = args[1]
  } else {
    val.children = val.children || []
    extendsTabSelect(val.children, ...args.slice(1))
  }
  return val
}

function extendsMetrics(origin = {}, nameSpace, value) {
  origin[nameSpace] = origin[nameSpace] || []
  origin[nameSpace].push(value)
  return origin
}

function arrangeMetric(metrics) {
  reset()
  for (const nameSpace in metrics) {
    splitVariable(metrics[nameSpace], nameSpace)
  }
  const res = []
  result.forEach((item, key) => {
    const variable = {
      name: key,
      options: item.property
    }
    if (item.tabs) {
      variable.tabs = key === 'curves' ? sortTabs(item.tabs) : item.tabs
    }
    if (item.group) {
      variable.group = item.group
    }
    res.push(variable)
  })
  const cv = res.find(l => l.name === 'curves')
  if (cv) {
    const originTab = tabSort(cv.tabs)
    for (const val of originTab) {
      val.label = tabFormat(val.label)
      if (val.children) {
        val.children = formatSort(val.children, (item) => item.label)
      }
    }
  }
  res.sort((a, b) => {
    if (a.name === 'loss') {
      return -1
    } else if (b.name === 'loss') {
      return 1
    } else if (a.name === 'others') {
      return -1
    } else if (b.name === 'others') {
      return 1
    } else if (a.name === 'curves') {
      return 1
    } else if (b.name === 'curves') {
      return -1
    } else if (a.name === 'stepwise') {
      return 1
    } else if (b.name === 'stepwise') {
      return -1
    } else {
      return 0
    }
  })
  return res
}

export default arrangeMetric
