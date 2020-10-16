<template>
  <div v-loading="loading" class="running-container flex flex-center flex-col app-container">
    <ul class="job-list flex flex-center flex-wrap ie-ul">
      <li v-for="(item,index) in jobList" :key="index" class="shadow">
        <job-running
          :job-id="item.jobId"
          :role="item.role"
          :status="item.status"
          @enter="enter(item.jobId,item.role,item.partyId)"
          @kill="handleKillJob(item.jobId, item.role,item.partyId, 'cancel', index)"
        />
      </li>
    </ul>
    <el-dialog :visible.sync="showDialog" width="510px">
      <div class="dialog-main-content">{{ mainContent }}</div>
      <div class="dialog-sub-content">{{ subContent }}</div>
      <div class="flex justify-center" style="margin-top:72px;">
        <button
          :class="[checkSure === true? 'dialog-check-button':'dialog-uncheck-button', checkclick === true? 'dialog-click-button' : '']"
          class="dialog-button"
          @mouseover="checkSure=true"
          @mouseout="checkSure=null;checkclick=null"
          @mousedown="checkclick=true"
          @click="sureKillJob"
        >Sure</button>
        <button
          :class="[checkSure === false ? 'dialog-check-button':'dialog-uncheck-button', checkclick === false ? 'dialog-click-button' : '']"
          class="dialog-button"
          style="margin-left: 23px;"
          @mouseover="checkSure=false"
          @mouseout="checkSure=null;checkclick=null"
          @mousedown="checkclick=false"
          @click="closeDialog"
        >Cancel</button>
      </div>
    </el-dialog>
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

import { getAllJobsStatus, killJob } from '@/api/job'
import jobRunning from './JobRunning'

export default {
  components: {
    jobRunning
  },
  directives: {},
  data() {
    return {
      loading: true,
      jobList: [],
      timer: null,
      showDialog: false,
      mainContent: '',
      subContent: '',
      checkSure: null,
      checkclick: null,
      willKill: ''
      // customerloading had mixin into vue instance
    }
  },
  mounted() {
    this.getJobList()
    this.timer = setInterval(this.getJobList, 5000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    getJobList() {
      const jobList = []
      getAllJobsStatus()
        .then(res => {
          res.data.forEach(job => {
            const {
              fJobId: jobId,
              fStatus: status,
              fRole: role,
              fPartyId: partyId
            } = job
            const progress = job.fProgress || 0
            const statusDisplay = status === 'running' ? `${progress}%` : status
            jobList.push({
              jobId,
              fStatus: status,
              status: statusDisplay,
              statusProgress: status === 'running' ? progress : 0,
              role,
              partyId
            })
          })
          this.jobList = jobList
          // console.log(this.jobList)
        })
        .then(res => {
          this.loading = false
        })
    },
    enter(job_id, role, party_id) {
      window.open(
        this.$router.resolve({
          path: '/dashboard',
          query: { job_id, role, party_id }
        }).href,
        '_blank'
      )
    },
    handleKillJob(job_id, role, party_id, method, index) {
      const para = { job_id, role, party_id }
      this.checkSure = true
      this.confirmKill(para, method)
      // this.confirmKill(para)
    },
    confirmKill(para, method) {
      this.mainContent = `Are you sure you want to ${method} this job?`
      this.subContent = "You can't undo this action，it may take few seconds to  update job status."
      this.showDialog = true
      this.willKill = para
    },
    sureKillJob() {
      this.submitKillJob(this.willKill)
    },
    closeDialog() {
      this.showDialog = false
      this.willKill = ''
    },
    submitKillJob(para) {
      const vm = this
      const mid = {
        job_id: para.job_id
      }
      killJob(mid)
        .then(
          res => {
            this.getJobList()
            vm.closeDialog()
          },
          err => {
            vm.closeDialog()
            throw err
          }
        )
        .catch(err => {
          vm.closeDialog()
          throw err
        })
    }
  }
}
</script>

<style lang="scss">
@import '../../styles/running';
</style>
