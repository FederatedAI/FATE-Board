
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

import { createHeader } from '../fn/common.js'

const getHeaders = (stratified, hetero, role) => {
  if (stratified && ((hetero && role === 'guest') || !hetero)) {
    return [
      { type: 'index', label: 'index' },
      createHeader('layer'),
      createHeader('original count', 'original'),
      createHeader('train count', 'train'),
      createHeader('validate count', 'validate'),
      createHeader('test count', 'test')]
  } else {
    return [
      { type: 'index', label: 'index' },
      createHeader('dataset'),
      createHeader('count'),
      createHeader('ratio')
    ]
  }
}

const fn = (response, params) => {
  const hetero = params.model_type.toLowerCase().indexOf('homo') < 0
  const { data_split_count_info: count_info, data_split_label_info: label_info, data_split_ratio_info: ratio_info, stratified } = response.data_split.meta
  const tableData = []
  const total = { _total: true }
  const tableHeader = getHeaders(stratified, hetero, params.role)
  if (stratified && ((hetero && params.role === 'guest') || !hetero)) {
    if (label_info.continuous_label) {
      for (let i = 0; i < label_info.split_points.length + 1; i++) {
        const point = label_info.split_points[i]
        let layer = ''
        const dataItem = {}
        if (i === 0) {
          layer = '(-∞,' + point + ']'
        } else if (i === label_info.split_points.length) {
          layer = '(' + label_info.split_points[i - 1] + ',+∞)'
        } else {
          layer = '(' + label_info.split_points[i - 1] + ',' + point + ']'
        }
        tableHeader.forEach(h => {
          if (h.type === 'index') {
            return
          }
          if (h.prop === 'layer') {
            dataItem[h.prop] = layer
            if (i === 0) {
              total[h.prop] = 'Total'
            }
          } else {
            dataItem[h.prop] = label_info[h.prop][i]
            if (i === 0) {
              if (h.prop !== 'original') {
                total[h.prop] = count_info[h.prop] + '(' + (ratio_info[h.prop] * 100).toFixed(4) + '%)'
              } else {
                total[h.prop] = count_info[h.prop]
              }
            }
          }
        })
        tableData.push(dataItem)
      }
    } else {
      label_info.label_names.forEach((name, index) => {
        const dataItem = {}
        tableHeader.forEach(h => {
          if (h.type === 'index') {
            return
          }
          if (h.prop === 'layer') {
            dataItem[h.prop] = name
            if (index === 0) {
              total[h.prop] = 'Total'
            }
          } else {
            dataItem[h.prop] = label_info[h.prop][name]
            if (index === 0) {
              if (h.prop !== 'original') {
                total[h.prop] = count_info[h.prop] + '(' + (ratio_info[h.prop] * 100).toFixed(4) + '%)'
              } else {
                total[h.prop] = count_info[h.prop]
              }
            }
          }
        })
        tableData.push(dataItem)
      })
    }
  } else {
    const dataSetKeys = ['train', 'validate', 'test']
    dataSetKeys.forEach(key => {
      const dataItem = {}
      dataItem['dataset'] = key
      dataItem['count'] = count_info[key]
      dataItem['ratio'] = (ratio_info[key] * 100).toFixed(4) + '%'
      tableData.push(dataItem)
    })
    total['dataset'] = 'Total'
    total['count'] = count_info.original
    total['ratio'] = '100%'
  }
  tableData.push(total)
  return [{
    type: 'table',
    props: {
      data: tableData,
      header: tableHeader,
      zeroFormat: '0'
    }
  }]
}

export default fn
