
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

export default function stepwiseDataHandler(originDataList, data, meta, role, partyId) {
  const output = {}
  const tables = []
  const summary = originDataList.summary
  const common = originDataList.common || []
  const guest_f_a = meta.guest_features_anonym
  const host_f_a = meta.host_features_anonym
  // basic info for step
  output.name = meta.name
  output.intercept = formatFloat(meta.intercept)
  output.enter = []
  output.remove = []
  output.numberIn = meta.number_in
  output.def = formatFloat(meta.def)
  output.tables = tables
  output.icval = formatFloat(meta.current_ic_val)
  output.commonTableContent = []

  const steps = originDataList.steps
  const currentStepNum = meta.name.match(/[0-9]+/)[0]
  if (steps.length > 0) {
    for (let i = 0; i < steps.length; i++) {
      const checkSteps = steps[i].name.match(/[0-9]+/)[0]
      if (parseFloat(currentStepNum) < parseFloat(checkSteps)) {
        steps.splice(i, 0, output)
        break
      }
      if ((i + 1) >= steps.length) {
        steps.push(output)
        break
      }
    }
  } else {
    steps.push(output)
  }

  // basic output Info
  const features = new Map()
  for (let i = 0; i < meta.guest_mask.length; i++) {
    const name = (role === 'guest') ? meta.all_features[i] : guest_f_a[i]
    features.set(name, {
      arbiter: (role === 'guest') ? guest_f_a[i] : '-',
      role: 'guest',
      entered: meta.guest_mask[i],
      weight: meta.weight ? (formatFloat(meta.weight[name]) || '') : ''
    })
  }
  for (let j = 0; j < meta.host_mask.length; j++) {
    const name = (role === 'host') ? meta.all_features[j] : host_f_a[j]
    features.set(name, {
      arbiter: (role === 'host') ? host_f_a[j] : '-',
      role: 'host',
      entered: meta.host_mask[j],
      weight: meta.weight ? (formatFloat(meta.weight[name]) || '') : ''
    })
  }
  output.features = features

  // common table body
  if (steps.length > 1) {
    for (let i = 0; i < steps.length; i++) {
      const enteredF = []
      const removedF = []
      if (steps[i + 1]) {
        const listNext = steps[i + 1]
        const listNow = steps[i].features
        for (const val of listNext.features) {
          if (!listNow.get(val[0]).entered && val[1].entered) {
            enteredF.push(val[0])
          }
          if (listNow.get(val[0]).entered && !val[1].entered) {
            removedF.push(val[0])
          }
        }
        const tableContent = []
        for (const val of enteredF) {
          tableContent.push({
            step: listNext.name.match(/[0-9]+/)[0],
            effect: val,
            anonymInArbiter: listNext.features.get(val).arbiter,
            df: '-',
            role: listNext.features.get(val).role,
            change: 'entered',
            a_b_ic: listNext.icval,
            estimate: listNext.features.get(val).weight || '-'
          })
        }
        for (const val of removedF) {
          tableContent.push({
            step: listNext.name.match(/[0-9]+/)[0],
            effect: val,
            anonymInArbiter: listNext.features.get(val).arbiter,
            df: '-',
            role: listNext.features.get(val).role,
            change: 'removed',
            a_b_ic: listNext.icval,
            estimate: listNext.features.get(val).weight || '-'
          })
        }
        steps[i + 1].commonTableContent.splice(0)
        steps[i + 1].commonTableContent.push(...tableContent)
        steps[i + 1].enter = enteredF
        steps[i + 1].remove = removedF
      }
    }
  }

  // model fitting statistics
  if (!role.toLowerCase().match('host')) {
    const tableName = 'Model Fitting Statistics'
    const theader = [{
      label: (role.toLowerCase().match('guest') ? 'Intercept Only' : meta.score_name.toUpperCase()),
      prop: 'intercept_only'
    }, {
      label: 'Intercept and Covariates',
      prop: 'i_a_c'
    }]
    const tbody = [{
      'intercept_only': role.toLowerCase().match('guest')
        ? (meta.fit_intercept
          ? (meta.direction === 'forward' ? (formatFloat(meta.loss) || '-') : '-')
          : '-')
        : (formatFloat(meta.current_ic_val) || '-'),
      'i_a_c': role.toLowerCase().match('guest') ? '-' : (formatFloat(meta.loss) || '-')
    }]
    tables.push({
      tableName, theader, tbody
    })
    if (role.toLowerCase().match('guest') && meta.name.toLowerCase().match('stepwise_0')) {
      summary.tables.splice(1, 0, {
        tableName, theader, tbody: [{
          'intercept_only': meta.fit_intercept
            ? (meta.direction === 'forward' ? formatFloat(meta.loss) || '-' : '-')
            : '-',
          'i_a_c': '-'
        }]
      })
    }
    if (role.toLowerCase().match('arbiter')) {
      const summaryHeader = JSON.parse(JSON.stringify(theader))
      summaryHeader[0].label = meta.score_name.toUpperCase()
      const stepNum = originDataList.steps.length > 0 ? originDataList.steps[originDataList.steps.length - 1].name.match(/[0-9]+/)[0] : -1
      const currentStep = meta.name.match(/[0-9]+/)[0] || 0
      if (parseFloat(currentStep) >= parseFloat(stepNum)) {
        if (summary.tables.length > 0) {
          for (const val of summary.tables) {
            if (val.tableName === tableName) {
              val.tbody[0].intercept_only = formatFloat(meta.current_ic_val) || '-'
              val.tbody[0].i_a_c = formatFloat(meta.loss) || '-'
            }
          }
        } else {
          summary.tables.splice(1, 0, {
            tableName, theader: summaryHeader, tbody: [{
              'intercept_only': formatFloat(meta.current_ic_val) || '-',
              'i_a_c': formatFloat(meta.loss) || '-'
            }]
          })
        }
      }
    }
  }

  // Analysis of Effects
  if (!role.toLowerCase().match('host')) {
    const tableName = 'Analysis of Effects'
    const theader = role.toLowerCase().match('guest')
      ? [
        {
          label: 'Effect',
          prop: 'effect'
        },
        {
          label: 'Anonym in ' + (role.toLowerCase().match('host') ? 'guest & ' : 'host & ') + 'arbiter',
          prop: 'anonymInArbiter'
        },
        {
          label: 'Entered or Removed',
          prop: 'change'
        },
        {
          label: 'DF',
          prop: 'df'
        }
      ]
      : [{
        label: 'Effect',
        prop: 'effect'
      },
      {
        label: 'Entered or Removed',
        prop: 'change'
      },
      {
        label: 'DF',
        prop: 'df'
      },
      {
        label: meta.score_name.toUpperCase(),
        prop: 'a_b_ic'
      }]
    const tbody = output.commonTableContent
    tables.push({
      tableName, theader, tbody
    })
  }

  if (!role.toLowerCase().match('arbiter')) {
    const tableName = 'Analysis of Maximum Likelihood Estimates'
    const theader = [
      {
        label: 'Parameter',
        prop: 'effect'
      },
      {
        label: 'Anonym in ' + (role.toLowerCase().match('host') ? 'guest & ' : 'host & ') + 'arbiter',
        prop: 'anonymInArbiter'
      },
      {
        label: 'DF',
        prop: 'df'
      },
      {
        label: 'Estimate',
        prop: 'estimate'
      }
    ]
    const tbody = output.commonTableContent
    tables.push({
      tableName, theader, tbody
    })
  }

  if (!role.toLowerCase().match('arbiter')) {
    const tableName = 'Analysis of Effect Eligible for Entry'
    const theader = [
      {
        label: 'Effect',
        prop: 'effect'
      },
      {
        label: 'Anonym in ' + (role.toLowerCase().match('host') ? 'guest & ' : 'host & ') + 'arbiter',
        prop: 'anonymInArbiter'
      },
      {
        label: 'DF',
        prop: 'df'
      }
    ]
    const tbody = []
    for (const val of output.features) {
      if (!val[1].entered) {
        tbody.push({
          effect: val[0],
          anonymInArbiter: val[1].arbiter,
          role: val[1].role,
          df: '-'
        })
      }
    }
    tables.push({
      tableName, theader, tbody
    })
  }

  // check summary
  if (!role.toLowerCase().match('arbiter')) {
    const tableName = ''
    const theader = [
      {
        label: 'Step',
        prop: 'step'
      },
      {
        label: 'Effect',
        prop: 'effect'
      },
      {
        label: 'Anonym in ' + (role.toLowerCase().match('host') ? 'guest & ' : 'host & ') + 'arbiter',
        prop: 'anonymInArbiter'
      },
      {
        label: 'Entered or Removed',
        prop: 'eorr'
      },
      {
        label: 'Number in',
        prop: 'numberIn'
      },
      {
        label: 'DF',
        prop: 'df'
      }
    ]
    const tbody = []
    let numberInCount = originDataList.steps[0].numberIn
    for (const val of originDataList.steps) {
      for (const val2 of val.enter) {
        const feature = val.features.get(val2)
        numberInCount++
        tbody.push({
          step: val.name.match(/[0-9]+/)[0],
          effect: val2,
          role: feature.role,
          anonymInArbiter: feature.arbiter,
          eorr: 'entered',
          numberIn: numberInCount,
          df: '-'
        })
      }
      for (const val2 of val.remove) {
        const feature = val.features.get(val2)
        numberInCount--
        tbody.push({
          step: val.name.match(/[0-9]+/)[0],
          effect: val2,
          role: feature.role,
          anonymInArbiter: feature.arbiter,
          eorr: 'removed',
          numberIn: numberInCount,
          df: '-'
        })
      }
      if (!val.enter.length && !val.remove.length) {
        tbody.push({
          step: val.name.match(/[0-9]+/)[0],
          effect: '-',
          role: '-',
          anonymInArbiter: '-',
          eorr: '-',
          numberIn: numberInCount,
          df: '-'
        })
      }
    }
    if (summary.tables[0] && !summary.tables[0].tableName) {
      summary.tables.splice(0, 1, {
        tableName,
        theader,
        tbody
      })
    } else {
      summary.tables.splice(0, 0, {
        tableName,
        theader,
        tbody
      })
    }
  }

  let hasAoe = false
  let hasAomle = false
  const tableName = 'Analysis of Effects'
  const theader = !role.toLowerCase().match('arbiter')
    ? [
      {
        label: 'Effect',
        prop: 'effect'
      },
      {
        label: 'Anonym in ' + (role.toLowerCase().match('host') ? 'guest & ' : 'host & ') + 'arbiter',
        prop: 'anonymInArbiter'
      },
      {
        label: 'Entered or Removed',
        prop: 'change'
      },
      {
        label: 'DF',
        prop: 'df'
      }
    ]
    : [
      {
        label: 'Effect',
        prop: 'effect'
      },
      {
        label: 'Entered or Removed',
        prop: 'change'
      },
      {
        label: 'DF',
        prop: 'df'
      },
      {
        label: meta.score_name.toUpperCase(),
        prop: 'a_b_ic'
      }]
  const tbody = []
  const tableNameM = 'Analysis of Maximum Likelihood Estimates'
  const theaderM = [
    {
      label: 'Parameter',
      prop: 'effect'
    },
    {
      label: 'Anonym in ' + (role.toLowerCase().match('host') ? 'guest & ' : 'host & ') + 'arbiter',
      prop: 'anonymInArbiter'
    },
    {
      label: 'DF',
      prop: 'df'
    },
    {
      label: 'Estimate',
      prop: 'estimate'
    }]
  if (role.toLowerCase().match('arbiter')) {
    theaderM.splice(1, 1)
  }
  for (let i = 0; i < steps.length; i++) {
    tbody.push(...(JSON.parse(JSON.stringify(steps[i].commonTableContent))))
  }
  for (let i = 0; i < summary.tables.length; i++) {
    if (summary.tables[i].tableName === 'Analysis of Effects') {
      hasAoe = true
      summary.tables[i].tbody = tbody
    }
    if (summary.tables[i].tableName === 'Analysis of Maximum Likelihood Estimates') {
      hasAomle = true
      summary.tables[i].tbody = tbody
    }
  }
  if (!hasAoe) {
    summary.tables.push({
      tableName, theader, tbody
    })
  }
  if (!hasAomle && !role.toLowerCase().match('arbiter')) {
    summary.tables.push({
      tableName: tableNameM, theader: theaderM, tbody
    })
  }

  let hasTraining = false
  for (const val of common) {
    if (val.tableName === 'Trainning Data Info') {
      hasTraining = true
      break
    }
  }
  if (!hasTraining && !role.toLowerCase().match('arbiter')) {
    const tableNameC = 'Trainning Data Info'
    const theaderC = [
      {
        label: 'type',
        prop: 'type'
      },
      {
        label: 'Number of Observations Read',
        prop: 'noou1'
      },
      {
        label: 'Number of Observations Used',
        prop: 'noou2'
      },
      {
        label: 'Missing Value Ratio',
        prop: 'missVal'
      },
      {
        label: 'Number of Response',
        prop: 'numOfResp'
      },
      {
        label: 'Number of Non-response',
        prop: 'numOfNoResp'
      }
    ]
    const tbodyC = [
      {
        type: 'Training',
        noou1: formatFloat(meta.n_count) || '-',
        noou2: formatFloat(meta.n_count) || '-',
        missVal: 0,
        numOfResp: formatFloat(meta.n_count) || '-',
        numOfNoResp: 0
      }
    ]
    common.push({
      tableName: tableNameC,
      theader: theaderC,
      tbody: tbodyC
    })
  }
  if (!originDataList.common) {
    originDataList.common = common
  }
}

