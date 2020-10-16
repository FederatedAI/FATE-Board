
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
import { MODEL_TYPES } from './const'

export default function(data, role, partyId, featureNameFidMapping, splitMaskdict, missingDirMaskdict, outputType) {
  if (data.length === 0) {
    return []
  }
  const normalizeData = {}
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    normalizeData[item.id] = item
  }

  let maxDepth = 0
  const defWidth = 170
  const isHomoBoost = outputType === MODEL_TYPES.HomoBoost
  const getSplitValue = !isHomoBoost ? node => splitMaskdict[node.id] : node => node.bid.toFixed(6)

  let variable
  let splitValue
  let nodeRole
  let nodePartyId
  const createNode = node => {
    const isLeaf = node.isLeaf
    const id = node.id
    variable = featureNameFidMapping[node.fid]
    splitValue = getSplitValue(node);
    [nodeRole, nodePartyId] = node.sitename.split(':')
    let name = `ID: ${id}\n`
    if (nodeRole === role && nodePartyId === partyId && !isLeaf && !isHomoBoost) {
      name += `${variable} <= ${splitValue}`
      if (missingDirMaskdict[id] !== 1) {
        name += '\nor missing'
      }
      name += '\n'
    } else if (isHomoBoost && !isLeaf && variable) {
      name += `${variable} <= ${splitValue}`
      if (node.missingDir === -1) {
        name += '\nis a missing value'
      }
      name += '\n'
    }
    if ((isLeaf && role === 'guest') || (isLeaf && isHomoBoost)) {
      name += `weight: ${formatFloat(node.weight)}\n`
    }
    if (!isHomoBoost) {
      name += `${nodeRole && nodeRole.toUpperCase()}: ${nodePartyId}`
    }
    return {
      treeid: id,
      name,
      children: []
    }
  }

  const treeData = []

  const insertChild = (arr, node, depth = 0) => {
    depth++
    let treeWidth = 0
    const _node = createNode(node)
    arr.push(_node)
    const leftNode = normalizeData[node.leftNodeid]
    const rightNode = normalizeData[node.rightNodeid]
    if (leftNode) {
      treeWidth += insertChild(_node.children, leftNode, depth)
    }

    if (rightNode) {
      treeWidth += insertChild(_node.children, rightNode, depth)
    }

    if (!leftNode && !rightNode) {
      treeWidth = defWidth
    } else if (!leftNode || !rightNode) {
      treeWidth += defWidth
    }
    if (depth > maxDepth) {
      maxDepth = depth
    }

    return treeWidth
  }

  const treeWidth = insertChild(treeData, data[0])

  return { data: treeData, size: data.length, maxDepth, treeWidth }
}
