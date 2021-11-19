
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

const getHeaders = () => [
  {
    type: 'index',
    label: 'index'
  },
  {
    prop: 'value',
    label: 'value'
  },
  {
    prop: 'encoded_vector',
    label: 'encoded_vector'
  }
]

const fn = (modelData) => {
  const data = modelData.data.data && modelData.data.data.colMap
  const options = []
  const variableData = {}
  if (data && Object.keys(data).length > 0) {
    Object.keys(data).forEach(key => {
      options.push({
        value: key,
        label: key
      })
      variableData[key] = []
      data[key].transformedHeaders.forEach((item, index) => {
        variableData[key].push({
          encoded_vector: item,
          value: data[key].values[index]
        })
      })
    })
    return [{
      component: () => import('@/components/ComponentGroup'),
      options: [{
        type: 'form',
        props: {
          form: [
            {
              type: 'f-select',
              name: 'f-selection',
              props: {
                options: options
              }
            }
          ]
        }
      },
      {
        type: 'table',
        props: {
          data: variableData,
          header: getHeaders(),
          export: 'encode_detail'
        }
      }]
    }]
  } else {
    return []
  }
}

export default fn
