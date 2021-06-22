import { each } from '../fn/uitls'
import { createFormComponent } from '../fn/common'

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
const treeIDTableHeader = [{
  type: 'index',
  label: 'index',
  width: '70px'
}, {
  label: 'leaf_id',
  prop: 'leafId',
  showOverflowTooltip: true
}, {
  label: 'transformed_vector',
  prop: 'vector',
  showOverflowTooltip: true
}]

const tableContent = (idList, vector) => {
  const tableDefatult = []
  each(idList, (value, key) => {
    tableDefatult.push({
      leafId: value,
      vector: vector[key]
    })
  })
  return tableDefatult
}

const belongTo = (vector) => {
  return vector.split('_')[1]
}

const checkSplit = (idList, vector) => {
  const defaultContent = tableContent(idList, vector)
  const selectable = []
  const afterSplit = {}
  each(defaultContent, (item) => {
    const bt = belongTo(item.vector)
    const implyTo = 's_' + bt
    if (!afterSplit[implyTo]) {
      afterSplit[implyTo] = []
      selectable.push({ label: bt, value: implyTo })
    }
    afterSplit[implyTo].push(item)
  })
  if (selectable.length > 1) {
    return {
      selection: selectable,
      content: afterSplit
    }
  } else {
    return {
      content: afterSplit[selectable[0].value]
    }
  }
}

const selectionCreate = (group, selection) => {
  group.push({
    type: 'form',
    props: {
      form: [createFormComponent('f-select', 'f-select', {
        options: selection,
        label: 'transformer_tree_id'
      })]
    }
  })
}

const tableCreate = (group, content) => {
  group.push({
    type: 'table',
    props: {
      header: treeIDTableHeader,
      data: content,
      zeroFormat: '0',
      export: 'sbt_feature_transformer'
    }
  })
}

const fn = (response) => {
  if (response && response.sbt_transformer && response.sbt_transformer.leaf_mapping) {
    const group = []
    const { feat_name, index } = response.sbt_transformer.leaf_mapping.meta
    const content = checkSplit(index, feat_name)
    if (content.selection && content.selection.length > 1) {
      selectionCreate(group, content.selection)
    }
    tableCreate(group, content.content)
    return group
  }
}

export default fn
