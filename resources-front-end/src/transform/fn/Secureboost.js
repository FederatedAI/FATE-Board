
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

import handleTreeData from '../../utils/vendor/treeDataHandler'
// import boostHandler from '../../utils/vendor/boostDataHandler'
import treeOptions from '@/utils/chart-options/tree'
import treeLineOptions from '@/utils/chart-options/treeLine'
import metricArrange from './metricsArrange'
import { deepClone } from '../../utils'
import { wrapGroupComponent, createAsyncComponent } from './common'
import { getTransformMetricFn } from '../index'
import { each } from './uitls'
import isNil from 'lodash/isNil'
import { METRIC_TYPES } from './const'
import { getMetricsData } from '@/api/chart'
import { explainCurves } from './metricsArrange'
// import { combineForPerformanceSum } from './metricsCombine'

const createComponent = (type, name, props, other) => {
  return {
    type,
    name,
    props,
    ...other
  }
}

const createAsyncOption = (name, props, method, transform, exportName, detail) => ({
  name,
  props,
  method,
  transform,
  export: exportName,
  detail: detail
})

const addOption = (label, value) => {
  return {
    label,
    value
  }
}

const importanceHeader = [
  {
    label: 'FEATURE',
    prop: 'fullname',
    width: '110px',
    align: 'left',
    showOverflowTooltip: true,
    normal_deep: true
  },
  {
    type: 'weight',
    label: '',
    prop: 'importance',
    much_deep: true
  }
]

const gainHeader = [
  {
    label: 'FEATURE',
    prop: 'fullname',
    width: '110px',
    align: 'left',
    showOverflowTooltip: true,
    normal_deep: true
  },
  {
    type: 'weight',
    label: '',
    prop: 'gain',
    much_deep: true
  }
]

const mappingHeader = [
  {
    label: 'variable',
    prop: 'variable'
  },
  {
    label: 'anonym in guest',
    prop: 'featureIndex'
  }
]

const basicColor = [
  '73,78,206',
  '7,135,210',
  '1,161,194',
  '107,142,0',
  '2,135,69',
  '236,118,0',
  '225,51,51',
  '130,53,180',
  '212,0,120',
  '82,85,112'
]

function classLabel(role, classes, treeDim) {
  // Arrange label_index selection
  // when treeDim bigger than two, this options will have option for choosing
  const classOptions = []
  if (treeDim >= 3) {
    if (role === 'guest') {
      classes.forEach((item, i) => {
        const label = `model_${i}`
        classOptions.push({ value: i, label, name: item })
      })
    } else if (role === 'host') {
      for (let i = 0; i < treeDim; i++) {
        classOptions.push({ value: i, label: i, name: i })
      }
    }
  }
  return classOptions
}

function modelTreeData(modelData, partyId, role) {
  const mData = modelData.data.data
  const mMeta = modelData.data.meta
  const workMode = mMeta.meta_data.boostingStrategy
  const type = mMeta.module_name
  // model data transform
  const { featureNameFidMapping, trees, classes, treeDim, treePlan } = mData
  const labelSelection = classLabel(role, classes, treeDim)
  const impleToSelection = labelSelection.length > 0 ? {} : []
  const impleToTrees = {}
  const impleToLines = labelSelection.length > 0 ? {} : []
  const impleColor = labelSelection.length > 0 ? {} : `rgba(${basicColor[0]},1)`
  let impleToMaxmium = labelSelection.length > 0 ? {} : 0
  trees.forEach((item, index) => {
    const treeData = {
      tree: item.tree,
      role,
      partyId,
      featureNameFidMapping,
      splitMaskdict: item.splitMaskdict,
      missingDirMaskdict: item.missingDirMaskdict,
      type,
      workMode
    }
    if (Array.isArray(impleToSelection)) {
      impleToSelection.push({
        label: item.tree.length,
        value: (impleToSelection.length).toString()
      })
      const planId = (Object.keys(impleToTrees).length) % treePlan.length
      let treePartyId = treePlan[planId] ? treePlan[planId].split('-') : []
      treePartyId = treePartyId[0] === '1' ? treePartyId[1] : null
      treeData.treePartyId = treePartyId
      impleToTrees[(impleToSelection.length - 1).toString()] = treeData
      impleToLines.push([index, item.tree.length])
      if (impleToMaxmium < item.tree.length) {
        impleToMaxmium = item.tree.length
      }
    } else {
      const key = index % treeDim
      impleToSelection[key] = impleToSelection[key] || []
      impleToLines[key] = impleToLines[key] || []
      impleToSelection[key].push({
        label: item.tree.length,
        value: key + '_' + (impleToSelection[key].length)
      })
      impleToLines[key].push([impleToLines[key].length, item.tree.length])
      impleColor[key] = `rgba(${basicColor[parseFloat(key) % basicColor.length]},1)`
      const name = key + '_' + (impleToSelection[key].length - 1)
      const objList = Object.keys(impleToTrees).filter(item => item.match(key + '_'))
      const planId = (objList.length) % treePlan.length
      let treePartyId = treePlan[planId] ? treePlan[planId].split('-') : []
      treePartyId = treePartyId[0] === '1' ? treePartyId[1] : null
      treeData.treePartyId = treePartyId
      impleToTrees[name] = treeData
      if (!impleToMaxmium[key] || impleToMaxmium[key] < item.tree.length) {
        impleToMaxmium[key] = item.tree.length
      }
    }
  })
  return {
    label_index: labelSelection,
    treeList: impleToSelection,
    treeData: impleToTrees,
    treeLines: impleToLines,
    maxmium: impleToMaxmium,
    colors: impleColor

  }
}

function setTreelines(treeLines, maxTreeSize, bcolor) {
  const trl = deepClone(treeLineOptions)
  const finalData = []
  let basicSeries = deepClone(trl.series)
  for (const val of treeLines) {
    if (val[1] === 0) {
      if (basicSeries.data.length > 0) {
        if (basicSeries.data.length === 1) {
          delete basicSeries.symbol
          basicSeries.symbolSize = 4
        }
        finalData.push(basicSeries)
        basicSeries = deepClone(trl.series)
      }
      basicSeries.data = [val]
      finalData.push(basicSeries)
      basicSeries = deepClone(trl.series)
    } else {
      basicSeries.data = basicSeries.data || []
      basicSeries.data.push(val)
    }
  }
  finalData.push(basicSeries)
  trl.series = finalData
  trl.series[0].markLine.data[0][1].coord[1] = maxTreeSize
  trl.yAxis.max = maxTreeSize
  trl.backgroundColor = '#f8f8fa'
  trl.color = '#FF8800'
  trl.tooltip.backgroundColor = bcolor
  trl.tooltip.textStyle.color = '#fff'
  trl.tooltip.axisPointer.lineStyle.color = bcolor
  return trl
}

function setTreeDatasDiagram(data, bcolor) {
  if (data && Object.keys(data).length > 0) {
    const options = deepClone(treeOptions)
    options.series.data = data
    options.series.label.backgroundColor = bcolor
    options.series.leaves.label.backgroundColor = bcolor.replace(',1)', ',0.6)')
    return options
  } else {
    return {}
  }
}

function getColor(opt, colorlist) {
  if (typeof colorlist === 'string') {
    return colorlist
  }
  const c = opt.split('_')
  if (c.length > 1) {
    return colorlist[parseInt(c[0])]
  } else {
    return colorlist[0]
  }
}

function setGraphOptions(modelData, partyId, role) {
  const treesData = modelTreeData(modelData, partyId, role)
  const mid = treesData.treeData
  const res = []
  for (const key in mid) {
    const bcolor = getColor(key, treesData.colors)
    mid[key].color = bcolor
    // if (mid[key].data.length !== 0) {
    //   mid[key].data = setTreeDatasDiagram(mid[key].data, bcolor)
    // } else {
    //   mid[key].data = {}
    // }
    res.push({
      name: key,
      props: mid[key],
      transform: transfromTreeData,
      export: 'decision_tree'
    })
  }
  treesData.treeData = res
  // treesLineData
  if (Array.isArray(treesData.treeLines)) {
    treesData.treeLines = setTreelines(treesData.treeLines, treesData.maxmium, treesData.colors)
  } else {
    for (const key in treesData.treeLines) {
      const val = treesData.treeLines[key]
      const max = treesData.maxmium[key]
      treesData.treeLines[key] = setTreelines(val, max, treesData.colors[key])
    }
  }
  return treesData
}

function transfromTreeData(props) {
  const opts = handleTreeData(props.tree, props.role, props.partyId, props.featureNameFidMapping, props.splitMaskdict, props.missingDirMaskdict, props.type, props.workMode, props.treePartyId)
  return [createComponent('chart', '', {
    setting: setTreeDatasDiagram(opts.data, props.color),
    width: opts.treeWidth,
    height: '+' + ((opts.maxDepth - 4 > 0 ? opts.maxDepth - 4 : 0) * 100),
    zoom: true,
    noData: `this tree belongs to other party`,
    legend: false,
    className: 'overflow-hidden'
  })]
}

function TreeSetting(modelData, partyId, role) {
  const { featureNameFidMapping } = modelData.data.data
  const treesData = setGraphOptions(modelData, partyId, role)
  const variabelMaps = []
  for (const key in featureNameFidMapping) {
    variabelMaps.push(featureNameFidMapping[key])
  }
  // const setting = {}
  // const width = {}
  // const height = {}
  // for (const key in treesData.treeData) {
  //   const val = treesData.treeData[key]
  //   setting[key] = val.data
  //   width[key] = val.treeWidth
  //   height[key] = '+' + ((val.maxDepth - 5 > 0 ? val.maxDepth - 5 : 0) * 100)
  // }
  return [
    createComponent('form', '', {
      form: [
        createComponent('f-treeSelect', '', {
          labels: treesData.label_index,
          treeList: treesData.treeList,
          treeLine: treesData.treeLines,
          maxmium: treesData.maxmium,
          basicColor: treesData.colors,
          showlabel: !!role.toLowerCase().match('guest')
        })
      ]
    }),
    createComponent('async', '', {
      options: treesData.treeData,
      variableMap: variabelMaps
    })
  ]
}

function transformImportance(responseData) {
  if (responseData.featureImportances && responseData.featureImportances.length > 0) {
    const tBody = []
    each(deepClone(responseData.featureImportances), item => {
      tBody.push(Object.assign({}, item, {
        gain: (item.main && item.main === 'split' || !item.main) ? item.importance2 : item.importance,
        importance: item.main && item.main === 'gain' ? item.importance2 : item.importance
      }))
      isSplit = item.main === 'split'
    })
    return tBody
  }
  return false
}

function hasGain(dataList) {
  return dataList.find(val => !isNil(val.gain) && val.gain !== 0)
}

function importanceTableContent(dataList, role) {
  const data = {
    [role]: []
  }
  const group = []
  for (const val of dataList) {
    if (val.sitename.match(role)) {
      data[role].push(val)
    } else {
      if (group.indexOf(val.sitename) < 0) {
        group.push(val.sitename)
        data[val.sitename] = []
      }
      data[val.sitename].push(val)
    }
  }
  const hostChildSelection = []
  for (const val of group) {
    hostChildSelection.push(addOption(val, val))
  }
  const selection = hostChildSelection.length > 0 ? [
    addOption(role, role),
    addOption(role === 'guest' ? 'host' : 'guest', hostChildSelection)
  ] : []
  return {
    selection: selection.length > 0 ? createComponent('f-select', '', {
      options: selection,
      legend: true,
      multiple: true
    }) : null,
    data: selection.length > 0 ? data : data[role]
  }
}

function impotanceAsync(responseData, role) {
  const dataList = transformImportance(responseData, role)
  if (!dataList) {
    return false
  }
  const { selection, data } = importanceTableContent(dataList, role)
  const formList = [createComponent('text', '', {
    content: `{t} features involved in model splitting`,
    data: {
      '{t}': (tableParam) => {
        return tableParam.data.length || 0
      }
    }
  })]
  if (selection) formList.push(selection)
  const importanceSplit = [
    createComponent('form', '', {
      form: formList
    }),
    createComponent('table', '', {
      header: importanceHeader,
      data: data,
      pageSize: 'all',
      combine: false,
      export: 'feature_importance_split',
      mapVariable: 'fullname'
    })
  ]
  const gainTable = hasGain(dataList)

  if (gainTable && role.match(/guest/i)) {
    const formList2 = [
      createComponent('text', '', {
        content: `{t} features involved in model splitting`,
        data: {
          '{t}': (tableParam) => {
            return tableParam.data.length || 0
          }
        }
      })]
    if (selection) formList2.push(selection)
    const importanceGain = [
      createComponent('form', '', {
        form: formList2
      }),
      createComponent('table', '', {
        header: gainHeader,
        data: data,
        pageSize: 'all',
        combine: false,
        export: 'feature_importance_gain',
        mapVariable: 'fullname'
      })
    ]
    // const asyncComponent = [
    //   {
    //     name: 'importance',
    //     export: 'feature_importance_split',
    //     props: importanceSplit,
    //     transform: (props) => {
    //       return {
    //         type: 'group',
    //         props: {
    //           options: props
    //         }
    //       }
    //     }
    //   }]
    // asyncComponent.push({
    //   name: 'gain',
    //   export: 'feature_importance_gain',
    //   props: importanceGain,
    //   transform: (props) => {
    //     return {
    //       type: 'group',
    //       props: {
    //         options: props
    //       }
    //     }
    //   }
    // })
    // const async = createAsyncComponent(asyncComponent)
    // async.props.needLoad = false
    // return async
    return {
      importanceSplit,
      importanceGain
    }
  } else {
    return {
      type: 'group',
      props: {
        options: importanceSplit
      }
    }
  }
}

let isSplit = true

function importanceSetting(responseData, role) {
  isSplit = true
  const asyncSetting = impotanceAsync(responseData, role)
  if (!asyncSetting) {
    return false
  }

  const fromComponent = [
    createComponent('title', '', {
      content: 'Feature Importance'
    })
  ]
  // if (asyncSetting.type.search('async') >= 0) {
  //   fromComponent.push(createComponent('f-labelTab', '', {
  //     options: [{
  //       label: 'split (applied)',
  //       value: 'importance'
  //     }, {
  //       label: 'gain',
  //       value: 'gain'
  //     }]
  //   }))
  // }

  const Options = [{
    label: 'split' + (isSplit ? ' (applied)' : ''),
    value: 'importanceSplit'
  }, {
    label: 'gain' + (!isSplit ? ' (applied)' : ''),
    value: 'importanceGain'
  }]
  return !asyncSetting.type ? [
    createComponent('tabs', '', {
      title: 'Feature Importance',
      options: isSplit ? Options : Options.reverse(),
      content: asyncSetting
    })
  ] : [
    ...fromComponent,
    asyncSetting
  ]
}

function mappingSetting(responseData, partyId, role) {
  if (responseData.featureNameFidMapping && Object.keys(responseData.featureNameFidMapping).length > 0) {
    const mapping = responseData.anonymousNameMapping
    const tBody = []
    for (const key in mapping) {
      tBody.push({ variable: mapping[key], featureIndex: key })
    }
    return [
      createComponent('title', '', {
        content: 'Feature Mapping'
      }),
      createComponent('table', '', {
        header: mappingHeader,
        data: tBody,
        combine: false,
        export: 'feature_mapping'
      })
    ]
  }
  return false
}

async function metricsTransform(group, metricsData, partyId, role, componentName, jobId) {
  const params = {
    party_id: partyId,
    role: role,
    component_name: componentName,
    job_id: jobId
  }
  let othersRequest
  let othersResult
  const metricsComponent = []

  let warmStartRequest
  let warmStartResult
  let warmStartTransFn
  let warmStartCompoent = []

  if (metricsData && !metricsData.msg.match('no data')) {
    metricsData = metricArrange(metricsData.data)
    each(metricsData, md => {
      if (md.name === 'others') {
        othersRequest = getMetricsData.bind(null, {
          metrics: md.options,
          ...params
        })
      } else if (md.name === 'iter') {
        warmStartRequest = getMetricsData.bind(null, {
          metrics: md.options,
          ...params
        })
        warmStartTransFn = getTransformMetricFn('warmStart')
      } else if (md.name === 'curves' || md.name === 'loss') {
        const form = {
          type: 'form',
          props: {
            form: [
              {
                type: 'f-tabs',
                props: {
                  tabs: md.tabs
                }
              }
            ]
          }
        }
        const options = []
        each(md.options, (metrics, name) => {
          options.push(createAsyncOption(
            name,
            {
              metrics: metrics,
              ...params
            },
            getMetricsData,
            getTransformMetricFn(md.name),
            explainCurves(name).name,
            true
          ))
        })
        metricsComponent.push([form, createAsyncComponent(options)])
      }
    })

    if (metricsComponent.length) {
      each(metricsComponent, mc => {
        group.push(mc)
      })
    }

    if (othersRequest) {
      othersResult = await othersRequest()
    }

    if (othersResult) {
      const transformFn = getTransformMetricFn(METRIC_TYPES.EVALUATION_SUMMARY)
      const table = transformFn(othersResult.data) || []
      // TODO: Combining others result for performance sum
      // const asyncSum = combineForPerformanceSum(table) || []
      // let combine = [...table, ...asyncSum]
      let combine = [...table]
      combine = combine.length > 0 ? group.length === 0 ? wrapGroupComponent(combine) : combine : null
      if (combine) {
        if (group.length > 1) {
          group.splice(1, 0, combine)
        } else {
          group.push(combine)
        }
      }
    }

    if (warmStartRequest) {
      warmStartResult = await warmStartRequest()
    }
    if (warmStartTransFn) {
      warmStartCompoent = warmStartTransFn(warmStartResult)
      if (group.length === 0) {
        group.push(wrapGroupComponent(warmStartCompoent))
      } else if (group[0].options && Array.isArray(group[0].options)) {
        group[0].options.unshift(...warmStartCompoent)
      } else if (Array.isArray(group[0])) {
        group[0].unshift(...warmStartCompoent)
      }
    }
  }
}

const fn = async(modelData, metricData, partyId, role, componentName, jobId) => {
  const finalSetting = []
  if (modelData.data.meta) {
    const outputType = modelData.data.meta.module_name
    const workMode = modelData.data.meta.meta_data.workMode
    finalSetting.push(TreeSetting(modelData, partyId, role))
    if (role !== 'host' || !outputType.toLowerCase().match('homo')) {
      const featureImportances = importanceSetting(modelData.data.data, role)
      if (featureImportances) {
        finalSetting.push(featureImportances)
      }
    }
    if (role === 'host' && !outputType.toLowerCase().match('homo') && !workMode.toLowerCase().match('mix')) {
      const featureMapping = mappingSetting(modelData.data.data, partyId, role)
      if (featureMapping) {
        finalSetting.push(featureMapping)
      }
    }
  }
  await metricsTransform(finalSetting, metricData, partyId, role, componentName, jobId)
  return finalSetting.map(g => {
    return wrapGroupComponent(g)
  })
}

export default fn
