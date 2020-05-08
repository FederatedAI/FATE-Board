<template>
  <div class="container">
    <canvas :id="canvasId" />
    <div v-if="operationList" class="buttonList">
      <div class="opera_btn" @click="suitableWhole">
        <i class="el-icon-full-screen" />
      </div>
      <div class="opera_btn" @click="bigger">
        <i class="el-icon-plus" />
      </div>
      <div class="opera_btn" @click="small">
        <i class="el-icon-minus" />
      </div>
    </div>
  </div>
</template>

<script>
import flowDiagram from '../canvas/extra/flowDiagram'
import Layer from '../canvas/Core'

export default {
  name: 'FlowDiagram',
  props: {
    dagInfo: {
      type: Object,
      default: () => {}
    },
    purePic: {
      type: Boolean,
      default: false
    },
    thumbnail: {
      type: Boolean,
      default: false
    },
    operationList: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dagCheck: null,
      flowData: null,
      images: null,
      thumb: 0.6,
      canvasId: 'flowDiagramCanvas',
      canvas: null
    }
  },
  watch: {
    dagInfo: {
      handler() {
        this.checkInfo()
        this.checkFlowData()
        if (!this.canvas || !this.canvas.inited) {
          this.initing()
        }
        this.toSetting()
      },
      deep: true
    }
  },
  created() {
    this.canvasId = Layer.getUUID('flowDiagramCanvas')
    this.checkInfo()
    this.checkFlowData()
  },
  mounted() {
    this.initing()
  },

  methods: {
    initing() {
      const can = document.getElementById(this.canvasId)
      if (!can) {
        return false
      }
      const that = this
      if (!that.images || that.images.size === 0) {
        this.initImage(
          [
            {
              name: 'Complete',
              url: require('./icons/complete.svg')
            },
            {
              name: 'disable_Complete',
              url: require('./icons/disable_complete.svg')
            },
            {
              name: 'Success',
              url: require('./icons/complete.svg')
            },
            {
              name: 'disable_Success',
              url: require('./icons/disable_complete.svg')
            },
            {
              name: 'Fail',
              url: require('./icons/error.svg')
            },
            {
              name: 'disable_Fail',
              url: require('./icons/disable_error.svg')
            },
            {
              name: 'Error',
              url: require('./icons/error.svg')
            },
            {
              name: 'disable_Error',
              url: require('./icons/disable_error.svg')
            },
            {
              name: 'Failed',
              url: require('./icons/error.svg')
            },
            {
              name: 'disable_Failed',
              url: require('./icons/disable_error.svg')
            }
          ],
          () => {
            that.drawComp(can)
          }
        )
      } else {
        that.drawComp(can)
      }
    },
    drawComp(canvasDom) {
      const that = this
      const diagramOperation = this.purePic
        ? { click: false }
        : {
          click: {
            props: [
              (name, here) => {
                let dataIndex = 0
                that.dagInfo.component_list.map((item, index) => {
                  if (item.component_name === name) {
                    dataIndex = index
                  }
                })
                const obj = {
                  name,
                  dataIndex,
                  model: that.dagInfo.component_module[name],
                  disable: !that.dagInfo.component_need_run[name]
                }
                if (here) {
                  that.$emit('choose', obj)
                }
              }
            ]
          }
          // eslint-disable-next-line
				  }
      that.canvas = new Layer.CanvasUtil(canvasDom, diagramOperation, can => {
        that.getInstance(can)
        that.component.drawing()
        that.toSetting()
        if (that.thumbnail) {
          that.checkThumbnail()
        }
        return that.component
      })
    },
    getInstance(canvas) {
      if (canvas) {
        this.component = flowDiagram.drawDiagram({
          canvas,
          props: {
            dagInfo: this.flowData,
            thumbnail: this.thumbnail ? this.thumb : 1
          },
          clear: flowDiagram.clear,
          events: flowDiagram.events
        })
      } else {
        return null
      }
    },
    checkInfo() {
      const final = {}
      for (const item of this.dagInfo.component_list) {
        const status = item.status || 'unrun'
        final[item.component_name] = {
          status: status.charAt(0).toUpperCase() + status.slice(1),
          time: item.time
        }
      }
      for (const key in this.dagInfo.component_need_run) {
        final[key].disable = this.dagInfo.component_need_run[key]
      }
      this.dagCheck = final
    },
    checkFlowData() {
      const final = JSON.parse(JSON.stringify(this.dagInfo))
      for (const item of final.component_list) {
        item.status = 'unrun'
      }
      this.flowData = final
    },
    toSetting() {
      if (this.component) {
        for (const key in this.dagCheck) {
          const props = flowDiagram.RUNNING.match(
            this.dagCheck[key].status.toUpperCase()
          )
            ? this.dagCheck[key].time
            : this.images.get(
              (!this.dagCheck[key].disable ? 'disable_' : '') +
									this.dagCheck[key].status
              // eslint-disable-next-line
						  )
          this.component.emit('to' + this.dagCheck[key].status, key, props)
        }
      }
    },
    checkThumbnail() {
      this.component.emit('scale', this.thumb, this.component.toppest)
      this.component._inited = false
    },
    initImage(arr, callback) {
      const that = this
      return new Promise(function(resolve, reject) {
        let complete = 0
        const images = new Map()
        for (const val of arr) {
          // eslint-disable-next-line
					;(() => {
            const v = val
            const img = new Image()
            img.onload = function() {
              images.set(v.name, img)
              complete += 1
              if (complete === arr.length) {
                that.images = images
                callback(images)
                resolve(images)
              }
            }
            img.src = v.url
          })()
        }
      })
    },
    suitableWhole() {
      const that = this
      this.canvas.suitableForWhole(
        () => {
          const style = that.component.$meta.get('clear')
          const point = that.component.toppest
          return { width: style.width, height: style.height, point: point }
        },
        () => {
          that.component.toppest = { x: that.canvas.canvasDom.width / 2, y: 20 }
          that.component._inited = false
        }
      )
    },
    bigger() {
      this.canvas.scaleBigger()
    },
    small() {
      this.canvas.scaleSmaller()
    }
  }
}
</script>

<style scoped lang="scss">
.container {
	width: 100%;
	height: 100%;
	position: relative;
}
.buttonList {
	position: absolute;
	bottom: 10px;
	left: 10px;
	display: flex;
	flex-direction: column;
	.opera_btn {
		width: 32px;
		height: 32px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f8f8fa;
		margin-bottom: 12px;
		color: #bbbbc8;
		&:hover {
			background-color: #494ece;
			color: #fff;
		}
		&:last-child {
			margin-bottom: 0px;
		}
	}
}
</style>
