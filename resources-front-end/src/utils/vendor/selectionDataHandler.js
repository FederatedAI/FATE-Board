
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

import { formatFloat } from '../index'

export default function(data, partyId, role) {
  if (!data || Object.keys(data).length === 0) {
    return
  }
  const guestHeader = [{
    prop: 'variable',
    label: 'variable',
    noFormat: true
  }]

  const hostHeader = []
  const guestBody = []
  const hostBody = []
  const hostId = []
  const { colNames: guestColNames, hostColNames, results, header } = data
  guestColNames.forEach(variable => {
    guestBody.push({ variable })
  })
  // hostColNames.forEach(variable => {
  //   const middle = []
  //   variable.colNames.forEach(item => {
  //     middle.push({ variable })
  //   })
  //   hostBody.push(middle)
  // })
  hostColNames.forEach(item => {
    const final = []
    const finalHeader = [{ prop: 'anony', label: 'variable' }]
    item.colNames.forEach((variable, index) => {
      if (role === 'host') {
        let anIdx = variable.split('_')
        anIdx = anIdx[2] ? parseFloat(anIdx[2]) : index
        final.push({ variable: header[index], anony: variable, anonyIdx: anIdx })
      } else {
        final.push({ variable, anony: variable, anonyIdx: index })
      }
    })
    hostBody.push(final)
    hostHeader.push(finalHeader)
    hostId.push(item.partyId)
  })

  results.forEach(item => {
    // if (item.filterName.toLowerCase().match('unique_value')) {
    //   return void 0
    // }
    const featureValues = item.featureValues
    const hostFeatureValues = item.hostFeatureValues
    const filterName = item.filterName.toLowerCase()
    const leftCols = item.leftCols.leftCols
    const hostLeftCols = item.hostLeftCols
    guestHeader.push({
      prop: filterName,
      label: filterName,
      sortable: true
    })
    guestColNames.forEach(variable => {
      const index = guestBody.findIndex(guestItem => variable === guestItem.variable)
      if (index >= 0) {
        guestBody[index][filterName] = featureValues[variable] === undefined ? '-' : formatFloat(featureValues[variable])
      }
      if (!leftCols[variable]) {
        guestBody[index][filterName + '_disable'] = true
      }
      for (let i = 0; i < data.header.length; i++) {
        if (data.header[i] === variable) {
          let anony = 'host_' + partyId + '_' + i
          let anonyIdx = i
          if (hostBody.length > 0) {
            for (const val of hostBody) {
              const item = val.find(l => l.variable === variable)
              if (item) {
                anony = item.anony
                anonyIdx = item.anonyIdx
                break
              }
            }
          }
          guestBody[index].binding = anony
          guestBody[index]._anony_index = anonyIdx
          break
        }
      }
    })

    if (hostFeatureValues && hostFeatureValues.length > 0) {
      for (let i = 0; i < hostFeatureValues.length; i++) {
        if (hostFeatureValues[i].featureValues) {
          hostHeader[i].push({ prop: filterName, label: filterName, sortable: true })
          const mid = hostBody[i]
          const fe = hostFeatureValues[i].featureValues
          for (const val of mid) {
            val[filterName] = fe[val.variable] === undefined ? '-' : formatFloat(fe[val.variable])
          }
        }
      }

      for (let i = 0; i < hostLeftCols.length; i++) {
        if (hostLeftCols[i].leftCols) {
          const mid = hostBody[i]
          mid.forEach(item => {
            item[filterName + '_disable'] = !hostLeftCols[i].leftCols[item.variable]
          })
        }
      }
    }
  })
  return { guestHeader, hostHeader, guestBody, hostBody, hostId }
}
