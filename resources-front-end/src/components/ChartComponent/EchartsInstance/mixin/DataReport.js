
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

const pictureReport = {
  methods: {
    getPicture(settings) {
      if (!settings && this.instance && Object.keys(this.currentOptions).length > 0 && !this.showNoData) {
        return this.instance.getDataURL()
      } else if (settings) {
        return this.drawAndGet(settings)
      } else {
        return false
      }
    },
    drawAndGet(settings) {
      let res = {}
      const vm = this
      if (!settings.series) {
        for (const key in settings) {
          if (vm.refresh(settings[key])) {
            res[key] = vm.getPicture()
          }
        }
      } else {
        if (vm.refresh(settings)) {
          res = vm.getPicture()
        }
      }
      vm.refresh()
      return res
    }
  }
}

export default pictureReport
