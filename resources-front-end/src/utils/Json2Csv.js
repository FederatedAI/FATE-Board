
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

const isWin = (navigator.platform === 'Win32') || (navigator.platform === 'Windows')

const DEFAULTS = {
  fields: null,
  defaultValue: ' ',
  quote: '"',
  escapedQuote: '""',
  delimiter: ',',
  escapedDelimiter: '_',
  eol: isWin ? '\r\n' : '\n',
  header: true,
  includeEmptyRows: false
}

function fastJoin(arr, separator) {
  let isFirst = true
  return arr.reduce((acc, item) => {
    if (item == null) {
      item = ''
    }
    if (isFirst) {
      isFirst = false
      return item
    }
    return `${acc}${separator}${item}`
  }, '')
}

function sortBy(origin, order, getPost, compareWith) {
  getPost = getPost || ((a, list) => { return list.indexOf(a) })
  compareWith = compareWith || ((a) => { return a.label })
  return origin.sort((a, b) => {
    const ap = getPost(compareWith(a), order)
    const bp = getPost(compareWith(b), order)
    if (ap < 0 || bp < 0) {
      return 0
    } else if (ap > bp) {
      return 1
    } else {
      return -1
    }
  })
}

function getProp(obj, path, defaultValue) {
  return obj[path] === undefined ? defaultValue : obj[path]
}

export default class Json2Csv {
  constructor(options) {
    this.options = Object.assign({}, DEFAULTS, options)
    if (this.options.fields) {
      this.options.fields = this.preprocessFileds(this.options.fields)
    }
  }
  preprocessFileds(fields) {
    return fields.map(field => {
      if (typeof field === 'string') {
        return {
          label: field,
          value: row => getProp(row, field, this.options.defaultValue)
        }
      }
      if (typeof field === 'object') {
        if (typeof field.value === 'string') {
          return {
            label: field.label,
            value: row => getProp(row, field.value, this.options.defaultValue)
          }
        }
        if (typeof field.value === 'function') {
          return {
            label: field.label,
            value: (row) => {
              const value = field.value(row, field)
              return value == null ? this.options.defaultValue : value
            }
          }
        }
      }
      throw new Error('Invalid fields options')
    })
  }
  getHeader() {
    return fastJoin(
      this.options.fields.map(field => this.processValue(field.label)),
      this.options.delimiter
    )
  }
  processRow(row) {
    if (!row) {
      return
    }
    const processedRow = this.options.fields.map(field => this.processValue(field.value(row)))
    if (this.options.includeEmptyRows && processedRow.every(row => row === undefined)) {
      return undefined
    }

    return fastJoin(processedRow, this.options.delimiter)
  }
  processValue(value) {
    const valueType = typeof value
    if (valueType !== 'number' && valueType !== 'boolean' && valueType !== 'string') {
      value = JSON.stringify(value)
      if (value === undefined) {
        return undefined
      }
      if (value[0] === '"') {
        value.replace(/^"(.+)"$/, '$1')
      }
    }
    if (typeof value === 'string') {
      value = value.replace(new RegExp(this.options.quote, 'g'), this.options.escapedQuote)
      if (value.match(new RegExp(this.options.delimiter, 'g'))) {
        value = `${this.options.quote}${value}${this.options.quote}`
      }
      // value = `${this.options.quote}${value}${this.options.quote}`
      value = `${value + '\t'}`
    }
    return value
  }
  processData(data) {
    return fastJoin(data.map(item => this.processRow(item)).filter(row => row), this.options.eol)
  }
  parse(data, order) {
    const fields = data.reduce((fieldKeys, item) => {
      Object.keys(item).forEach(key => {
        if (!fieldKeys[key]) {
          fieldKeys[key] = true
        }
      })
      return fieldKeys
    }, {})
    this.options.fields = Object.keys(fields)
    this.options.fields = this.preprocessFileds(this.options.fields)
    if (order) this.options.fields = sortBy(this.options.fields, order)

    const header = this.options.header ? this.getHeader() : ''
    const rows = this.processData(data)
    const csv = (header + ((header && rows) ? this.options.eol : '') + rows) || 'no data'
    return csv
  }
}
