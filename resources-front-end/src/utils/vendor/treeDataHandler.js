import { formatFloat } from '../index'

export default function(data, role, partyId, featureNameFidMapping, splitMaskdict, missingDirMaskdict) {
  if (data.length === 0) {
    return []
  }
  let maxDepth = 0
  const pushData = ({ arr, node, grandChildrenArr = [], depth = 0 }) => {
    const variable = featureNameFidMapping[node.fid]
    const splitValue = splitMaskdict[node.id]
    const nodeRole = node.sitename.split(':')[0]
    const nodePartyId = node.sitename.split(':')[1]
    // TODO
    let name = `ID: ${node.id}\n`
    // console.log(nodeRole, role, nodePartyId, partyId)
    if (nodeRole === role && nodePartyId === partyId && !node.isLeaf) {
      name += `${variable} <= ${splitValue}`
      if (missingDirMaskdict[node.id] !== 1) {
        name += '\nor missing'
      }
      name += '\n'
    }
    if (node.isLeaf && role === 'guest') {
      name += `weight: ${formatFloat(node.weight)}\n`
    }
    name += `${nodeRole && nodeRole.toUpperCase()}: ${nodePartyId}`
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
      insertChild(leftGrandChildrenArr, leftGranChildId, rightGranChildId, depth)
    }
    if (rightNode) {
      const rightGrandChildrenArr = []
      const rightGranChildId = rightNode.rightNodeid
      const leftGranChildId = rightNode.leftNodeid
      // 递归插入
      insertChild(rightGrandChildrenArr, leftGranChildId, rightGranChildId)
      pushData({ arr, node: rightNode, grandChildrenArr: rightGrandChildrenArr })
    }
  }

  insertChild(treeData[0].children, data[0].leftNodeid, data[0].rightNodeid, 1)
  // console.log(treeData)
  // console.log(maxHorizontalLength)
  return { data: treeData, size: data.length, maxDepth }
}
