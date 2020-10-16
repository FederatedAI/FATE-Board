
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

const nameList = ['summary_date', 'dependency_data']

function mergeJob(source, target, nameList) {
  if (!source) {
    source = {}
  }
  const result = {}
  Object.keys(target).forEach(key => {
    if (nameList.indexOf(key) > -1) {
      result[key] = Object.assign({}, source[key], target[key])
    } else {
      result[key] = target[key]
    }
  })
  return result
}

export default {
  namespaced: true,
  state: {
    job: null
  },
  getters: {
    jobId(state) {
      return state.job && state.job.summary_date && state.job.summary_date.job && state.job.summary_date.job.fJobId
    }
  },
  mutations: {
    UPDATE_JOB(state, job) {
      state.job = mergeJob(state.job, job, nameList)
    },
    CLEAN_JOB(state) {
      state.job = null
    }
  },
  actions: {
    updateJob({ commit }, payload) {
      commit('UPDATE_JOB', payload)
    },
    cleanJob({ commit }) {
      commit('CLEAN_JOB')
    }
  }
}
