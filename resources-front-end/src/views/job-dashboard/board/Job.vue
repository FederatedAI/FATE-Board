<template>
  <div class="col job flex-center justify-center pos-r">
    <h3 class="list-title">Job</h3>
    <div v-if="isDone" class="job-end-container flex flex-col flex-center">
      <img
        :key="jobStatus"
        :src="jobStatus === 'success' || jobStatus === 'complete' ? icons.normal.success : icons.normal.failed"
        alt
        class="job-icon"
      >
      <ul class="job-info flex space-around flex-wrap w-100">
        <li>
          <p class="name">status</p>
          <p class="value">{{ jobStatus }}</p>
        </li>
        <li v-if="data.elapsed">
          <p class="name">duration</p>
          <p class="value">{{ data.elapsed | formatSeconds }}</p>
        </li>
        <li v-if="data.auc">
          <p class="name overflow-ellipsis">best score(AUC)</p>
          <p class="value">{{ data.auc }}</p>
        </li>
        <li v-if="data.ratio">
          <p class="name">ratio</p>
          <p class="value">{{ data.ratio }}</p>
        </li>
        <li v-if="data.count">
          <p class="name">count</p>
          <p class="value">{{ data.count }}</p>
        </li>
      </ul>
    </div>

    <div v-else-if="isDoing" class="echarts-container">
      <panel :progress="data.progress" :time="data.time" class="echarts" />
    </div>

    <div class="btn-wrapper flex flex-col flex-center pos-a">
      <el-button ref="jobDetails" type="primary" class="detail-entry-button" round @click="toDetails">
        <span>view this job</span>
        <i class="arrow" />
      </el-button>
      <p
        v-if="isDone && jobStatus !== 'success' && jobStatus !== 'complete'"
        class="kill text-primary pointer"
        style="margin-top: 10px"
        @click="retryJob"
      >retry</p>
      <p v-if="isDoing" class="kill text-primary pointer" @click="killJob">cancel</p>
    </div>

    <confirm ref="confirm" />
  </div>
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

import { mapGetters } from 'vuex'
import { formatSeconds } from '@/utils'
import Panel from '@/components/CanvasComponent/panelDiagram'
import Confirm from './Confirm'
import { killJob, retryJob } from '@/api/job'

export default {
  filters: {
    formatSeconds
  },
  components: {
    Panel,
    Confirm
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['icons']),
    jobStatus() {
      return this.data.status || ''
    },
    isDone() {
      return ['success', 'complete', 'failed', 'canceled'].includes(
        this.jobStatus
      )
    },
    isDoing() {
      return ['waiting', 'running'].includes(this.jobStatus)
    },
    confirmText() {
      if (this.isDone) {
        return [`The job will continue from where it ${this.jobStatus}`, '']
      } else if (this.isDoing) {
        const method = this.jobStatus === 'waiting' ? 'cancel' : 'cancel'
        return [
          `Are you sure you want to ${method} this job?`,
          "You can't undo this action，it may take few seconds to  update job status."
        ]
      }
      return ['', '']
    },
    query() {
      return {
        job_id: this.$route.query.job_id,
        // role: this.$route.query.role,
        // party_id: this.$route.query.party_id,
        component_name: 'pipeline'
      }
    }
  },
  methods: {
    toDetails() {
      const mid = {
        ...this.query,
        role: this.$route.query.role,
        party_id: this.$route.query.party_id,
        from: 'Dashboard'
      }
      delete mid.component_name
      this.$router.push({
        path: '/details',
        query: mid
      })
    },
    killJob() {
      if (this.isDoing) {
        const qu = Object.assign({}, this.query)
        delete qu.component_name
        this.$refs.confirm.confirm(...this.confirmText).then(() => {
          killJob(qu).then(() => {
            this.$emit('stop', this.jobStatus ? 'cancel' : 'kill')
          })
        })
      }
    },
    retryJob() {
      this.$refs.confirm.confirm(...this.confirmText).then(() => {
        retryJob(this.query).then(() => {
          this.$emit('retry')
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-entry-button {
	position: relative;
	&:hover {
		background-color: #494ece !important;
		color: #fff !important;
	}
	&:active {
		background-color: #3135a6 !important;
		color: #fff !important;
	}
	.arrow {
		display: inline-block;
		width: 12px;
		height: 12px;
		vertical-align: bottom;
		background-image: url('~@/icons/button.png');
		background-size: 100% auto;
	}
	&:hover {
		.arrow {
			background-image: url('~@/icons/button2.png');
		}
	}
}
</style>
