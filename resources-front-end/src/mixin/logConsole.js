
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

/**
 * Logger for front-end catch
 * 1. Save for log
 * 2. Log level check
 * 3. Log-gzip
 * 4. Check poistion according to code
 */
import Logger from '@/util/vender/FrontEndLogger'

const log = {
  methods: {
    throwError(item, error) {
      let param = item
      if (typeof item !== 'object') {
        param = {
          type: 'error',
          text: item.toString()
        }
      }
      Logger[param + 'Catch'](param, error)
    },

    consoleError(type) {
      Logger.console(type)
    },

    necessaryParam(...args) {
      args.forEach(item => {
        if (!item) {
          const errObj = new Error('Missing necessary parameter')
          this.throwError({
            type: 'Error',
            err: 'MissVariableError',
            text: 'Missing necessary parameter - necessaryParam'
          }, errObj)
          throw errObj
        }
      })
    }
  }
}

export default log
