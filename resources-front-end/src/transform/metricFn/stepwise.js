
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

import { createTables, wrapForm, formOption, createOption } from '../fn/common'
import { each } from '../fn/uitls'
import stepwiseDataHandler from '@/utils/vendor/stepwiseDataHandler'

const createStepOptions = (steps) => {
  const result = []
  steps.forEach((step, index) => {
    result.push(createOption(index))
  })
  return result
}

const createStepTables = (steps) => {
  const stepTables = []
  if (steps.length === 0) return
  steps[0].tables.forEach((table, tindex) => {
    const tbodys = {}
    stepTables.push(table)
    steps.forEach((step, index) => {
      index++
      tbodys[index] = step.tables[tindex].tbody
    })
    stepTables[tindex].tbody = tbodys
  })
  return createTables(stepTables, 'text')
}

function stepExchange(res, role) {
  const original = { steps: [], summary: { tables: [] }}
  let stepComponent = []
  const resultList = []
  each(res.data.train, r => {
    resultList.push(r)
  })
  resultList.forEach(r => {
    stepwiseDataHandler(original, null, r.meta, role)
  })
  if (original.steps.length > 0) {
    stepComponent = [
      {
        component: () => import('@/components/ComponentGroup'),
        options: createTables(original.common, 'title')
      },
      {
        component: () => import('@/components/ComponentGroup'),
        options: [
          wrapForm([
            formOption('f-step', {
              options: createStepOptions(original.steps)
            }),
            formOption('title', {
              title: 'Steps:'
            })
          ]),
          ...createStepTables(original.steps)
        ]
      },
      {
        component: () => import('@/components/ComponentGroup'),
        options: createTables(original.summary.tables, 'text')
      }
    ]
  }
  return stepComponent
}

export default stepExchange
