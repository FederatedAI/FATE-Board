
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
import store from '@/store/modules/app'

const { modelNameMap } = store.state

export default function(data, role, partyId, featureNameFidMapping, splitMaskdict, missingDirMaskdict, outputType, workmode, defPartId) {
  if (data.length === 0) {
    return { data: [], size: 0, maxDepth: 0, treeWidth: 0 }
  }
  let maxDepth = 0
  const pushData = ({ arr, node, grandChildrenArr = [], depth = 0, rootNode }) => {
    const variable = featureNameFidMapping[node.fid]
    const splitValue = !(outputType.toLowerCase().match(modelNameMap.homoBoost.toLowerCase()))
      ? (splitMaskdict[node.id]
        ? parseFloat(splitMaskdict[node.id]).toFixed(6)
        : undefined
      ) : parseFloat(node.bid).toFixed(6)
    const nodeRole = node.sitename.split(':')[0]
    const nodePartyId = node.sitename.split(':')[1]
    let name = rootNode && splitValue === undefined ? rootNode + '\n' : `ID: ${node.id}\n`
    // console.log(nodeRole, role, nodePartyId, partyId)
    if (nodeRole === role && nodePartyId === partyId && !node.isLeaf && !(outputType.toLowerCase().match(modelNameMap.homoBoost.toLowerCase()))) {
      name += `${variable} <= ${splitValue !== undefined ? splitValue : node.bid || 0}`
      if ((missingDirMaskdict[node.id] || node.missingDir) !== 1) {
        name += '\nor missing'
      }
      name += '\n'
    } else if (outputType.toLowerCase().match(modelNameMap.homoBoost.toLowerCase()) && !node.isLeaf && variable) {
      name += `${variable} <= ${splitValue || node.bid || 0}`
      if (node.missingDir === -1) {
        name += '\nis a missing value'
      }
      name += '\n'
    }
    if (((node.isLeaf && role === 'guest') || (node.isLeaf && outputType.toLowerCase().match(modelNameMap.homoBoost.toLowerCase()))) && !rootNode) {
      if (node.moWeight && node.moWeight.length > 0) {
        name += `Weight: \n "0":${formatFloat(node.moWeight[0])}${node.moWeight.length > 1 ? '...' : ''}\n`
      } else {
        name += `weight: ${formatFloat(node.weight)}\n`
      }
    }
    if (!(outputType.toLowerCase().match(modelNameMap.homoBoost.toLowerCase()))) {
      name += workmode.toLowerCase() === 'mix' && role.toLowerCase().match('guest') && node.leftNodeid === -1 && node.rightNodeid === -1 && depth === 0
        ? 'HOST' + (defPartId ? (':' + defPartId) : '')
        : `${nodeRole && nodeRole.toUpperCase()} ${nodePartyId ? (':' + nodePartyId) : (defPartId ? (':' + defPartId) : '')}`
    }
    arr.push({
      treeid: node.id,
      name,
      meta: node,
      children: grandChildrenArr
    })
    if (depth > maxDepth) {
      maxDepth = depth
    }
    return splitValue !== undefined
  }
  const rootNode = data.find(item => item.id === data[0].id)
  const treeData = []
  const mixecheck = pushData({ arr: treeData, node: rootNode, rootNode: workmode && workmode.toLowerCase() === 'mix' && role.toLowerCase().match('guest') ? 'Multi nodes' : '' })
  let treeWidth = 0
  if (workmode && workmode.toLowerCase() === 'mix' && !mixecheck && role.toLowerCase().match('guest')) {
    const insertLeafs = (arr, list) => {
      for (const val of list) {
        if (val.isLeaf) {
          pushData({ arr, node: val, grandChildrenArr: [], depth: 1 })
        }
      }
    }
    insertLeafs(treeData[0].children, data)
    treeWidth = (treeData[0].children.length || 1) * 170
  } else {
    const insertChild = (arr, leftNodeId, rightNodeId, depth) => {
      ++depth
      let treeWidth = 0
      const defWidth = 170
      // 获取左右儿子节点
      const leftNode = data.find(item => item.id === leftNodeId)
      const rightNode = data.find(item => item.id === rightNodeId)
      if (leftNode) {
        // 孙子节点,并获取ID
        const leftGrandChildrenArr = []
        const leftGranChildId = leftNode.leftNodeid
        const rightGranChildId = leftNode.rightNodeid
        // 递归插入
        pushData({ arr, node: leftNode, grandChildrenArr: leftGrandChildrenArr, depth })
        treeWidth += insertChild(leftGrandChildrenArr, leftGranChildId, rightGranChildId, depth)
      } else if (rightNode) {
        treeWidth += defWidth
      }
      if (rightNode) {
        const rightGrandChildrenArr = []
        const rightGranChildId = rightNode.rightNodeid
        const leftGranChildId = rightNode.leftNodeid
        // 递归插入
        treeWidth += insertChild(rightGrandChildrenArr, leftGranChildId, rightGranChildId, depth)
        pushData({ arr, node: rightNode, grandChildrenArr: rightGrandChildrenArr, depth })
      } else if (leftNode) {
        treeWidth += defWidth
      }
      if (!leftNode && !rightNode) {
        treeWidth = defWidth
      }
      return treeWidth
    }
    treeWidth = insertChild(treeData[0].children, data[0].leftNodeid, data[0].rightNodeid, 1)
  }
  // console.log(treeData)
  // console.log(maxHorizontalLength)
  return { data: treeData, size: data.length, maxDepth, treeWidth }
}
