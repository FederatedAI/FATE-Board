
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

import { createHeader, each } from '../fn/uitls'
import { uniqueArr } from '../../utils'

const sum = (...args) => {
  let result = 0
  while (args.length) {
    const i = args.shift()
    result += i
  }
  return result
}

function handler(confusionMat, f1Score) {
  const header = [
    createHeader('effect', ''),
    createHeader('dataset'),
    createHeader('f1score', 'F1-score'),
    createHeader('labels', 'true label/predict label', {
      renderHeader(h, { column, $index }) {
        return h('p', {
          class: 'mult-title'
        }, [
          h('span', {
            class: 'true-label'
          }, 'true label'),
          h('span', {
            class: 'split-inline'
          }),
          h('span', {
            class: 'predict-label'
          }, 'predict label')
        ])
      }
    }),
    createHeader('0'),
    createHeader('1')
  ]
  const confusionMatNamespaces = Object.keys(confusionMat)
  const f1ScoreNamespaces = Object.keys(f1Score)
  const namespaces = uniqueArr([...confusionMatNamespaces, ...f1ScoreNamespaces])

  const tableData = []

  namespaces.forEach(namespace => {
    each(confusionMat[namespace], ({ meta }, name) => {
      const effect = meta.name.replace(/(_confusion_mat|_f1_score)$/g, '')
      if (!tableData[effect]) {
        tableData[effect] = []
      }

      const row = {
        effect,
        dataset: namespace
      }

      const { fn, fp, tn, tp, thresholds } = meta
      const originF1score = f1Score[namespace][effect + '_f1_score'].meta.f1_scores
      const f1score = []
      const arr0 = []
      const arr1 = []
      const arr2 = []
      const arr3 = []
      let step = 0
      while (step <= 100) {
        const key = step / 100
        const i = thresholds.findIndex((val) => val === key)
        // if (thresholds[i] === key || i === 0) {
        const _fn = fn[i]
        const _fp = fp[i]
        const _tn = tn[i]
        const _tp = tp[i]
        f1score.push([key, originF1score[i]])
        arr0.push([key, `${_tn}(${(_tn / sum(_fn, _fp, _tn, _tp) * 100).toFixed(4)}%)`])
        arr1.push([key, `${_fp}(${(_fp / sum(_fn, _fp, _tn, _tp) * 100).toFixed(4)}%)`])
        arr2.push([key, `${_fn}(${(_fn / sum(_fn, _fp, _tn, _tp) * 100).toFixed(4)}%)`])
        arr3.push([key, `${_tp}(${(_tp / sum(_fn, _fp, _tn, _tp) * 100).toFixed(4)}%)`])
        // }
        step += 1
      }
      tableData.push(Object.assign({
        labels: '0',
        0: arr0,
        1: arr1,
        f1score
      }, row))

      tableData.push(Object.assign({
        labels: 1,
        0: arr2,
        1: arr3,
        f1score
      }, row))
    })
  })

  const form = {
    type: 'form',
    props: {
      form: [
        {
          type: 'title',
          props: {
            title: 'Confusion Matrix'
          }
        },
        {
          type: 'f-range',
          props: {
            label: 'Classification Threshold',
            max: 1,
            min: 0,
            step: 0.01,
            value: 0.5,
            tip: 'Update the confusion matrix information under the new threshold condition'
          }
        }
      ]
    }
  }

  const table = {
    type: 'table',
    props: {
      header,
      data: tableData,
      pageSize: 'all',
      zeroFormat: '0',
      export: 'confusion_matrix'
    }
  }

  const group = [
    form,
    table
  ]

  return group
}

export default handler
