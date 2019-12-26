<template>
  <div v-loading="loading" class="running-container flex flex-center flex-col app-container">
    <ul class="job-list flex flex-center flex-wrap ie-ul">
      <li v-for="(item,index) in jobList" :key="index" class="shadow">
        <div class="top flex flex-center space-between">
          <span class="job-id">{{ item.jobId }}</span>
          <span
            class="enter text-primary pointer"
            @click="handleKillJob(item.jobId, item.role,item.partyId, item.status==='waiting'?'cancel':'kill', index)"
          >
            <!--{{ item.status==='waiting'?'cancel':'kill' }}-->
            {{ item.status==='waiting'?'cancel':'kill' }}
          </span>
        </div>
        <p class="role">Role: {{ item.role }}</p>
        <div class="status pos-r flex flex-center justify-center">
          <span
            :style="{'font-size':item.status==='waiting' || item.status==='faied'?'14px':'36px'}"
            class="text pos-a text-primary"
          >{{ item.status }}</span>
          <div
            :style="{display:item.status==='waiting'?'flex':''}"
            class="mask pos-a wh-100 flex flex-center justify-center ie-pos"
          >
            <el-button
              type="text"
              style="font-size: 18px;"
              @click="enter(item.jobId,item.role,item.partyId)"
            >Enter</el-button>
          </div>
          <el-progress
            :percentage="item.statusProgress"
            :show-text="false"
            :width="120"
            color="#494ece"
            type="circle"
          />
        </div>
        <!-- <runningSec
          :info="{jobId: item.jobId, status: item.status, role: item.role, partId:item.partId, status: item.status}"
          @enter="enter"
				/>-->
      </li>
    </ul>
    <el-dialog :visible.sync="showDialog" width="504px">
      <div class="dialog-main-content">{{ mainContent }}</div>
      <div class="dialog-sub-content">{{ subContent }}</div>
      <div class="flex justify-center" style="margin-top:48px;">
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
        >cancel</button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAllJobsStatus, killJob, getJobDetails } from '@/api/job'
// import { loading } from '@/mixin/loading'
// import runningSec from './runningSection'
// import { request } from '@/utils/tools'
// import { random } from '@/utils'

export default {
  components: {
    // runningSec
  },
  directives: {},
  // mixins: [loading],
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
    // console.log(process.env.WEBSOCKET_BASE_API)
    // this.initWebSocket()
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    // async httpRequest(resolve, reject) {
    //   // for requesting data
    //   await this.getJobList()
    //   resolve()
    // },

    // initing() {
    //   // for initing dom
    // },

    // setting() {
    //   // for initing data
    // },

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

      // request(getAllJobsStatus)(
      //   {
      //     jobId: 'fJobId',
      //     fStatus: 'fStatus',
      //     status: {
      //       imple: 'fStatus',
      //       callback: (data, obj) => {
      //         return data === 'running' ? (obj.fProgress || 0) + '%' : data
      //       }
      //     },
      //     statusProgress: {
      //       imple: 'fStatus',
      //       callback: (data, obj) => {
      //         return data === 'running' ? obj.fProgress || 0 : data
      //       }
      //     },
      //     role: 'fRole',
      //     partyId: 'fPartyId'
      //   },
      //   'data',
      //   data => {
      //     console.log(data)
      //   }
      // )
    },
    enter(job_id, role, party_id) {
      this.$router.push({
        path: '/dashboard',
        query: { job_id, role, party_id }
      })
    },
    handleKillJob(job_id, role, party_id, method, index) {
      const para = { job_id, role, party_id }
      getJobDetails(para).then(res => {
        const { job } = res.data
        const status = job.fStatus
        if (status === 'waiting') {
          if (method === 'kill') {
            this.jobList[index].status = status
            this.jobList.splice()
          }
          method = 'cancel'
        } else {
          if (method === 'cancel') {
            method = 'kill'
            this.jobList[index].status = status
            this.jobList.splice()
          }
        }
        this.checkSure = true
        this.confirmKill(para, method)
      })
      // this.confirmKill(para)
    },
    confirmKill(para, method) {
      this.mainContent = `Are you sure you want to ${method} this job?`
      this.subContent = "You can't undo this action"
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
      killJob(para).then(res => {
        // console.log('kill job:' + jobId)
        this.getJobList()
        vm.closeDialog()
      })
    }
  }
}
</script>

<style lang="scss">
@import '../../styles/running';

.ie-ul {
	width: 100%;
}

.ie-pos {
	top: 0;
	left: 0;
}

.dialog-main-content {
	font-family: 'Lato';
	font-size: 18px;
	color: #534c77;
	text-align: center;
	font-weight: bold;
}

.dialog-sub-content {
	font-family: 'Lato';
	font-size: 16px;
	color: #bbbbc8;
	text-align: center;
}

.dialog-button {
	width: 110px;
	height: 32px;
	border-radius: 16px;
	border: 0px;
	font-family: 'Lato';
	font-weight: bold;
	font-size: 16px;
	text-align: 'center';
	cursor: pointer;
	outline: none;
}

.dialog-check-button {
	color: #ffffff;
	background-color: #494ece;
}

.dialog-click-button {
	color: #ffffff;
	background-color: #3135a6;
}

.dialog-uncheck-button {
	color: #7f7d8e;
	background-color: #e8e8ef;
}
</style>
