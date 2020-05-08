<template>
  <section class="flex flex-col running-container">
    <div class="flex flex-row space-between job-info">
      <span class="job-id">{{ jobId }}</span>
      <span class="kill-btn" @click="killOperation">{{ status === 'waiting' ? 'cancel' : 'kill' }}</span>
    </div>
    <span class="role-info">Role: {{ role }}</span>
    <div
      class="flex flex-center justify-center progress-info"
      @mouseover="mouseoverHandler"
      @mouseout="mouseoverd = false"
    >
      <el-progress
        :percentage="progressNum"
        :show-text="false"
        :width="120"
        color="#494ece"
        type="circle"
      />
      <div class="operation-btn">
        <p
          v-show="!mouseoverd"
          :class="{'wait-status': (status === 'waiting'), 'running-status': (status !== 'waiting')}"
          class="flex flex-row flex-bottom"
        >
          <span>{{ status === 'waiting' ? 'waiting...' : progressNum }}</span>
          <span v-if="status !== 'waiting'" class="precentage-text">%</span>
        </p>
        <span v-show="mouseoverd" class="enter-btn" @click="enter">enter</span>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'JobRunning',

  props: {
    jobId: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      default: 'guest'
    },
    status: {
      type: String,
      default: 'waiting'
    }
  },

  data() {
    return {
      mouseoverd: false,
      progressNum: 0
    }
  },

  watch: {
    status: {
      handler() {
        this.getProgress()
      }
    }
  },

  beforeMount() {
    this.getProgress()
  },

  methods: {
    enter() {
      this.$emit('enter')
    },
    getProgress() {
      if (this.status !== 'waiting') {
        this.progressNum = parseFloat(this.status)
      } else {
        this.progressNum = 0
      }
    },
    mouseoverHandler() {
      if (this.status === 'waiting') {
        this.mouseoverd = false
      } else {
        this.mouseoverd = true
      }
    },
    killOperation() {
      this.$emit('kill')
    }
  }
}
</script>

<style scoped lang="scss">
.flex-bottom {
	align-items: baseline;
}

.running-container {
	padding: 12px;
	font-family: 'Arial';
	font-size: 14px;

	.job-info {
		margin-bottom: 6px;

		.job-id {
			font-weight: bold;
			color: #3e4052;
		}

		.kill-btn {
			color: #4159d1;
			cursor: pointer;
		}
	}

	.role-info {
		color: #999ba3;
		font-size: 12px;
		padding-bottom: 6px;
		border-bottom: 1px solid #ebedf0;
	}

	.progress-info {
		width: 100%;
		height: 100%;
		position: relative;
		.operation-btn {
			position: absolute;
		}
		.wait-status {
			font-size: 18px;
			color: #5e7feb;
			font-weight: bold;
		}
		.running-status {
			font-size: 36px;
			color: #5e7feb;
			.precentage-text {
				font-size: 16px;
			}
		}
		.enter-btn {
			font-size: 18px;
			color: #4159d1;
			cursor: pointer;
		}
	}
}
</style>
