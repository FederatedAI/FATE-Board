
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

const pageTableSearch = {
  data() {
    return {
      searchContentFound: false,
      currentSearchContent: '',
      currentSearchCol: '',
      originPage: -1
    }
  },
  methods: {
    searching(content = '', col = '', mid = false) {
      if (this.currentSearchContent !== content || this.currentSearchCol !== col) {
        this.showData()
        this.$refs['originTable'].showData()
      }
      this.currentSearchCol = col
      this.currentSearchContent = content
      if (!content) {
        if (this.originPage > 0) {
          this.pageTo(this.originPage)
          this.originPage = -1
        }
      } else {
        if (!mid) {
          this.originPage = this.currentPage
        }
        this.$refs['originTable'].searchInTable(content, col)
      }
    },

    searchNotFound() {
      const lastPage = Math.ceil(this.currentTotal / this.pageSize)
      if (this.currentPage < lastPage) {
        this.pageTo(this.currentPage + 1)
        this.searchAfter()
      } else if (this.searchContentFound) {
        this.toFirstPage()
        this.searchContentFound = false
        this.$refs['originTable'].notSearched()
        this.searchAfter()
      } else {
        this.$refs['originTable'].showNoData()
      }
    },

    searchFound() {
      this.searchContentFound = true
      this.originPage = this.currentPage
    },

    searchAfter(mid = true) {
      this.$nextTick(() => {
        this.searching(this.currentSearchContent, this.currentSearchCol, mid)
      })
    }
  }
}

export default pageTableSearch
