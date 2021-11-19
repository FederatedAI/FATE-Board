<template>
  <div class="prop-content notes-content flex flex-col flex-start prop-content prop-dataset prop-notes">
    <div class="edit-icon">
      <div v-if="!showEdit">
        <icon-hover-and-active
          :default-url="icons.normal['edit']"
          :hover-url="icons.hover['edit']"
          :active-url="icons.active['edit']"
          @clickFn="editorNoteForJob()"
        />
      </div>
      <div v-else>
        <i class="el-icon-check" style="color:#00820e" @click.self="uploadEditor()" />
        <i class="el-icon-close" style="color:#e24054" @click.self="showEdit = false" />
      </div>
    </div>
    <el-input
      v-if="showEdit"
      v-model="editnotes"
      placeholder="please enter"
      class="notes-editor"
      @keyup.native.enter="uploadEditor()"
    />
    <overflow-tooltip v-else :content="editorText" width="500px" placement="right">
      <p class="prop-dataset-item">{{ editorText }}</p>
    </overflow-tooltip>
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
import { addNotes } from '@/api/job'
import { mapGetters } from 'vuex'
import IconHoverAndActive from '@/components/IconHoverAndActive'
import OverflowTooltip from '@/components/OverflowTooltip'
export default {
  name: 'Notes',
  components: {
    IconHoverAndActive,
    OverflowTooltip
  },
  props: {
    jobInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      editorText: '',
      editnotes: '',
      showEdit: false
    }
  },
  computed: {
    ...mapGetters(['lastJob', 'icons'])
  },
  created() {
    setTimeout(() => {
      this.editorText = this.jobInfo.notes
    }, 50)
  },
  methods: {
    editorNoteForJob() {
      this.editnotes = this.editorText
      this.showEdit = true
    },
    uploadEditor() {
      const params = {
        job_id: this.$route.query.job_id,
        role: this.$route.query.role,
        party_id: this.$route.query.party_id,
        notes: this.editnotes
      }
      if (this.editnotes !== this.editorText) {
        addNotes(params).then(res => {
          this.editorText = this.editnotes
        })
      }
      this.showEdit = false
    }
  }
}
</script>

<style lang="scss">
.refresh-container {
	margin-right: 24px;
}
.prop-notes {

  .el-input__inner {
    border-radius: 0;
    height: 24px;
    line-height: 24px;
  }
  .edit-icon {
   position: absolute;
   width: 36px;
   height: 16px;
   right: -4px;
   top: -3px;
   .el-icon-check,.el-icon-close {
     cursor: pointer;
     font-size: 16px;
   }
   img {
     margin-left: 15px;
     width: 16px;
   }
  }
}
</style>
