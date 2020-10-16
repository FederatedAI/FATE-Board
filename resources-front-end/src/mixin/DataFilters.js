
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

const DataFilter = {
  data() {
    return {
      property: ''
    }
  },
  created() {
    this.initProperty()
  },
  methods: {
    initProperty() {
      this.property = ''
    },

    setProperty(value) {
      this.property = value
    },

    propfilter(data) {
      if (!Array.isArray(data) && this.property) {
        const res = []
        const list = Array.isArray(this.property)
          ? this.property
          : (this.property ? [this.property] : [])
        for (const val of list) {
          if (data[val]) {
            if (Array.isArray(data[val])) {
              res.push(...data[val])
            } else {
              res.push(data[val])
            }
          }
        }
        return res
      } else if (Array.isArray(data)) {
        return data
      }
      return []
    }
  }
}

export default DataFilter
