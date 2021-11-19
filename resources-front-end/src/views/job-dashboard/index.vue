<template>
  <div class="dashboard-container bg-dark app-container">
    <breadcrumb-ext
      :breads="[{type:'content', val:'Dashboard'}]"
    />
    <board v-bind="ids" />

    <logs :ids="ids" />
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
import BreadcrumbExt from '@/components/BreadcrumbExt'
import Board from './board/Board'
import Logs from './log/Logs'

export default {
  components: {
    BreadcrumbExt,
    Board,
    Logs
  },
  computed: {
    ...mapGetters(['icons']),
    jobId() {
      return this.$route.query.job_id
    },
    role() {
      return this.$route.query.role
    },
    partyId() {
      return this.$route.query.party_id
    },
    ids() {
      return {
        jobId: this.jobId,
        role: this.role,
        partyId: this.partyId
      }
    }
  }
}
</script>

<style lang="scss">
@import '../../styles/dashboard';

.toolContent {
	display: inline-block;
	width: 100%;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: #4159d1;
}

// .el-tooltip__popper[x-placement^=top] .popper__arrow::after {
//   border-top-color: rgba(127,125,142,0.7)
// }

// .el-tooltip__popper[x-placement^=top] .popper__arrow {
//   border-top-color: rgba(127,125,142,0.7)
// }

// .tooltip-content {
//   font-family: 'Lato';
//   background-color:rgba(127,125,142,0.7) !important
// }
</style>
