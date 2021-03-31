<template>
  <div class="container">
    <span
      v-for="(val, index) in options"
      :key="index"
      :class="{'selectabel': true, 'choosed': currentLabel === val.label}"
      @click="choose(val)"
    >{{ val.label }}</span>
  </div>
</template>

<script>
export default {
  name: 'LabelTab',

  props: {
    options: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      currentLabel: '', // 当前选择的labels
      currentValue: '' // 当前数值。
    }
  },

  watch: {
    currentLabel(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.change()
      }
    }
  },

  methods: {
    choose(val) {
      this.currentLabel = val.label
      this.currentValue = val.value
    },
    change() {
      this.$emit('change', this.currentValue)
    },
    setDefault() {
      const current = this.options[0]
      this.currentLabel = current.label
      this.currentValue = current.value
      return true
    }
  }
}
</script>

<style scoped lang="scss">
.selectabel {
	font-size: 14px;
	padding: 5px 15px;
	border-radius: 2px;
	color: #494ece;
	background-color: #eee;
	margin-right: 2px;
	cursor: pointer;
}
.choosed {
	color: white;
	background-color: #5e7feb;
}
</style>
