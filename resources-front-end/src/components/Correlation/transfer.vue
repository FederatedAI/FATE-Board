<template>
  <div class="flex flex-row">
    <div class="flex flex-col col-list col-left">
      <div class="title-part">
        <el-input v-model="searchInput" size="small" placeholder="Search Variables">
          <el-button slot="append" icon="el-icon-search" />
        </el-input>
      </div>
      <div class="choose-list choose-list-allinfo">
        <ul>
          <li v-for="(item, index) in infos" v-show="match(item.label)" :key="index">
            <el-checkbox v-model="item.checked" @change="chooseing(item, index)">{{ item.label }}</el-checkbox>
          </li>
        </ul>
      </div>
    </div>
    <div class="flex flex-col col-list col-right">
      <div class="title-part text-title">
        <span class="selected-title">selected</span>
      </div>
      <div class="choose-list choose-list-choosed">
        <ul>
          <li v-for="(item, index) in infos" v-show="item.checked" :key="index">
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Transfer',

  props: {
    allInfo: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      searchInput: '',
      inited: false,
      infos: [],
      choosed: []
    }
  },

  watch: {
    allInfo: {
      handler(oldValue, value) {
        this.inited = false
        this.initing()
      }
    }
  },

  beforeMount() {
    this.initing()
  },

  methods: {
    initing() {
      this.infos = JSON.parse(JSON.stringify(this.allInfo))
      for (const val of this.infos) {
        val.checked = true
      }
    },
    chooseing(label, index) {
      this.infos.splice(index, 1, JSON.parse(JSON.stringify(label)))
      this.$emit('change', this.infos)
    },
    match(label) {
      if (!this.searchInput) {
        return true
      }
      if (label.match(this.searchInput)) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>

<style lang="scss">
.col-list {
	width: 50%;
	max-height: 100%;
	padding: 10px;
	.choose-list {
		width: 100%;
		overflow: auto;
	}
	.title-part {
		min-height: 35px;
		margin-bottom: 10px;
	}
	.text-title {
		font-size: 16px;
		font-family: 'lato';
		font-weight: 'bold';
	}
	li {
		padding: 10px 0px;
		border-bottom: 1px solid #e8e8ef;
	}
}

.col-left {
	padding-right: 14px;
	border-right: 1px solid #e8e8ef;
}

.col-right {
	padding-left: 14px;
}
</style>
