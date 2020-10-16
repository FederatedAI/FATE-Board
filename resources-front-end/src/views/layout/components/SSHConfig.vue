<template>
  <el-dialog
    :visible="showConfigModal"
    :close-on-click-modal="false"
    title="Cluster SSH information settings"
    width="80%"
    top="10vh"
    append-to-body
    @close="closeConfig"
  >
    <div class="flex flex-end">
      <el-button style="margin-bottom: 10px;" @click="showModal('add')">Add</el-button>
    </div>
    <div style="max-height: 50vh;padding-bottom:20px;overflow: auto">
      <el-table
        v-loading="tableLoading"
        :data="sshList"
        element-loading-text="Loading"
        empty-text="No data"
        border
        fit
        highlight-current-row
      >
        <el-table-column type="index" label="index" width="100" align="center" />
        <el-table-column prop="ip" label="IP" show-overflow-tooltip align="center" />
        <el-table-column prop="username" label="User name" show-overflow-tooltip align="center" />
        <el-table-column prop="port" label="Port" show-overflow-tooltip align="center" />
        <el-table-column prop="password" label="Password" show-overflow-tooltip align="center" />
        <el-table-column
          :formatter="formatterStatus"
          prop="status"
          label="Status"
          show-overflow-tooltip
          align="center"
        />
        <el-table-column label align="center" width="150">
          <template slot-scope="scope">
            <!--<el-button type="primary" size="small" @click="handleUpdate(scope.row)">modify</el-button>-->
            <!--<el-button type="danger" size="small" @click="handleDelete(scope.row)">delete</el-button>-->
            <i class="el-icon-edit-outline op-icon op-icon-edit" @click="handleUpdate(scope.row)" />
            <i class="el-icon-delete op-icon op-icon-delete" @click="handleDelete(scope.row)" />
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!--<div class="flex flex-end" style="margin-top:20px;">-->
    <!--<el-pagination-->
    <!--:total="sshList.length"-->
    <!--:current-page.sync="currentPage"-->
    <!--:page-size="pageSize"-->
    <!--background-->
    <!--layout="prev, pager, next"-->
    <!--@current-change="changePage"-->
    <!--/>-->
    <!--</div>-->

    <el-dialog
      :visible.sync="showSubModal"
      :close-on-click-modal="false"
      :show-close="true"
      class="add-dialog"
      width="50%"
      top="15vh"
      append-to-body
    >
      <span class="add-dialog-title">{{ subModalTitle }}</span>
      <el-form
        v-loading="subModalLoading"
        ref="configForm"
        :model="configForm"
        :rules="configFormRules"
        label-width="0px"
        class="add-dialog-form"
      >
        <el-form-item prop="ip">
          <!-- <el-input v-model="configForm.ip" :readonly="modalType==='edit'" /> -->
          <div class="flex flex-row flex-center add-dialog-div">
            <span class="add-dialog-label">IP:</span>
            <input
              v-model="configForm.ip"
              :readonly="modalType==='edit'"
              type="text"
              class="add-dialog-input"
            >
          </div>
        </el-form-item>
        <el-form-item prop="username">
          <!-- <el-input v-model="configForm.username" /> -->
          <div class="flex flex-row flex-center add-dialog-div">
            <span class="add-dialog-label">User name:</span>
            <input v-model="configForm.username" type="text" class="add-dialog-input" >
          </div>
        </el-form-item>
        <el-form-item prop="port">
          <!-- <el-input v-model="configForm.port" /> -->
          <div class="flex flex-row flex-center add-dialog-div">
            <span class="add-dialog-label">Port:</span>
            <input v-model="configForm.port" type="text" class="add-dialog-input" >
          </div>
        </el-form-item>
        <el-form-item prop="password">
          <!-- <el-input v-model="configForm.password" /> -->
          <div class="flex flex-row flex-center add-dialog-div">
            <span class="add-dialog-label">Password:</span>
            <input v-model="configForm.password" type="text" class="add-dialog-input" >
          </div>
        </el-form-item>
      </el-form>
      <div class="flex flex-row flex-center justify-center">
        <button class="operation-btn" @click="handleSave">Save</button>
        <button class="operation-btn" @click="showSubModal=false">Cancel</button>
      </div>
    </el-dialog>
  </el-dialog>
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
import {
  getAllSSHConfig,
  getAllSSHStatus,
  addSSHConfig,
  removeSSHConfig
} from '@/api/ssh'

export default {
  name: 'SSHConfig',
  components: {
    Pagination
  },
  props: {
    showConfigModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showSubModal: false,
      sshList: [],
      currentPage: 1,
      pageSize: 5,
      tableLoading: false,
      subModalLoading: false,
      configForm: {
        ip: '',
        username: '',
        password: '',
        port: ''
      },
      modalType: 'add',
      configFormRules: {
        ip: [
          { required: true, message: 'please enter your IP', trigger: 'blur' }
        ],
        username: [
          {
            required: true,
            message: 'please enter your user name',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: 'please enter your password',
            trigger: 'blur'
          }
        ],
        port: [
          { required: true, message: 'please enter your port', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    subModalTitle() {
      return `Cluster SSH information ${this.modalType}ing`
    },
    tablePageData() {
      const data = []
      for (let i = 0; i < this.sshList.length; i++) {
        const row = this.sshList[i]
        const limitPre = i >= (this.currentPage - 1) * this.pageSize
        const limitNext = i < this.currentPage * this.pageSize
        // console.log(i, limitPre, limitNext)
        if (limitPre && limitNext) {
          data.push(row)
        }
      }
      return data
    }
  },
  mounted() {
    this.getAllSSHList()
  },
  methods: {
    getAllSSHList() {
      this.tableLoading = true
      this.currentPage = 1
      getAllSSHConfig()
        .then(res => {
          this.tableLoading = false
          const data = res.data || {}
          const list = []
          Object.values(data).forEach(obj => {
            if (obj) {
              list.push({
                ip: obj.ip,
                username: obj.user,
                password: obj.password,
                port: obj.port
              })
            }
          })
          this.sshList = list
          getAllSSHStatus().then(res => {
            const data = res.data
            Object.keys(data).forEach(ip => {
              for (let i = 0; i < this.sshList.length; i++) {
                if (this.sshList[i].ip === ip) {
                  this.sshList[i].status = data[ip].status
                  break
                }
              }
            })
            // console.log(this.sshList)
            this.sshList.splice()
          })
        })
        .catch(() => {
          this.tableLoading = false
        })
    },
    changePage(page) {
      this.page = page
    },
    formatterStatus(row) {
      const status = row.status
      let str = ''
      if (status === '1') {
        str = 'avalable'
      } else if (status === '0') {
        str = 'unavalable'
      }
      return str
    },
    closeConfig() {
      this.$emit('closeSSHConfigModal')
    },
    showModal(type) {
      this.initConfigForm()
      this.modalType = type
      this.showSubModal = true
    },
    initConfigForm() {
      this.configForm = {
        ip: '',
        username: '',
        password: '',
        port: ''
      }
    },
    handleUpdate(row) {
      this.showModal('edit')
      this.configForm = Object.assign({}, row)
    },
    handleDelete(row) {
      this.$confirm(
        "You can't undo this action，it may take few seconds to  update job status.",
        'Are you sure you want to delete this cluster?',
        {
          confirmButtonText: 'Save',
          cancelButtonText: 'Cancel'
        }
      )
        .then(() => {
          removeSSHConfig(row.ip).then(res => {
            this.getAllSSHList()
            this.$message({
              type: 'success',
              message: 'delete successfully'
            })
          })
        })
        .catch()
    },
    handleSave() {
      this.$refs.configForm.validate(valid => {
        if (valid) {
          this.subModalLoading = true
          const params = {
            ip: this.configForm.ip,
            user: this.configForm.username,
            port: this.configForm.port,
            password: this.configForm.password
          }
          addSSHConfig(params)
            .then(res => {
              this.subModalLoading = false
              this.showSubModal = false
              this.$message({
                type: 'success',
                message: `${this.modalType} successfully`
              })
              this.getAllSSHList()
            })
            .catch(() => {
              this.$message({
                type: 'error',
                message: `${this.modalType} failed`
              })
              this.subModalLoading = false
            })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.op-icon {
	font-size: 20px;
	cursor: pointer;
}

.op-icon-edit {
	margin-right: 5px;
}

.add-dialog {
	.add-dialog-div {
		width: 100%;
		height: 100%;
	}
	.add-dialog-label {
		font-size: 14px;
		color: #6a6c75;
		font-weight: normal;
		min-width: 110px;
		height: 100%;
	}
	.add-dialog-title {
		font-size: 18px;
		color: #3e4052;
		padding: 0px 20px;
	}
	.add-dialog-form {
		padding: 20px;
	}
	.add-dialog-input {
		width: 100%;
		height: 100%;
		border: 0px;
		border-bottom: 1px solid #ebedf0;
		color: #6a6c75;
		font-size: 14px;
		outline: none;
		padding: 4px 0px;
	}
}

.operation-btn {
	height: 36px;
	width: 30%;
	border-radius: 2px;
	border: 0px;
	background-color: #ebedf0;
	&:hover {
		background-color: #4159d1;
		color: white;
	}
	&:first-child {
		margin-right: 24px;
	}
}
</style>
