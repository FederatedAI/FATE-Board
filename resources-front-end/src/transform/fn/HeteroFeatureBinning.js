
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

import handleBinningData from './binningDataHandler'
import { head, isEmpty, each, sortByName } from './uitls'
import { createAsyncComponent, wrapGroupComponent } from './common'

const createFormComponent = (type, name, props, other) => {
  return Object.assign({
    type,
    name,
    props
  }, other)
}

const createAsyncOption = (name, props, method, transform, exportName, detail) => ({
  name,
  props,
  method,
  transform,
  export: exportName,
  detail: detail
})

const createHeader = (prop, label, other) => {
  if (label == null) {
    label = prop
  }
  if (typeof label === 'object' && other == null) {
    other = label
  }
  return Object.assign({ prop, label }, other)
}

const createOption = (label, value) => {
  return {
    label,
    value: value || label
  }
}

function subHost(hostResults, partyIds, index) {
  const checked = []
  const whichOne = {}
  const finalList = []
  for (const val of hostResults) {
    whichOne[val.partyId] = (whichOne[val.partyId] || 0) + 1
    if (whichOne[val.partyId] === index && !checked.some((item) => item === val.partyId)) {
      checked.push(val.partyId)
      finalList.push(val)
      if (checked.length === partyIds.length) {
        break
      }
    }
  }
  return finalList
}

function binningMultClass(responseData, metricsData, partyId, crole) {
  if (responseData.msg.toString().toLowerCase().match('no data')) {
    return []
  }
  const { multiClassResult, header, headerAnonymous } = responseData.data && responseData.data.data
  const { skipStatic } = responseData.data && responseData.data.meta && responseData.data.meta.meta_data
  const result = []
  const selections = []
  const { hostResults, results, labels, binningResult, hostPartyIds } = multiClassResult || (responseData.data && responseData.data.data)
  let hostIndex = 1
  if (labels && labels.length !== 0) {
    for (let i = 0, l = labels.length; i < l; i++) {
      if (hostResults[i] && results[i]) {
        const hostList = subHost(hostResults, hostPartyIds, hostIndex)
        result.push(binningHandler(results[i], hostList, header, headerAnonymous, skipStatic, crole))
        selections.push({
          value: labels[i],
          label: labels[i]
        })
        hostIndex++
      }
    }
  } else {
    result.push(binningHandler((results && results[0]) || binningResult, hostResults, header, headerAnonymous, skipStatic, crole))
  }

  const options = []
  if (result.length === 1) {
    return [wrapGroupComponent(result[0])]
  } else {
    result.map((val, index) => {
      const label = selections[index].value
      options.push(createAsyncOption(
        label,
        val,
        null,
        (rest) => rest,
        '',
        false
      ))
    })
  }
  sortByName(selections, 'label')
  const group = [{
    type: 'form',
    props: {
      form: [createFormComponent(
        'f-select',
        'tagSelection',
        {
          options: selections,
          multiple: false,
          label: 'label index'
        },
        {
          connect: ['labeltext']
        }
      ), createFormComponent(
        'text',
        'labeltext',
        {
          content: 'target label: {t}',
          data: {
            '{t}': (dataParam) => dataParam
          },
          className: 'small-form-text',
          inner: true
        }
      )],
      inrow: 'left'
    }
  }, createAsyncComponent(options, true, {
    deepReport: true
  })]
  return [wrapGroupComponent(group)]
}

function binningHandler(binningResult, hostData, header, headerAnonymous, skipStatic, crole) {
  let data = binningResult
  let guestPartyId = 0
  let role = ''
  const hostPartyId = []
  const hostMiddle = []
  let table
  if (Array.isArray(data)) {
    const first = head(data)
    guestPartyId = first.partyId
    role = first.role
    data = first.binningResult || {}
  } else {
    guestPartyId = data.partyId
    role = data.role
    data = data.binningResult
  }

  if (!isEmpty(data) || !isEmpty(hostData)) {
    const middleData = handleBinningData(data, header, 'guest', guestPartyId, role, role, skipStatic, headerAnonymous)
    const sd = []
    const op = []
    each(header, val => {
      each(middleData.sourceData, sdval => {
        if (val === sdval.variable) {
          sd.push(sdval)
          return false
        }
      })
      each(middleData.options, opval => {
        if (val === opval.value) {
          op.push(opval)
          return false
        }
      })
    })

    middleData.sourceData = sd
    middleData.options = op
    table = middleData
    each(hostData, (val, key) => {
      hostMiddle.push(handleBinningData(val.binningResult, header, 'host', val.partyId, val.role, role, skipStatic))
      hostPartyId.push(val.partyId || key)
    })
  } else {
    return []
  }

  let tableData1
  const tableData2 = {}
  const form1 = [createFormComponent('search')]
  let form2

  const stackBarSetting = Object.assign({}, table.eventOptions)
  const woeDataSetting = Object.assign({}, table.woeOptions)
  const stackBarData = Object.assign({}, table.stackBarData)
  const woeData = Object.assign({}, table.woeData)

  each(table.options, op => {
    each(table.variableData, (data, key) => {
      if (key === op.value) {
        tableData2[op.value] = data
        return false
      }
    })
  })

  if (role === 'guest') {
    if (hostPartyId.length > 0) {
      form1.push(
        createFormComponent(
          'f-select',
          'tableSelection',
          {
            options: [
              createOption('guest'),
              createOption('host', hostPartyId.map(val => ({ label: val, value: val })))
            ],
            multiple: true
          }
        )
      )

      tableData1 = {
        guest: table.sourceData
      }
    } else {
      tableData1 = table.sourceData
    }
    const options4form2 = {
      guest: table.options
    }
    each(hostPartyId, (id, i) => {
      const hm = hostMiddle[i]
      tableData1[id] = hm.sourceData
      options4form2[id] = hm.options
      const variableData = hm.variableData
      each(hm.options, op => {
        each(variableData, (val, key) => {
          if (op.value === key) {
            tableData2[(op.value = op.label)] = val
            stackBarSetting[op.value] = hm.eventOptions[key]
            woeDataSetting[op.value] = hm.woeOptions[key]
            stackBarData[op.value] = hm.stackBarData[key]
            woeData[op.value] = hm.woeData[key]
            return false
          }
        })
      })
    })

    let options = ''
    if (hostPartyId.length > 0) {
      options = [
        createOption('guest', options4form2.guest),
        createOption('host', hostPartyId.map(val => ({ label: val, value: options4form2[val] })))
      ]
    } else {
      options = options4form2.guest
    }
    form2 = [
      // createFormComponent('f-select', 'f-select', { options: options4form2 }),
      createFormComponent(
        'f-select',
        'f-select',
        {
          options: options,
          supportFilter: true
        }
      )
    ]
  } else {
    form2 = [createFormComponent('f-select', 'f-select', {
      options: table.options,
      supportFilter: true
    })]

    tableData1 = table.sourceData
  }

  const header1 = [
    createHeader('', 'index', { type: 'index' }),
    createHeader('variable', 'variable', { sortable: true }),
    createHeader('binning_count', 'binning_count', { sortable: true }),
    createHeader('iv', 'IV', { sortable: true }),
    createHeader('monotonicity', 'monotonicity', { sortable: true })
  ]

  const header2 = [
    createHeader('', 'index', { type: 'index' }),
    createHeader('binning', 'binning', { matching: true }),
    createHeader('iv'),
    createHeader('woe'),
    createHeader('event_count'),
    createHeader('event_ratio'),
    createHeader('non_event_count'),
    createHeader('non_event_ratio')
  ]

  if (crole === 'host') {
    header1.splice(2, 0, createHeader('anonymInGuest', 'anonym in guest'))
    header2.splice(2, 0, createHeader('anonym in guest', 'anonym in guest'))
  }

  if (crole === 'guest') {
    form2.push(createFormComponent('tslider', 'tslider', {
      label: 'woe range',
      range: true,
      step: 0.001,
      outSide: function(value) {
        const items = value.data
        let max, min
        each(items, item => {
          const data = parseFloat(item['woe'])
          if (!min) min = data
          if (!max) max = data
          if (data < min) {
            min = data
          }
          if (data > max) {
            max = data
          }
        })
        this.dataMax = parseFloat(max)
        this.dataMin = parseFloat(min)
      },
      formatRange: function(value) {
        const res = { columnName: 'woe' }
        res.min = value[0]
        res.max = value[1]
        return res
      }
    }))
  }
  const group2 = [
    {
      type: 'form',
      props: {
        form: form2,
        toProperty: 'select',
        inrow: true
      }
    },
    {
      type: 'table',
      props: {
        header: header2,
        data: tableData2,
        zeroFormat: '0',
        export: 'feature_binning_detail',
        toExp: false
      }
    }
  ]

  if (role === 'guest') {
    // let needShowPic = true
    // for (const key in stackBarData) {
    //   const val = stackBarData[key]
    //   if (Object.keys(val) <= 0) {
    //     needShowPic = false
    //   }
    // }
    // if (needShowPic) {
    group2.push({
      type: 'chart',
      name: 'stackBar',
      props: {
        setting: stackBarSetting,
        options: stackBarData,
        export: 'instance_distribution',
        detail: false,
        noDataMissing: true
      }
    })
    // }
    // let needShowWoePic = true
    // for (const key in woeData) {
    //   const val = woeData[key]
    //   if (Object.keys(val) <= 0) {
    //     needShowWoePic = false
    //   }
    // }
    // if (needShowWoePic) {
    group2.push({
      type: 'chart',
      name: 'woe',
      props: {
        setting: woeDataSetting,
        options: woeData,
        export: 'woe',
        detail: false,
        noDataMissing: true
      }
    })
    // }
  }

  const group = [
    [
      {
        type: 'form',
        props: {
          form: form1,
          toProperty: 'tableSelection'
        }
      },
      {
        type: 'table',
        props: {
          header: header1,
          data: tableData1,
          zeroFormat: '0',
          export: 'feature_summary',
          toExp: false
        }
      }
    ],
    group2
  ]

  return group.map(g => {
    return {
      type: 'group',
      props: {
        options: g
      }
    }
  })
}

export default binningMultClass
