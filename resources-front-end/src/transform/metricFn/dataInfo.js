
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

import { createHeader } from '../fn/common.js'
import { each, sortByName } from '../fn/uitls'

const getHeader = () => {
  return [
    { type: 'index', label: 'index' },
    createHeader('variable', 'variable', { sortable: true }),
    createHeader('samples', 'samples')
  ]
}

const fn = (response) => {
  const tableInfo = response.reader_name.meta.table_info
  const tableData = []
  each(tableInfo, (samples, variable) => {
    const dataItem = {}
    dataItem['variable'] = variable
    dataItem['samples'] = samples
    tableData.push(dataItem)
  })

  sortByName(tableData, 'variable')
  const group = []
  const meta = response.reader_name && response.reader_name.meta
  if (meta) {
    if (meta.file_path) {
      group.push({
        type: 'text',
        props: {
          content: 'file path: ' + meta.file_path,
          className: 'small-form-text'
        }
      })
    }
    if (meta.file_count) {
      group.push({
        type: 'text',
        props: {
          content: 'file count: ' + meta.file_count,
          className: 'small-form-text'
        }
      })
    }
    group.push(...[{
      type: 'text',
      props: {
        content: 'namespace: ' + response.reader_name.meta.namespace,
        className: 'small-form-text'
      }
    }, {
      type: 'text',
      props: {
        content: 'name: ' + response.reader_name.meta.table_name,
        className: 'small-form-text'
      }
    }])
    if (meta.count) {
      group.push({
        type: 'text',
        props: {
          content: 'count: ' + meta.count,
          className: 'small-form-text'
        }
      })
    }
    group.push(...[{
      type: 'text',
      props: {
        content: 'partitions: ' + response.reader_name.meta.partitions,
        className: 'small-form-text'
      }
    }, {
      type: 'text',
      props: {
        content: 'storage engine: ' + response.reader_name.meta.storage_engine,
        className: 'small-form-text'
      }
    }])
    if (tableData.length > 0) {
      group.push(...[{
        type: 'form',
        props: {
          form: [
            { type: 'search' }
          ]
        }
      }, {
        type: 'table',
        props: {
          data: tableData,
          header: getHeader(),
          zeroFormat: '0',
          export: response.reader_name.meta.table_name,
          pageSize: -1
        }
      }])
    }
  }
  return group
}

export default fn
