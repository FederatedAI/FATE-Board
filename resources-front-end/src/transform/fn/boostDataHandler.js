
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

import { formatFloat } from '@/utils/index'
import { getTreeOptions } from '@/utils/chart-options/tree'
import { getTreeLineOptions } from '@/utils/chart-options/treeLine'
import { getDoubleBarOptions } from '@/utils/chart-options/doubleBar'

import { wrap, makeArray, each, head } from './uitls'
import handleTreeData from './treeDataHandler'

function boostDataHandler({ responseData, role, partyId, outputType }) {
  const output = {}

  const { featureNameFidMapping, featureImportances, trees, classes, treeDim } = responseData
  const allTreesLen = treeDim < 3 ? 1 : treeDim
  const allTreesOverviewData = makeArray(allTreesLen, () => [])
  const allTreesLineSeriesData = makeArray(allTreesLen, () => [])
  let maxTreeSize = 0

  each(trees, (item, index) => {
    const i = index % allTreesLen
    allTreesOverviewData[i].push(
      handleTreeData(
        item.tree,
        role,
        partyId,
        featureNameFidMapping,
        item.splitMaskdict,
        item.missingDirMaskdict,
        outputType
      )
    )
    allTreesLineSeriesData[i].push([parseInt(index / allTreesLen), item.tree.length])
    if (i === 0 && item.tree.length > maxTreeSize) {
      maxTreeSize = item.tree.length
    }
  })

  const treesOverviewData = head(allTreesOverviewData)
  const lineSeriesData = head(allTreesLineSeriesData)

  const options = getTreeOptions()
  const treesLineData = getTreeLineOptions()

  const fisrtTreeOverviewData = head(treesOverviewData)
  options.series.data = fisrtTreeOverviewData.data
  treesLineData.series.data = lineSeriesData
  treesLineData.series.markLine.data[0][1].coord[1] = maxTreeSize

  Object.assign(output, {
    treeOptions: options,
    currentTreeData: {
      id: fisrtTreeOverviewData.data[0].treeid,
      size: fisrtTreeOverviewData.size,
      maxDepth: fisrtTreeOverviewData.maxDepth,
      treeWidth: fisrtTreeOverviewData.treeWidth
    },
    treesOverviewData,
    maxTreeSize,
    treesLineData
  })

  if (treeDim >= 3) {
    output.allTreesOverviewData = allTreesOverviewData
    output.allTreesLineSeriesData = allTreesLineSeriesData

    const classOptions = []
    if (role === 'guest') {
      each(classes, (item, index) => {
        const label = `${index}: ${item}`
        classOptions.push({ value: index, label })
      })
    } else if (role === 'host') {
      each(treeDim, (i) => {
        classOptions.push({ value: i, label: i })
      })
    }
    output.classOptions = classOptions
  }

  // variable importance
  if (featureImportances && featureImportances.length > 0) {
    const featureImportancesLen = featureImportances.length
    const variableImportanceOptions = getDoubleBarOptions()

    const importanceData = new Array(featureImportancesLen)
    const maxImportanceData = new Array(featureImportancesLen)
    let maxImportance

    let variableData = new Array(featureImportancesLen)
    let maxVariableLength = 0

    const siteNameData = new Array(featureImportancesLen)
    featureImportances.forEach((item, index) => {
      const reverseIndex = featureImportancesLen - index - 1
      const _importance = item.importance
      importanceData[reverseIndex] = _importance
      if (maxImportance == null || _importance > maxImportance) {
        maxImportance = _importance
      }

      const [itemRole, itemPartyId] = item.sitename.split(':')
      const variable = itemRole === role && itemPartyId === partyId ? featureNameFidMapping[item.fid] : item.fid + ''
      variableData[reverseIndex] = variable
      const variableLen = variable ? variable.toString().length : (typeof variable).length
      variableLen > maxVariableLength && (maxVariableLength = variableLen)

      siteNameData[reverseIndex] = item.sitename
    })

    variableData = variableData.map(item => {
      if (!item) {
        item = typeof item
      }
      return item.toString().padEnd(maxVariableLength, '  ')
    })
    maxImportanceData.fill(maxImportance)

    variableImportanceOptions.series[0].data = maxImportanceData
    variableImportanceOptions.series[1].data = importanceData
    variableImportanceOptions.series[1].name = 'importance'
    variableImportanceOptions.series[0].label.formatter = function(params) {
      return formatFloat(importanceData[params.dataIndex])
    }
    variableImportanceOptions.yAxis[0].data = variableData
    variableImportanceOptions.yAxis[1].data = siteNameData
    output.variableImportanceOptions = variableImportanceOptions

    const tBody = featureImportances.map(val => {
      val = { ...val }
      if (val.sitename.indexOf('host') > -1 && role.indexOf('host') < 0) {
        const party_Id = val.sitename.match(/[0-9]+$/)[0]
        if (party_Id) {
          val.name = 'host_' + party_Id + '_' + val.fid
        }
      } else {
        val.name = featureNameFidMapping[val.fid]
      }
      return val
    })
    output.featureTable = { tBody }
  }

  if (featureNameFidMapping) {
    const final = Object.entries(featureNameFidMapping)
    if (final.length) {
      const tHeader = [{ label: 'variable', prop: 'variable' }, { label: 'anonym in guest', prop: 'featureIndex' }]
      const tBody = final.map(([key, value]) => {
        return {
          variable: value,
          featureIndex: `${role}_${partyId}_${key}`
        }
      })
      output.featureHostTable = { tHeader, tBody }
    }
  }

  // bestInteration(output, outputType, responseData)

  const group = {

    importance: {
      type: 'table',
      name: 'importance',
      props: {
        data: output.featureTable ? output.featureTable.tBody : []
      }
    },
    featureHostTable: {
      type: 'table',
      props: {
        name: 'featureHostTable',
        header: output.featureHostTable.tHeader,
        data: output.featureHostTable.tBody
      }
    },
    treesLine: {
      type: 'chart',
      name: 'treesLineData',
      props: {
        options: output.treesLineData
      }
    },
    treeOptions: {
      type: 'chart',
      name: 'treeOptions',
      props: {
        options: output.treeOptions,
        zoom: true
      }
    }
  }

  return group
}

export default wrap(boostDataHandler)
