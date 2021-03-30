<template>
  <div class="app-container flex flex-col history-container bg-dark" @click="uploadEditor($event)">
    <breadcrumb-ext :breads="[{type:'content', val:'Job Overview'}]" />
    <div class="tool-bar flex flex-center flex-end">
      <div class="tool-item">
        <span class="title">Job ID:</span>
        <el-input
          v-model="condition.job_id"
          :size="'mini'"
          clearable
          @keyup.native.enter="search"
          @clear="search"
        />
      </div>
      <div class="tool-item">
        <span class="title">Role:</span>
        <el-select v-model="condition.role" :size="'mini'" collapse-tags multiple placeholder>
          <el-option
            v-for="item in roleOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </div>
      <div class="tool-item">
        <span class="title">Party ID:</span>
        <el-input
          v-model="condition.party_id"
          :size="'mini'"
          clearable
          @keyup.native.enter="search"
          @clear="search"
        />
      </div>
      <div class="tool-item">
        <span class="title">Partner:</span>
        <el-input
          v-model="condition.partner"
          :size="'mini'"
          clearable
          @keyup.native.enter="search"
          @clear="search"
        />
      </div>
      <div class="tool-item">
        <span class="title">Status:</span>
        <el-select v-model="condition.status" :size="'mini'" collapse-tags multiple placeholder>
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </div>
      <div class="tool-item">
        <span class="title">Note:</span>
        <el-input
          v-model="condition.note"
          :size="'mini'"
          clearable
          @keyup.native.enter="search"
          @clear="search"
        />
      </div>
      <el-button :size="'mini'" type="primary" round @click="search">Search</el-button>
    </div>
    <div v-loading="listLoading" class="flex flex-col space-between table-wrapper">
      <el-table
        ref="currentRowTable"
        :data="list"
        :row-class-name="tableRowClassName"
        :header-row-class-name="'t-header'"
        fit
        element-loading-text="Loading"
        highlight-current-row
        empty-text="NO DATA"
        height="100%"
        @current-change="setCurrentRow"
        @sort-change="sortChange"
      >
        <template v-for="item in tHead">
          <el-table-column
            v-if="!item.hidden"
            :key="item.key"
            :prop="item.key"
            :label="item.label"
            :width="item.width"
            :min-width="item.minWidth"
            :sortable="item.sortable"
            :show-overflow-tooltip="item.label !== 'Notes'"
            border
          >
            <template slot-scope="scope">
              <span
                v-if="item.key==='jobId'"
                class="text-primary pointer"
                @click="toDetailes(scope.row[item.key],scope.row['role'],scope.row['partyId'])"
              >{{ scope.row[item.key] }}</span>
              <div v-else-if="item.key==='status'">
                <div v-if="scope.row.progress || scope.row.progress===0">
                  <div class="progress-wrapper flex flex-center">
                    <div class="progress-bg">
                      <div :style="{width:`${scope.row.progress}%`}" class="progress-block" />
                    </div>
                    <span class="progress-text">{{ scope.row.progress }}%</span>
                  </div>
                </div>
                <div v-else>{{ scope.row[item.key] }}</div>
              </div>
              <div v-else-if="item.key==='notes'">
                <div v-if="!scope.row.notesEdit" class="flex flex-row flex-start flex-center">
                  <el-tooltip
                    :content="scope.row[item.key]"
                    :disabled="willshowingToolTip(scope)"
                    effect="dark"
                    placement="top-end"
                  >
                    <span class="notes-showing">{{ scope.row[item.key] }}</span>
                  </el-tooltip>
                  <icon-hover-and-active
                    :default-url="icons.normal['edit']"
                    :hover-url="icons.hover['edit']"
                    :active-url="icons.active['edit']"
                    @clickFn="editorNoteForJob(scope)"
                  />
                </div>
                <div
                  v-else-if="scope.row.notesEdit"
                  class="flex flex-row flex-start flex-center"
                  @click.stop="stopToTop($event)"
                >
                  <el-input
                    v-model="editorText"
                    :ref="scope.column.id+'_'+scope.$index"
                    placeholder="please enter"
                    class="notes-editor"
                    @keyup.native.enter="uploadEditor($event)"
                  />
                  <i class="el-icon-check" @click.self="uploadEditor($event)" />
                  <i class="el-icon-close" @click.self="closeEditor(scope)" />
                </div>
              </div>
              <div v-else-if="item.key === 'action'">
                <el-button
                  class="action-button"
                  type="text"
                  @click="onRetry(scope.row)"
                >{{ scope.row.status === 'failed' || scope.row.status === 'canceled' ? 'retry' : scope.row.status === 'waiting' || scope.row.status === 'running' ? 'cancel' : '' }}</el-button>
              </div>
              <span v-else>{{ scope.row[item.key] }}</span>
            </template>
          </el-table-column>
        </template>
      </el-table>
      <pagination
        :total="total"
        :page.sync="page"
        :layout="'prev, pager, next'"
        :limit.sync="pageSize"
        :position="'center'"
        @pagination="handlePageChange"
      />
      <!--<header-select :options="roleOptions"/>-->
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

import Pagination from '@/components/Pagination'
import { parseTime, formatSeconds, deepClone } from '@/utils'
import { mapGetters } from 'vuex'
import { queryJobs, addNotes, killJob, retryJob, queryFileds } from '@/api/job'
import IconHoverAndActive from '@/components/IconHoverAndActive'
import BreadcrumbExt from '@/components/BreadcrumbExt'
import Confirm from '@/views/job-dashboard/board/Confirm'

export default {
  name: 'Job',
  components: {
    Pagination,
    IconHoverAndActive,
    BreadcrumbExt,
    Confirm
  },
  filters: {},
  data() {
    return {
      list: null,
      condition: {
        role: '',
        status: '',
        job_id: '',
        party_id: '',
        note: '',
        orderRule: 'desc',
        // orderField: 'f_start_time'
        orderField: 'f_job_id',
        partner: ''
      },
      currentRow: 1,
      saveCondition: {},
      tHead: [
        {
          key: 'jobId',
          label: 'ID',
          width: 250
        },
        {
          key: 'role',
          label: 'Role',
          width: 100
        },
        {
          key: 'partyId',
          label: 'Party ID',
          width: 100
        },
        {
          key: 'partner',
          label: 'Partner',
          width: 100
        },
        {
          key: 'start_time',
          label: 'Start Time',
          width: 200,
          sortable: 'custom'
        },
        {
          key: 'end_time',
          label: 'End Time',
          width: 200,
          sortable: 'custom'
        },
        {
          key: 'duration',
          label: 'Duration',
          width: 130,
          sortable: 'custom'
        },
        {
          key: 'status',
          label: 'Status',
          width: 100
        },
        {
          key: 'notes',
          label: 'Notes',
          minWidth: 170
        },
        {
          key: 'progress',
          hidden: true
          // scope: true
          // width: 150
        },
        {
          key: 'action',
          label: 'Action',
          width: 100
        }
      ],
      startTimeSort: 'desc',
      endTimeSort: '',
      listLoading: false,
      pageSize: 20,
      total: 0,
      page:
        (this.$route.params.page && Number.parseInt(this.$route.params.page)) ||
        1,
      dialogVisible: false,
      formLoading: false,
      form: {
        experiment: '',
        type: '',
        desc: ''
      },
      formRules: {
        experiment: [
          { required: true, message: 'Please enter your name', trigger: 'blur' }
        ],
        type: [
          { required: true, message: 'Please enter your name', trigger: 'blur' }
        ],
        desc: [
          {
            required: true,
            message: 'Please enter a description',
            trigger: 'blur'
          }
        ]
      },
      roleOptions: [],
      statusOptions: [],
      editorText: '',
      editorScope: '',
      willopenScope: ''
    }
  },
  computed: {
    ...mapGetters(['lastJob', 'icons']),
    sortKeys() {
      return {
        start_time: 'f_start_time',
        end_time: 'f_end_time',
        duration: 'f_elapsed'
      }
    }
  },
  beforeMount() {
    const {
      search_job_id,
      search_party_id,
      search_role,
      search_status,
      search_note,
      search_partner
    } = this.$route.params

    if (search_job_id) {
      this.condition.job_id = search_job_id
    }
    if (search_party_id) {
      this.condition.party_id = search_party_id
    }
    if (search_role && search_role.length > 0) {
      this.condition.role = search_role.split(',')
    }
    if (search_status && search_status.length > 0) {
      this.condition.status = search_status.split(',')
    }
    if (search_note) {
      this.condition.note = search_note
    }
    if (search_partner) {
      this.condition.partner = search_partner
    }
    this.saveCondition = deepClone(this.condition)
    // console.log(query)
  },
  mounted() {
    this.queryList()
    this.queryFileds()
  },
  methods: {
    // getTotal() {
    //   getJobsTotal().then(res => {
    //     this.total = res.data
    //     // this.queryList()
    //     // if (!this.list) {
    //     // this.getList()
    //     this.queryList()
    //     // }
    //   })
    // },
    handlePageChange({ page }) {
      this.page = page
      // this.getList()
      this.queryList()
    },
    changeSort(dimension) {
      if (dimension === 'start_time') {
        if (this.startTimeSort !== 'desc') {
          this.startTimeSort = 'desc'
        } else {
          this.startTimeSort = 'asc'
        }
        this.endTimeSort = ''
      } else if (dimension === 'end_time') {
        if (this.endTimeSort !== 'desc') {
          this.endTimeSort = 'desc'
        } else {
          this.endTimeSort = 'asc'
        }
        this.startTimeSort = ''
      }
      this.queryList()
    },
    queryList(filterOperation) {
      // console.log(this.condition)
      const cond = Object.assign(this.condition, {
        jobId: this.condition.job_id,
        partyId: this.condition.party_id,
        fDescription: this.condition.note
      })
      let times = 0
      const sortPara = {}
      // if (this.startTimeSort) {
      //   sortPara.orderRule = this.startTimeSort
      //   sortPara.orderField = 'f_start_time'
      // }
      // if (this.endTimeSort) {
      //   sortPara.orderRule = this.endTimeSort
      //   sortPara.orderField = 'f_end_time'
      // }
      const para = Object.assign(
        {
          // total_record: this.total,
          pageNum: this.page,
          pageSize: this.pageSize
          // page_num: this.page,
          // page_size: this.pageSize
        },
        cond,
        sortPara
      )
      if (!filterOperation) {
        this.listLoading = true
      }
      const req = () => {
        return queryJobs(para)
          .then(res => {
            this.saveCondition = deepClone(this.condition)
            let willUpdated = true
            const data = []
            this.total = res.data.totalRecord
            res.data.list.forEach(item => {
              let jobId = ''
              let role = ''
              let partyId = ''
              // let _dataset = ''
              // let partner = ''
              // let pnr_dataset = ''
              let start_time = ''
              let end_time = ''
              let duration = ''
              let status = ''
              let progress = ''
              let notes = ''
              let partner = ''

              const { job } = item

              if (job) {
                if (filterOperation && !filterOperation(job)) {
                  willUpdated = false
                  return false
                }
                jobId = job.fJobId || ''
                role = job.fRole || ''
                partyId = job.fPartyId || ''
                start_time = job.fStartTime
                  ? parseTime(new Date(job.fStartTime))
                  : ''
                end_time = job.fEndTime ? parseTime(job.fEndTime) : ''
                duration = job.fElapsed ? formatSeconds(job.fElapsed) : ''
                status = job.fStatus || ''
                progress = job.fStatus === 'running' ? job.fProgress || 0 : null
                notes = job.fDescription || ''
                // const partC = []
                // for (const key in dataset.partner) {
                //   partC.push(dataset.partner[key])
                // }
                // partC.sort((a, b) => {
                //   return parseFloat(a) > parseFloat(b) ? 1 : -1
                // })
                partner = Array.isArray(job.partners) ? job.partners.join(',') : '-'
              }
              // if (dataset) {
              //   _dataset = dataset.dataset || ''
              //   partner = dataset.partner || ''
              //   pnr_dataset = dataset.pnr_dataset || ''
              // }
              data.push({
                jobId,
                role,
                partyId,
                // dataset: _dataset,
                // partner,
                // pnr_dataset,
                start_time,
                end_time,
                duration,
                status,
                progress,
                notes,
                notesEdit: false,
                partner
              })
            })
            if (willUpdated) {
              this.list = data
              this.listLoading = false
            } else {
              if (times < 10) {
                setTimeout(() => {
                  req()
                }, 4000)
                times += 1
              }
            }
          })
      }
      req()
    },
    search() {
      this.page = 1
      this.queryList()
    },
    toDetailes(job_id, role, party_id) {
      this.$store.dispatch('changeLastJob', { job_id, role, party_id })
      const query = {
        job_id,
        role,
        party_id,
        from: 'Job overview',
        page: this.page
      }
      const {
        job_id: search_job_id,
        party_id: search_party_id,
        role: search_role,
        status: search_status,
        partner: search_partner
      } = this.saveCondition
      if (search_job_id) {
        query.search_job_id = search_job_id
      }
      if (search_party_id) {
        query.search_party_id = search_party_id
      }
      if (search_role && search_role.length > 0) {
        query.search_role = search_role.toString()
      }
      if (search_status && search_status.length > 0) {
        query.search_status = search_status.toString()
      }
      if (search_partner && search_partner.length > 0) {
        query.search_partner = search_partner.toString()
      }
      // console.log(query)
      const href = this.$router.resolve({
        path: '/details',
        query
      })
      window.open(href.href, '_blank')
    },
    toHome() {
      this.$router.push({
        path: '/'
      })
    },
    tableRowClassName({ row, rowIndex }) {
      let final = 't-row'
      if (rowIndex % 2 === 0) {
        final += ' between-line'
      }
      if (
        this.lastJob &&
        row.jobId === this.lastJob.job_id &&
        row.role === this.lastJob.role &&
        row.partyId === this.lastJob.party_id
      ) {
        final += ' history-stripe'
      }
      return final
    },
    setCurrentRow(val) {
      if (!val) return
      this.$store.dispatch('changeLastJob', {
        job_id: val.jobId,
        role: val.role,
        party_id: val.partyId
      })
    },
    editorNoteForJob(scope) {
      const vm = this
      for (const val of this.list) {
        val.notesEdit = false
      }
      if (this.editorScope) {
        this.willopenScope = scope
      } else {
        this.editorScope = scope
        this.editorText = this.list[scope.$index].notes
        this.list[scope.$index].notesEdit = true
        this.$nextTick(() => {
          vm.$refs[scope.column.id + '_' + scope.$index][0].focus()
        })
      }
    },
    uploadEditor(ev) {
      const that = this
      const scope = this.editorScope
      if (
        this.editorScope &&
        this.editorText !== that.list[scope.$index].notes
      ) {
        const params = {
          job_id: scope.row.jobId,
          role: scope.row.role,
          party_id: scope.row.partyId,
          notes: this.editorText
        }
        addNotes(params).then(res => {
          that.list[scope.$index].notes = that.editorText
          that.list[scope.$index].notesEdit = false
          that.editorText = ''
          that.editorScope = null
          if (that.willopenScope) {
            that.editorNoteForJob(that.willopenScope)
            that.willopenScope = ''
          }
        })
      } else {
        if (that.willopenScope) {
          that.editorText = ''
          that.editorScope = null
          that.editorNoteForJob(that.willopenScope)
          that.willopenScope = ''
        } else {
          if (!scope) {
            return
          }
          that.list[scope.$index].notesEdit = false
          that.editorText = ''
          that.editorScope = null
        }
      }
    },
    closeEditor(scope) {
      this.list[scope.$index].notesEdit = false
      this.editorText = ''
      this.editorScope = null
    },
    willshowingToolTip({ $index, row, column }) {
      const width = column.realWidth - 20
      const fontSize = 16
      const content = row[column.property]
      return content.length * fontSize < Math.floor(width * 0.6 - 5)
    },
    stopToTop(ev) {
      ev.stopPropagation()
    },
    onRetry(row) {
      const status = row.status
      if (status === 'complete' || status === 'success') {
        return
      }
      const isDone = status === 'failed' || status === 'canceled'
      const isDoing = status === 'running' || status === 'waiting'
      const callback = isDone ? retryJob : isDoing ? killJob : () => {}
      const confirmText =
        isDone
          ? [`The job will continue from where it ${status}`, 'it may take few seconds to  update job status.']
          : isDoing
            ? [`Are you sure you want to cancel this job?`, 'You can\'t undo this action，it may take few seconds to  update job status.']
            : ['', '']

      this.$refs.confirm
        .confirm(...confirmText)
        .then(() => {
          const mid = {
            job_id: row.jobId
          }
          if (isDone) {
            mid.component_name = 'pipeline'
          }
          callback(mid).then(() => {
            this.queryList((job) => {
              return job.fJobId !== row.jobId || (isDone
                ? job.fStatus.toLowerCase().match(new RegExp(`(${['waiting', 'running'].join('|')})`))
                : isDoing
                  ? job.fStatus.toLowerCase().match(new RegExp(`(${['failed', 'canceled', 'success'].join('|')})`))
                  : false)
            })
          })
        })
    },
    queryFileds() {
      queryFileds().then(response => {
        const { role, status } = response.data
        const mapFunc = item => ({ value: item, label: item })
        this.roleOptions = role.map(mapFunc)
        this.statusOptions = status.map(mapFunc)
      })
    },
    sortChange({ prop, order }) {
      order = order === 'descending' ? 'desc' : 'asc'
      this.condition.orderRule = order
      this.condition.orderField = this.sortKeys[prop] || 'f_start_time'
      this.queryList()
    }
  }
}
</script>

<style lang="scss">
@import '../../styles/history';
</style>
