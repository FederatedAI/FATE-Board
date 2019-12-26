<template>
  <section>
    <header class="top flex flex-center space-between">
      <slot name="header">
        <span class="job-id">{{ info.jobId }}</span>
      </slot>
    </header>

    <main class="status pos-r flex flex-center justify-center">
      <section>
        <slot name="content">
          <div :style="{height: width + 'px', width: width + 'px'}" class>
            <svg viewBox="0 0 100 100">
              <slot name="contentDefs">
                <defs>
                  <linearGradient id="Gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop class="stop1" offset="0%" />
                    <stop class="stop2" offset="100%" />
                  </linearGradient>
                </defs>
              </slot>
              <path
                :d="trackPath"
                :stroke-width="relativeStrokeWidth"
                :style="trailPathStyle"
                stroke="#e5e9f2"
                fill="none"
              />
              <path
                :d="trackPath"
                :stroke="stroke"
                :stroke-width="percentage ? relativeStrokeWidth : 0"
                :style="circlePathStyle"
                class="circleAnimate"
                fill="none"
                stroke-linecap="round"
              />
            </svg>
            <span
              :style="{'font-size':info.status==='waiting' || info.status==='faied'?'14px':'36px'}"
              class="text pos-a text-primary"
            >{{ info.status }}</span>
          </div>
        </slot>
      </section>
      <section>
        <slot name="mask">
          <div
            :style="{display:info.status==='waiting'?'flex':''}"
            class="mask pos-a wh-100 flex flex-center justify-center ie-pos"
          >
            <el-button round @click="enter">
              Enter
              <i class="el-icon-right" />
            </el-button>
          </div>
        </slot>
      </section>
    </main>

    <footer>
      <slot name="footer" />
    </footer>

    <section>
      <slot name="maskForAll" />
    </section>
  </section>
</template>

<script>
export default {
  name: 'RunningSection',

  props: {
    width: {
      type: Number,
      default: 120
    },
    color: {
      type: String,
      default: 'url(#Gradient)'
    },
    status: {
      type: String,
      default: 'success'
    },
    strokeWidth: {
      type: Number,
      default: 8
    },
    percent: {
      type: Number,
      default: 0
    },
    info: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    percentage() {
      const p = Number(this.info.status.replace('%', ''))
      return this.percent !== 0 ? this.percent : p
    },
    relativeStrokeWidth() {
      return ((this.strokeWidth / this.width) * 100).toFixed(1)
    },
    radius() {
      return parseInt(50 - parseFloat(this.relativeStrokeWidth) / 2, 10)
    },
    trackPath() {
      const radius = this.radius
      return `
          M 50 50
          m 0 -${radius}
          a ${radius} ${radius} 0 1 1 0 ${radius * 2}
          a ${radius} ${radius} 0 1 1 0 -${radius * 2}
          `
    },
    perimeter() {
      return 2 * Math.PI * this.radius
    },
    rate() {
      return 1
    },
    strokeDashoffset() {
      const offset = (-1 * this.perimeter * (1 - this.rate)) / 2
      return `${offset}px`
    },
    trailPathStyle() {
      return {
        strokeDasharray: `${this.perimeter * this.rate}px, ${this.perimeter}px`,
        strokeDashoffset: this.strokeDashoffset
      }
    },
    circlePathStyle() {
      return {
        strokeDasharray: `${this.perimeter *
					this.rate *
					(this.percentage / 100)}px, ${this.perimeter}px`,
        strokeDashoffset: this.strokeDashoffset,
        transition: 'stroke-dasharray 0.6s ease 0s, stroke 0.6s ease'
      }
    },
    stroke() {
      let ret
      if (this.color) {
        return this.color
      } else {
        switch (this.status) {
          case 'success':
            ret = '#13ce66'
            break
          case 'exception':
            ret = '#ff4949'
            break
          case 'warning':
            ret = '#e6a23c'
            break
          default:
            ret = '#20a0ff'
        }
      }
      return ret
    }
  },

  methods: {
    enter() {
      this.$emit('enter', this.info.jobId, this.info.role, this.info.partyId)
    }
  }
}
</script>

<style scoped lang="scss">
.stop1 {
	stop-color: #00cc99;
}

.stop2 {
	stop-color: #0086b3;
}

.circleAnimate {
	stroke-dasharray: 400;
	stroke-dashoffset: 400;
	animation: offset 2s ease-in-out forwards;
}
</style>
