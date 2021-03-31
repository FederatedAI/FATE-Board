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
import { wrapGroupComponent } from '../fn/common'
import { each } from '../fn/uitls'
// import { wrapGroupComponent } from '../fn/common'

const createHeader = (prop, label, other) => {
  if (label == null) {
    label = prop
  }
  if (typeof label === 'object' && other == null) {
    other = label
  }
  return Object.assign({ prop, label }, other)
}

const getHeaderByType = () => [
  createHeader('', 'index', { type: 'index' }),
  createHeader('label', 'label'),
  createHeader('weight', 'weight')
]

const getWeightTableBasicContent = (classWeight, order) => {
  const res = []
  each(order, (val) => {
    res.push({
      label: val,
      weight: classWeight[val]
    })
  })
  return res
}

const getAllSelection = (content) => {
  return {
    type: 'f-select',
    props: {
      options: (() => {
        const options = []
        options.push({
          label: 'all',
          value: 'default'
        })
        each(content, (val) => {
          options.push({
            label: val.label,
            value: 'label' + val.label
          })
        })
        return options
      })(),
      styles: 'width:auto;'
    }
  }
}

const getFinalContent = (basicContent) => {
  const chooseableContent = {
    default: basicContent
  }
  each(basicContent, (val) => {
    chooseableContent[`label${val.label}`] = [
      val
    ]
  })
  return chooseableContent
}

const fn = (response) => {
  const finalGroup = []
  each(response, (item, namespace) => {
    each(item, (content, keyword) => {
      const { meta } = content
      const { weight_mode, class_weight, classes, sample_weight_name } = meta

      const header = getHeaderByType()

      const group = []
      const form = []

      let basicContent = []
      let selection = []
      let tableData = null

      form.push({
        type: 'text',
        props: {
          content: `weight mode: ${weight_mode}`
        }
      })
      if (sample_weight_name) {
        form.push({
          type: 'text',
          props: {
            content: `column name: ${sample_weight_name}`
          }
        })
      }
      if (class_weight && Object.keys(class_weight).length > 0) {
        basicContent = getWeightTableBasicContent(class_weight, classes)
        selection = getAllSelection(basicContent)
        tableData = getFinalContent(basicContent)
        form.push(selection)
      }

      group.push({
        type: 'form',
        props: {
          form
        }
      })
      if (tableData) {
        group.push({
          type: 'table',
          props: {
            header,
            data: tableData
          }
        })
      }
      finalGroup.push(...group)
    })
  })
  return finalGroup.length > 0 ? wrapGroupComponent(finalGroup) : null
}

export default fn

