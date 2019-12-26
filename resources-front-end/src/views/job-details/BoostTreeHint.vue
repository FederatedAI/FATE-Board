<template>
  <div class="flex flex-row flex-center picker-container">
    <el-tooltip
      v-for="(item, index) in treeHint"
      :key="index"
      :content="toolTipContent(item)"
      placement="top"
      popper-class="for-tree"
    >
      <div
        :class="{ 'each-item-choosed': currentChoose === index }"
        :style="{ 'background-color': item.color, width: itemWidth, 'border': currentChoose===index ? '2px solid ' + border : '0px' }"
        class="each-item"
        @click.self="chooseItem(item, index)"
      />
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: 'BoostTreeHint',

  props: {
    treeHint: {
      type: Array,
      default: () => []
    },
    border: {
      type: String,
      default: '#fff'
    }
  },

  data() {
    return {
      currentChoose: 0
    }
  },

  computed: {
    itemWidth() {
      const len = this.treeHint.length
      return (1 / len) * 100 + '%'
    }
  },

  methods: {
    initShowingHint() {
      // TODO：初始化当前的hint展示内容。
    },
    toolTipContent(item) {
      return 'tree id:' + item.treeId
    },
    chooseItem(item, index) {
      this.currentChoose = index
      this.$emit('chooseItem', item)
    },
    changeChoosed(id) {
      let index = 0
      for (const val of this.treeHint) {
        if (val.treeId === id) {
          this.currentChoose = index
        }
        index++
      }
    }
  }
}
</script>

<style lang="scss">
@keyframes hoverdiv {
	from {
		height: 100%;
		border-radius: 0px;
	}
	to {
		height: 120%;
		border-radius: 2px;
	}
}

@-webkit-keyframes hoverdiv {
	from {
		height: 100%;
		border-radius: 0px;
	}
	to {
		height: 120%;
		border-radius: 2px;
	}
}
.picker-container {
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	background: #e8e8ef;
	.each-item {
		height: 100%;
		z-index: 5;
		position: relative;
		margin: 0px 0.5px;
		&:hover:before {
			content: ' ';
			width: 2px;
			height: 100%;
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			margin: auto;
			background-color: #ff9a4d;
		}
	}
	.each-item-choosed {
		&:after {
			content: ' ';
			float: left;
			width: 0;
			height: 0;
			border-width: 5px;
			border-style: solid;
			border-color: transparent #000000 transparent transparent;
			transform: rotate(90deg);
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			margin: auto;
		}
	}
}
.for-tree.el-tooltip__popper[x-placement^='top'].popper__arrow {
	border-top-color: #494ece;
}
.for-tree.el-tooltip__popper[x-placement^='top'] .popper__arrow:after {
	border-top-color: #494ece;
}
.for-tree {
	background: #494ece !important;
	padding: 4px 8px;
}
</style>
