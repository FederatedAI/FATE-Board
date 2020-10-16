<template>
  <el-row :gutter="24" class="dash-board-list">
    <el-col v-loading="loading" :span="8">
      <dataset-info :list="datasetInfo" />
    </el-col>

    <el-col v-loading="loading" :span="8">
      <job :data="jobDetail" @stop="onStop" @retry="onRetry" />
    </el-col>

    <el-col v-loading="loading" :span="8">
      <graph :dag-data="DAGData" />
    </el-col>
  </el-row>
</template>

<script>
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

import { mapActions, mapState, mapGetters } from 'vuex'
import DatasetInfo from './DatasetInfo'
import Job from './Job'
import Graph from './Graph'
import mixin from '../mixins'
import ReconnectingWebSocket from '@/utils/ReconnectingWebSocket'
import throttle from 'lodash/throttle'

const ROLE_ORDER_MAP = {
  GUEST: 1,
  HOST: 2,
  ARBITER: 3
}

const ascending = (a, b) => {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN
}

const getDatasetFromSummary = obj => {
  const { roles, dataset } = obj
  const result = Object.keys(roles).map(role => {
    const options = roles[role].map(item => ({ value: item, label: item }))
    return {
      role: role.toUpperCase(),
      options,
      roleValue: options[0].label,
      datasetData: dataset[role] || ''
    }
  })
  result.sort((a, b) => {
    return ascending(ROLE_ORDER_MAP[a.role], ROLE_ORDER_MAP[b.role])
  })

  return result
}

export default {
  components: {
    DatasetInfo,
    Job,
    Graph
  },
  mixins: [mixin],
  data() {
    return {
      loading: false
    }
  },
  computed: {
    ...mapGetters('job', {
      oldJobId: 'jobId'
    }),
    ...mapState('job', ['job']),
    datasetInfo() {
      const dataset =
				this.job && this.job.summary_date && this.job.summary_date.dataset
      if (!dataset) {
        return []
      }
      return getDatasetFromSummary(dataset)
    },
    jobDetail() {
      const job = this.job && this.job.summary_date && this.job.summary_date.job
      if (!job) {
        return {}
      }
      return {
        status: job.fStatus || this.job.status,
        elapsed: job.fElapsed,
        progress: job.fProgress || this.job.progress || 0,
        time: this.job.duration
      }
    },
    DAGData() {
      return this.job && this.job.dependency_data
    }
  },
  watch: {
    $route: {
      handler() {
        if (this.$route.query.job_id !== this.oldJobId) {
          this.cleanJob()
        }
        if (!this.job || !this.isDone(this.job.status)) {
          this.initJobSocket()
        }
      },
      immediate: true
    }
  },
  created() {
    this.handleMessage = throttle(this.handleMessage, 900, {
      leading: true
    })
  },
  beforeDestroy() {
    this.ws && this.ws.close()
  },
  methods: {
    ...mapActions('job', ['updateJob', 'cleanJob']),
    initJobSocket() {
      if (!this.ws) {
        const { jobId, role, partyId } = this
        if (!jobId || !role || !partyId) {
          console.warn(`Missing required parameters`)
        }
        this.ws = new ReconnectingWebSocket(
          `/websocket/progress/${jobId}/${role}/${partyId}`
        )
        this.loading = true
        this.ws.addEventListener('message', event => {
          this.loading = false
          let data
          try {
            data = JSON.parse(event.data)
          } catch (error) {
            data = null
            this.ws.close()
            return
          }
          this.handleMessage(data)
        })
      }
      return this.ws
    },
    isDone(status) {
      return ['success', 'complete', 'failed', 'canceled'].includes(status)
    },
    handleMessage(data) {
      if (this.isDone(data.status)) {
        this.ws && this.ws.close()
      }
      this.updateJob(data)
    },
    onStop(command) {
      this.ws.close()
      this.ws = null
      this.initJobSocket()
    },
    onRetry() {
      if (this.ws) {
        this.ws.close()
        this.ws = null
      }
      this.initJobSocket()
    }
  }
}
</script>

<style>
</style>
