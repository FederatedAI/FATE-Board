
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

import request from '@/utils/request'

export function getProjectList(params) {
  return request({
    url: '/project/query',
    method: 'get',
    params
  })
}

export function addChannel(data) {
  return request({
    url: '/channel/add',
    method: 'post',
    data
  })
}

export function updateChannel(data) {
  return request({
    url: '/channel/update',
    method: 'post',
    data
  })
}

export function deleteChannel(data) {
  return request({
    url: '/channel/delete',
    method: 'post',
    data
  })
}
