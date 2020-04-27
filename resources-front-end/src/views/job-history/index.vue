<template>
  <div class="app-container flex flex-col history-container bg-dark" @click="uploadEditor($event)">
    <breadcrumb-ext :breads="[{type:'content', val:'Job Overview'}]"/>
    <div class="tool-bar flex flex-center flex-end">
      <div class="tool-item">
        <div class="tool-item">
          <span class="title">Job ID:</span>
          <el-input v-model="condition.job_id" :size="'mini'" clearable @keyup.native.enter="search" @clear="search" />
        </div>
        <div class="tool-item">
          <span class="title">Party ID:</span>
          <el-input v-model="condition.party_id" :size="'mini'" @keyup.native.enter="search" />
        </div>
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
                <div v-if="!scope.row.notesEdit" class="flex flex-row flex-end flex-center">
                  <el-tooltip :content="scope.row[item.key]" :disabled="willshowingToolTip(scope)" effect="dark" placement="top-end">
                    <span class="notes-showing">{{ scope.row[item.key] }}</span>
                  </el-tooltip>
                  <icon-hover-and-active
                    :default-url="icons.normal['edit']"
                    :hover-url="icons.hover['edit']"
                    :active-url="icons.active['edit']"
                    @clickFn="editorNoteForJob(scope)"
                  />
                </div>
                <div v-else-if="scope.row.notesEdit" class="flex flex-row flex-end flex-center" @click.stop="stopToTop($event)">
                  <el-input v-model="editorText" :ref="scope.column.id+'_'+scope.$index" placeholder="请输入" class="notes-editor" @keyup.native.enter="uploadEditor($event)"/>
                  <i class="el-icon-check" @click.self="uploadEditor($event)"/>
                  <i class="el-icon-close" @click.self="closeEditor(scope)"/>
                </div>
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
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { parseTime, formatSeconds, deepClone } from '@/utils'
import { mapGetters } from 'vuex'
import { queryJobs, addNotes } from '@/api/job'
import IconHoverAndActive from '@/components/IconHoverAndActive'
import BreadcrumbExt from '@/components/BreadcrumbExt'

export default {
  name: 'Job',
  components: {
    Pagination,
    IconHoverAndActive,
    BreadcrumbExt
  },
  filters: {},
  data() {
    return {
      list: null,
      condition: {
        role: '',
        status: '',
        job_id: '',
        party_id: ''
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
          key: 'start_time',
          label: 'Start Time',
          width: 200,
          sortable: true
        },
        {
          key: 'end_time',
          label: 'End Time',
          width: 200,
          sortable: true
        },
        {
          key: 'duration',
          label: 'Duration',
          width: 120
        },
        {
          key: 'status',
          label: 'Status',
          width: 100
        },
        {
          key: 'notes',
          label: 'Notes',
          minWidth: 200
        },
        {
          key: 'progress',
          hidden: true
          // scope: true
          // width: 150
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
      roleOptions: [
        {
          value: 'guest',
          label: 'guest'
        },
        {
          value: 'host',
          label: 'host'
        },
        {
          value: 'arbiter',
          label: 'arbiter'
        }
      ],
      statusOptions: [
        {
          value: 'success',
          label: 'success'
        },
        {
          value: 'running',
          label: 'running'
        },
        {
          value: 'waiting',
          label: 'waiting'
        },
        {
          value: 'failed',
          label: 'failed'
        },
        {
          value: 'canceled',
          label: 'canceled'
        }
      ],
      editorText: '',
      editorScope: '',
      willopenScope: ''
    }
  },
  computed: {
    ...mapGetters(['lastJob', 'icons'])
  },
  beforeMount() {
    const {
      search_job_id,
      search_party_id,
      search_role,
      search_status
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
    this.saveCondition = deepClone(this.condition)
    // console.log(query)
  },
  mounted() {
    this.queryList()
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
    queryList() {
      // console.log(this.condition)
      const sortPara = {}
      if (this.startTimeSort) {
        sortPara.start_time = this.startTimeSort
      }
      if (this.endTimeSort) {
        sortPara.end_time = this.endTimeSort
      }
      const para = Object.assign(
        {
          // total_record: this.total,
          page_num: this.page,
          page_size: this.pageSize
        },
        this.condition,
        sortPara
      )

      this.listLoading = true
      queryJobs(para)
        .then(res => {
          this.saveCondition = deepClone(this.condition)
          this.listLoading = false
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

            const { job } = item

            if (job) {
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
              notesEdit: false
            })
          })
          this.list = data
        })
        .catch(res => {
          this.listLoading = false
        })
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
        status: search_status
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
      if (this.editorScope && this.editorText !== that.list[scope.$index].notes) {
        const params = {
          'job_id': scope.row.jobId,
          'role': scope.row.role,
          'party_id': scope.row.partyId,
          'notes': this.editorText
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
    }
  }
}
</script>

<style lang="scss">
@import '../../styles/history';
</style>
