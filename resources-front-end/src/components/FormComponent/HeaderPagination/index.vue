<template>
  <div v-show="pagination.length > 1" class="header-pagination__container">
    <span v-if="title" class="page__title">{{ title }}</span>
    <i
      class="el-icon-arrow-left"
      @click.stop="pageChange((currentPage - 1 >= 1) ? currentPage - 1 : 1)"
    />
    <div
      v-for="(item, index) in showingPages "
      :key="index"
      :class="{'page-active': currentPage === (index + showPage)}"
      class="page-change"
      @click="pageChange(index + 1)"
    >
      <span>{{ item.s }}</span>
      <span>-</span>
      <span>{{ item.e }}</span>
    </div>
    <i class="el-icon-arrow-right" @click.stop="pageChange(currentPage + 1)" />
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

export default {
  name: 'HeaderPagination',

  props: {
    list: {
      type: Array,
      default: () => []
    },
    pageSize: {
      type: Number,
      default: 3
    },
    title: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      currentPage: 1,
      maxPage: 4,
      showPage: 1,
      currentList: [...this.list]
    }
  },

  computed: {
    pagination() {
      let start = 1
      const total = this.getActualTotal(this.currentList)
      const pageS = this.pageSize - this.getFixedTotal(this.currentList)
      const res = []
      while (start <= total) {
        const end = start + pageS - 1 < total ? start + pageS - 1 : total
        res.push({
          s: start,
          e: end
        })
        start += pageS
      }
      return res
    },
    showingPages() {
      return this.pagination.slice(
        this.showPage - 1,
        this.showPage + this.maxPage > this.pagination.length
          ? this.pagination.length
          : this.showPage + this.maxPage
      )
    }
  },

  watch: {
    list: {
      handler() {
        this.setList(this.list)
      }
    }
  },

  methods: {
    pageChange(page, dir = false) {
      const total = this.getActualTotal(this.currentList)
      const pageS = this.pageSize - this.getFixedTotal(this.currentList)
      const len = Math.ceil(total / pageS)
      page = page <= 0 ? 1 : page > len ? len : page
      if (!dir) {
        if (this.currentPage !== page) {
          this.currentPage = this.showPage + page - 1
          this.$emit('headerChange', this.currentPage)
        }
        if (page === 4 && this.currentPage < len) {
          this.nextShowPage(1)
        }
        if (page === 1 && this.currentPage > 1) {
          this.preShowPage(1)
        }
      } else {
        let currentShowPage = this.showPage
        while (currentShowPage) {
          if (currentShowPage - 1 > page) {
            currentShowPage--
          } else if (currentShowPage + 3 < page) {
            if (currentShowPage + 4 >= len) {
              currentShowPage = len - 4
              break
            } else {
              currentShowPage++
            }
          } else {
            break
          }
        }
        this.showPage = currentShowPage
        this.currentPage = page
      }
    },
    getActualTotal(list) {
      let totalFixed = list.length
      list.forEach(item => {
        if (item.pageFixed) {
          totalFixed--
        }
      })
      return totalFixed
    },
    getFixedTotal(list) {
      let res = 0
      list.forEach(item => {
        if (item.pageFixed) {
          res++
        }
      })
      return res
    },
    preShowPage(num) {
      this.showPage = this.showPage - num < 1 ? 1 : this.showPage - num
    },
    nextShowPage(num) {
      this.showPage =
				this.showPage + num + this.maxPage > this.pagination.length
				  ? this.pagination.length - this.maxPage
				  : this.showPage + num
    },
    setList(list) {
      if (Array.isArray(list) && list.length > 0) {
        this.currentList = [...list]
      }
    },
    linkageOutside(list) {
      this.setList(list)
      this.pageChange(1, true)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../../styles/position';
@import '../../../styles/common_style';
.header-pagination__container {
	@include flex(row, flex-start, center);
	.page-change {
		margin: 0px 12px;
		cursor: pointer;
	}
	.page-active {
		color: #494ece;
	}
	.page__title {
		font-weight: bold;
		font-size: 1.14rem;
	}
}
</style>
