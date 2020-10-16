
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

import handleSelectionData from '@/utils/vendor/selectionDataHandler'
import { createFormComponent, createOption } from './common.js'

const filterObjArray = (target, key, host) => {
  const countObj = {}
  let result = {}
  result = target.reduce((item, next) => {
    countObj[next[key]] ? null : countObj[next[key]] = true && item.push(next)
    return item
  }, [])
  if (host) {
    result.unshift(result.pop())
  }
  return result
}

const disabledHeader = (header, common) => {
  const result = []
  const headerProps = []
  header.forEach(item => {
    headerProps.push(item.prop)
  })
  common.forEach(item => {
    if (headerProps.indexOf(item.prop) < 0) {
      result.push(item.prop)
    }
  })
  return result
}

const getFormSettingByRole = (role, hostId) => {
  const formSetting = []
  if (role === 'guest') {
    formSetting.push(createFormComponent('search'))
    if (hostId.length > 0) {
      formSetting.push(createFormComponent(
        'f-select',
        'f-selection',
        {
          options: [
            createOption('guest'),
            createOption('host', hostId.length > 0 ? hostId.map(val => ({ label: val, value: val })) : 'host')
          ],
          multiple: false
        }
      ))
    }
  } else if (role === 'host') {
    formSetting.push(createFormComponent('search'))
  }
  return formSetting
}

const getTableHeaderSettingByRole = (role, hostId, guest, host) => {
  const header = {}
  if (role === 'guest') {
    let commonHeader = [guest, host[0] || []]
    commonHeader = commonHeader.reduce(function(a, b) {
      return a.concat(b)
    })
    header['header'] = [{ type: 'index', label: 'index' }].concat(filterObjArray(commonHeader, 'prop', host[0]))
    header['disable'] = { guest: disabledHeader(guest, commonHeader) }
    hostId.forEach((id, index) => {
      header.disable[id] = disabledHeader(host[index], commonHeader)
    })
  } else if (role === 'host') {
    guest.splice(1, 0, {
      prop: 'binding',
      label: 'anonym in guest'
    })
    header['header'] = ([{ type: 'index', label: 'index' }].concat(guest))
  }
  return header
}

const getTableDataSettingByRole = (role, hostId, guest, host) => {
  let data = {}
  if (role === 'guest') {
    if (Array.isArray(hostId) && hostId.length > 0) {
      data['guest'] = guest
      hostId.forEach((id, index) => {
        data[id] = host[index]
      })
    } else {
      data = guest
    }
  } else if (role === 'host') {
    data = guest
  }
  return data
}

const fn = (modelData, metricsData, partyId, role) => {
  const results = modelData.data.data && modelData.data.data.results
  // let hostId = []
  if (results) {
    const { guestBody, guestHeader, hostBody, hostHeader, hostId } = handleSelectionData(modelData.data.data, partyId, role)
    // hostId = (hostHeader && Object.keys(hostHeader)) || []
    return [{
      component: () => import('@/components/ComponentGroup'),
      options: [{
        type: 'form',
        props: {
          form: getFormSettingByRole(role, hostId)
        }
      },
      {
        type: 'table',
        props: {
          header: getTableHeaderSettingByRole(role, hostId, guestHeader, hostHeader),
          data: getTableDataSettingByRole(role, hostId, guestBody, hostBody),
          pageSize: -1,
          export: 'selection_detail'
        }
      }]
    }]
  } else {
    return []
  }
}

export default fn
