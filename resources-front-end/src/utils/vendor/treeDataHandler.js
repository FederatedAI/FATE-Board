import { formatFloat } from '../index'
import store from '@/store/modules/app'

const { modelNameMap } = store.state

export default function(data, role, partyId, featureNameFidMapping, splitMaskdict, missingDirMaskdict, outputType) {
  if (data.length === 0) {
    return []
  }
  let maxDepth = 0
  const pushData = ({ arr, node, grandChildrenArr = [], depth = 0 }) => {
    const variable = featureNameFidMapping[node.fid]
    const splitValue = outputType !== modelNameMap.homoBoost ? splitMaskdict[node.id] : parseFloat(node.bid).toFixed(6)
    const nodeRole = node.sitename.split(':')[0]
    const nodePartyId = node.sitename.split(':')[1]
    let name = `ID: ${node.id}\n`
    // console.log(nodeRole, role, nodePartyId, partyId)
    if (nodeRole === role && nodePartyId === partyId && !node.isLeaf && outputType !== modelNameMap.homoBoost) {
      name += `${variable} <= ${splitValue}`
      if (missingDirMaskdict[node.id] !== 1) {
        name += '\nor missing'
      }
      name += '\n'
    } else if (outputType === modelNameMap.homoBoost && !node.isLeaf && variable) {
      name += `${variable} <= ${splitValue}`
      if (node.missingDir === -1) {
        name += '\nis a missing value'
      }
      name += '\n'
    }
    if ((node.isLeaf && role === 'guest') || (node.isLeaf && outputType === modelNameMap.homoBoost)) {
      name += `weight: ${formatFloat(node.weight)}\n`
    }
    if (modelNameMap.homoBoost !== outputType) {
      name += `${nodeRole && nodeRole.toUpperCase()}: ${nodePartyId}`
    }
    arr.push({
      treeid: node.id,
      name,
      children: grandChildrenArr
    })
    if (depth > maxDepth) {
      maxDepth = depth
    }
  }
  const rootNode = data.find(item => item.id === data[0].id)
  const treeData = []
  pushData({ arr: treeData, node: rootNode })
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
  const treeWidth = insertChild(treeData[0].children, data[0].leftNodeid, data[0].rightNodeid, 1)
  // console.log(treeData)
  // console.log(maxHorizontalLength)
  return { data: treeData, size: data.length, maxDepth, treeWidth }
}
