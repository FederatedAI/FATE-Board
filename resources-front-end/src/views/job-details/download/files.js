
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

import { saveAs } from 'file-saver'
import JsZip from 'jszip'
import Json2Csv from '@/utils/Json2Csv'

export class DownloadUtil {
  constructor() {
    this.zip = new JsZip()
    this.folds = new Map()
  }

  addFileInZip(name, content, options, into) {
    const foldcheck = into ? (this.folds.get(into) || this.zip) : this.zip
    foldcheck.file(name, content, options)
  }

  addBolb(name, content, into) {
    const options = { blob: true }
    this.addFileInZip(name, content, options, into)
  }

  addFile(name, content, into) {
    this.addFileInZip(name, content, {}, into)
  }

  addImage(name, content, into) {
    const options = { base64: true }
    this.addFileInZip(name, content, options, into)
  }

  createFold(name, from) {
    const foldCheck = from ? (this.folds.get(from) || this.zip) : this.zip
    const fold = foldCheck.folder(name)
    this.folds.set(name, fold)
  }

  addCSV(name, data, into) {
    const parseUtil = new CSVFile(name)
    this.addFile(name, parseUtil.parseData(data), into)
  }

  addPng(name, data, into) {
    this.addImage(name, data, into)
  }

  save(zipName, type = 'blob') {
    return this.zip.generateAsync({ type }).then(content => {
      saveAs(content, zipName)
    })
  }
}

class BaseFile {
  constructor(name) {
    this.name = name
    this.type = 'application/octet-stream;charset=utf-8'
    this.extension = this.getExtension(name)
  }
  getExtension(name) {
    let index = name.lastIndexOf('.')
    index = index >>> 0
    return name.slice(index)
  }
  input(data) {
    this.data = data
  }
  parseData(data) {
    return data
  }
  getBlob() {
    return new Blob([this.parseData(this.data)], this.type)
  }
  download() {
    saveAs(this.getBlob(), this.name)
  }
}

export class CSVFile extends BaseFile {
  constructor(name) {
    super(name)
    this.type = 'text/csv;charset=utf-8'
  }
  parseData(data) {
    const csv = new Json2Csv()
    return csv.parse(data)
  }
}

export class CSVConut {
  constructor(name, into, toBom) {
    this.file = new Json2Csv()
    this.name = name
    this.toBom = toBom
    this.str = ``
    this.into = into
  }
  add(title, data) {
    const titlePart = this.file.processValue(title)
    const breakLine = this.file.options.eol
    const contentPart = this.file.parse(Array.isArray(data)
      ? data
      : data.data
        ? data.data
        : [],
    data.header || null)
    const newData = `${this.toBom ? '\ufeff' : ''}${this.str}${titlePart}${breakLine}${contentPart}${breakLine}${breakLine}`
    this.str = newData
  }
  getData() {
    return {
      name: this.name,
      data: this.str,
      into: this.into
    }
  }
}

export class PNGFile extends BaseFile {
  constructor(name) {
    super(name)
    this.type = 'image/png;charset=utf-8'
  }
}

function FileFactory({ name, type }) {
  switch (type) {
    case 'csv':
      return new CSVFile(`${name}.${type}`)
    case 'png':
      return new PNGFile(`${name}.${type}`)
  }
}

export function createFileList(list) {
  return list.map(file => {
    return FileFactory(file)
  })
}

const FILE_LIST = {
  HeteroFeatureSelection: {
    guest: [
      {
        type: 'csv',
        name: 'selection_detail'
      }
    ],
    host: [
      {
        type: 'csv',
        name: 'selection_detail'
      },
      {
        type: 'csv',
        name: 'index_mapping'
      }
    ]
  }
}

export function getFileListByType(type, role, transform) {
  let value
  if (type && role) {
    value = FILE_LIST[type] && FILE_LIST[type][role]
  } else if (type) {
    value = FILE_LIST[type]
  }
  if (transform) {
    if (!Array.isArray[transform]) {
      transform = [transform]
    }
    transform.forEach(fn => {
      value = fn(value)
    })
  }
  return value
}
