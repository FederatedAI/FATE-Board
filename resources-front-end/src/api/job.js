
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

export function getAllJobs({ total, pno, psize = 10 }) {
  return request({
    url: `/job/query/all/${total}/${pno}/${psize}`,
    method: 'get',
    params: {}
  })
}
export function queryJobs(data) {
  return request({
    // url: '/job/query/page',
    url: '/job/query/page/new',
    method: 'post',
    data
  })
}
export function getJobsTotal() {
  return request({
    url: '/job/query/totalrecord',
    method: 'get',
    params: {}
  })
}

export function getAllJobsStatus(params) {
  return request({
    url: '/job/query/status',
    method: 'get',
    params
  })
}

export function killJob(data) {
  return request({
    url: '/job/v1/pipeline/job/stop',
    method: 'post',
    data
  })
}

export function retryJob(data) {
  return request({
    url: '/job/v1/rerun',
    method: 'post',
    data
  })
}

export function getJobDetails({ job_id, role, party_id }) {
  return request({
    url: `/job/query/${job_id}/${role}/${party_id}`,
    method: 'get'
  })
}

export function getDAGDpencencies(data) {
  return request({
    url: '/v1/pipeline/dag/dependencies',
    method: 'post',
    data
  })
}

export function getComponentPara(data) {
  return request({
    url: '/v1/tracking/component/parameters',
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

export function queryLog({ componentId, job_id, role, party_id, begin, end, type }) {
  return request({
    url: `/queryLogWithSize/${job_id}/${role}/${party_id}/${componentId}/${type}/${begin}/${end}`,
    method: 'get'
  })
}

export function queryLogSize({ componentId = 'default', job_id, role, party_id, type }) {
  return request({
    url: `/queryLogSize/${job_id}/${role}/${party_id}/${componentId}/${type}`,
    method: 'get'
  })
}

export function addNotes(data) {
  return request({
    url: '/job/update',
    method: 'put',
    data
  })
}

export function getComponentCommand(data) {
  return request({
    url: '/job/componentCommand',
    method: 'post',
    data
  })
}

export function queryFileds() {
  return request({
    url: '/job/query/fields',
    method: 'post'
  })
}

export function jobDownload(data) {
  return request({
    url: '/job/download',
    method: 'post',
    responseType: 'blob',
    data
  })
}
