
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

// import { formatFloat } from '@/utils'
import { each, sortByName } from '../fn/uitls'
import isObject from 'lodash/isObject'

const header = [
  {
    label: '',
    prop: 'name'
  },
  {
    label: 'model label',
    prop: 'modelLabel'
  },
  {
    label: 'dataset',
    prop: 'dataset'
  },
  {
    label: 'auc',
    prop: 'auc'
  },
  {
    label: 'ks',
    prop: 'ks'
  }
]

const groupType = (content) => {
  return {
    type: 'group',
    props: {
      options: content
    }
  }
}

const toSelect = (selectable) => {
  return {
    type: 'f-select',
    name: 'f-select',
    props: {
      label: 'select model',
      options: (() => {
        const res = []
        each(selectable, (item) => {
          res.push({
            label: item,
            value: item
          })
        })
        return res
      })()
    }
  }
}

const contentAndSelection = (data) => {
  const datalist = {}
  const selection = []
  const namespaces = []
  each(data, (res, namespace) => {
    namespaces.push(namespace)
    each(res, (item, name) => {
      const meta = item.meta
      each(meta, (content, kw) => {
        if (isObject(content)) {
          if (!datalist[meta.name]) {
            datalist[meta.name] = []
            selection.push(meta.name)
          }
          datalist[meta.name].push({
            name: name.replace('_ovr', ''),
            modelLabel: kw,
            dataset: namespace,
            auc: meta[kw].auc,
            ks: meta[kw].ks
          })
        }
      })
    })
  })
  if (Array.isArray(datalist)) {
    sortByName(datalist, 'name')
    sortByName(datalist, 'modelLabel')
  } else {
    each(datalist, (val) => {
      sortByName(val, 'name')
      sortByName(val, 'modelLabel')
    })
  }
  if (selection.length > 1) {
    sortByName(selection)
    return {
      select: toSelect(selection),
      data: datalist,
      namespaces
    }
  } else {
    if (selection.length === 1) {
      return {
        select: selection,
        data: datalist[selection[0]],
        namespaces
      }
    }
  }
}

// const createAsyncOption = (name, props, method, transform, exportName, detail) => ({
//   name,
//   props,
//   method,
//   transform,
//   export: exportName,
//   detail
// })

export default function(response) {
  const group = []
  const { select = null, data } = contentAndSelection(response)
  const form = [{
    type: 'title',
    props: {
      title: 'One_vs_Rest Evaluation',
      styles: 'min-width: 300px;'
    }
  }]
  if (select.length > 1) {
    form.push(select)
  }
  group.push(groupType([{
    type: 'form',
    props: {
      form,
      inrow: true,
      rowDir: 'right'
    }
  }, {
    type: 'table',
    props: {
      header,
      data,
      export: 'OneVsRestEvaluation'
    }
  }]))

  // const options = []
  // each(namespaces, (ns) => {
  //   options.push(createAsyncOption(
  //     'ovr_' + ns,
  //     {
  //       tableData: data,
  //       namespace: ns
  //     },
  //     (res) => res,
  //     contentToChart,
  //     'one_vs_rest',
  //     true
  //   ))
  // })
  // group.push(groupType([{
  //   type: 'form',
  //   props: {
  //     form: [
  //       {
  //         type: 'f-tabs',
  //         props: {
  //           tabs: [{
  //             label: 'One vs Rest',
  //             children: (() => {
  //               const res = []
  //               each(namespaces, (val) => {
  //                 res.push({
  //                   label: val,
  //                   value: 'ovr_' + val
  //                 })
  //               })
  //               return res
  //             })()
  //           }]
  //         }
  //       }
  //     ]
  //   }
  // }, createAsyncComponent(options)]))
  return group
}

