
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

export default {
  components: {
    ccheckbox: () => import('../Checkbox'),
    cradio: () => import('../Radio'),
    ceditor: () => import('../Editor'),
    cinput: () => import('../Input'),
    cselect: () => import('../Select'),
    cstep: () => import('../Step'),
    ctext: () => import('../Text'),
    cselection: () => import('../Selection'),
    ctitle: () => import('../Text/Title'),
    csearch: () => import('../Searching'),
    cbutton: () => import('../Button'),
    clegend: () => import('../Legend')
  },
  exchangeTo(stats) {
    return 'c' + stats
  }
}
