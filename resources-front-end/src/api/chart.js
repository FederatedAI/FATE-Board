
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

export function getMetrics(data) {
  return request({
    url: '/v1/tracking/component/metrics',
    method: 'post',
    data
  })
}
export function getMetricData(data) {
  return request({
    url: '/v1/tracking/component/metric_data',
    method: 'post',
    data
  })
}

export function getMetricsData(data) {
  return request({
    url: '/v1/tracking/component/metric_data/batch',
    method: 'post',
    data
  })
}

export function getDataOutput(data) {
  return request({
    url: '/v1/tracking/component/output/data',
    method: 'post',
    data
  })
}
export function getModelOutput(data) {
  return request({
    url: '/v1/tracking/component/output/model',
    method: 'post',
    data
  })
}

