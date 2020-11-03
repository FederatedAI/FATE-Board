
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

import { formatFloat } from '@/utils'
import { each } from './uitls'
import { createHeader } from './common'
import curry, { placeholder as _ } from 'lodash/curry'

const createHeaderItem = curry(createHeader)(_, _, { align: 'center' })

const getHeaderByType = type => [
  createHeaderItem('variable', 'variable'),
  createHeaderItem(`${type} value ratio`, 'ratio'),
  createHeaderItem('fill_value', 'value')
]

const getIndexedHeaderByType = type => {
  return [
    {
      label: 'index',
      width: 100,
      type: 'index'
    },
    ...getHeaderByType(type)
  ]
}

const getForm = title => ({
  type: 'form',
  props: {
    form: [
      {
        type: 'title',
        props: {
          title
        }
      },
      {
        type: 'search'
      }
    ]
  }
})

const iteratee = collection => {
  return (val, key) => {
    collection.push({
      variable: key,
      ratio: formatFloat(val.ratio),
      value: formatFloat(val.value)
    })
  }
}

const combineTo = (ratio, value) => {
  const result = {}
  for (const key in ratio) {
    result[key] = {
      ratio: ratio[key],
      value: value[key]
    }
  }
  return result
}

const sortBy = (list, name, sort) => {
  list.sort((a, b) => {
    const aIndex = sort.indexOf(a[name])
    const bIndex = sort.indexOf(b[name])
    if (aIndex > bIndex) {
      return 1
    } else if (aIndex < bIndex) {
      return -1
    } else {
      return 0
    }
  })
}

const wrapComponent = options => ({
  component: () => import('@/components/ComponentGroup'),
  options
})

function dataIOHandler(modelData) {
  const { data, meta } = modelData.data
  const originSort = data.header
  const imputerData = []
  const outlierData = []
  const { imputerParam, outlierParam } = data
  const { imputerMeta, outlierMeta } = meta ? meta.meta_data : {}
  const isExistImputerParams = imputerMeta && imputerMeta.isImputer
  const isExistOutlierParams = outlierMeta && outlierMeta.isOutlier

  const group = []

  if (isExistImputerParams) {
    each(combineTo(imputerParam.missingValueRatio, imputerParam.missingReplaceValue), iteratee(imputerData))
    sortBy(imputerData, 'variable', originSort)
    group.push(wrapComponent([
      getForm('Missing Fill Detail'),
      {
        type: 'table',
        props: {
          name: 'imputer',
          data: imputerData,
          header: getIndexedHeaderByType('imputer'),
          pageSize: 10,
          zeroFormat: '0'
        }
      }
    ]))
  }
  if (isExistOutlierParams) {
    each(combineTo(outlierParam.outlierValueRatio, outlierParam.outlierReplaceValue), iteratee(outlierData))
    sortBy(outlierData, 'variable', originSort)
    group.push(wrapComponent([
      getForm('Outlier Replace Detail'),
      {
        type: 'table',
        props: {
          name: 'outlier',
          data: outlierData,
          header: getIndexedHeaderByType('outlier'),
          pageSize: 10,
          zeroFormat: '0'
        }
      }
    ]))
  }

  return group
}

export default dataIOHandler
