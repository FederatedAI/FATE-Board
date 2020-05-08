<template>
  <div v-if="showing">
    <div v-show="hidden">
      <ul class="flex flex-row flex-center">
        <li v-for="(item, index) in briefLegends" :key="index">
          <template v-if="item && item.legend">
            <div class="flex flex-col line-hint">
              <div
                v-for="(color, i) in item.legend"
                :key="i"
                class="flex flex-row flex-center basic-choose"
                @click.stop="chooseOne(item)"
              >
                <span :style="'background-color:' + color.color + ';color: #ffffff;'" class="hint-text">{{ color.text }}</span>
              </div>
            </div>
          </template>
        </li>
        <li @click.stop>
          <icon-hover-and-active
            :class-name="'page-arrow'"
            :default-url="icons.normal.unfold"
            :hover-url="icons.hover.unfold"
            :active-url="icons.active.unfold"
            @clickFn="showingDetails"
          />
        </li>
      </ul>
    </div>
    <div v-show="!hidden" class="flex flex-col flex-center detail-choose-dialog">
      <div class="flex flex-row flex-center space-between detail-title" @click.stop>
        <div class="flex flex-row flex-start detail-title-hint">
          <span class="title-hint-content">
            Total:
            <span class="content-font">{{ total }}</span>
          </span>
          <span class="title-hint-content">
            Selected:
            <span class="content-font">{{ selected }}</span>
          </span>
          <span class="title-hint-content title-operation" @click.stop="clearLegends">Clear</span>
        </div>
        <icon-hover-and-active
          :class-name="'page-arrow'"
          :default-url="icons.normal.fold"
          :hover-url="icons.hover.fold"
          :active-url="icons.active.fold"
          @clickFn="showingDetails"
        />
      </div>
      <div class="flex flex-row flex-wrap flex-start detail-content">
        <div v-for="(item, index) in showingLegends" :key="index" class="detail-item">
          <template v-if="item && item.legend">
            <div class="flex flex-col line-hint-detail">
              <div
                v-for="(color, i) in item.legend"
                :key="i"
                class="flex flex-row flex-center basic-choose"
                @click.stop="chooseOne(item)"
              >
                <span :style="'background-color:' + color.color + ';color: #ffffff;'" class="hint-text-detail">{{ color.text }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconHoverAndActive from '@/components/IconHoverAndActive'
import { mapGetters } from 'vuex'

export default {
  name: 'CurveLegends',

  components: {
    IconHoverAndActive
  },

  props: {
    legendData: {
      type: Array,
      default() {
        return []
      }
    },
    instanceIndex: {
      type: Number,
      default: -1
    },
    instanceList: {
      type: Array,
      default() {
        return []
      }
    },
    needRequest: {
      type: Number,
      default: 0
    },
    requested: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      showingLegends: [],
      choosedLegends: [],
      maxChoosed: 0,
      hidden: true,
      saveColor: [],
      gray: '#bbbbc8',
      connectGray: '#e6e6e6',
      needCurve: {},
      preColor: [
        '#494ECE',
        '#00D269',
        '#FF8103',
        '#00DFCF',
        '#F23BA9',
        '#0080FF',
        '#C13CE1',
        '#FFCD03',
        '#7C56FF',
        '#A7CF02',
        '#00D3FF',
        '#FF1414'
      ],
      preConnect: [
        '#6E78FC',
        '#66E4A5',
        '#FFB367',
        '#6DF1E7',
        '#E576C2',
        '#66B3FF',
        '#DD83F2',
        '#FFEA84',
        '#B692F6',
        '#E1F397',
        '#77E3FF',
        '#FF5A5A'
      ],
      showing: false,
      inited: false,
      canEmit: false
    }
  },

  computed: {
    ...mapGetters(['icons']),
    briefLegends() {
      const briefShowing = []
      if (this.showingLegends.length === 0) {
        return briefShowing
      }
      for (let i = 0; i < 6; i++) {
        briefShowing.push(this.showingLegends[i])
      }
      const hint = { legend: [] }
      hint.legend.push({ color: '#bbbbc8', text: '...' })
      if (this.showingLegends[0].legend.length > 1) {
        hint.legend.push({ color: '#e6e6e6', text: '...' })
      }
      briefShowing.push(hint)
      return briefShowing
    },
    total() {
      return this.showingLegends.length
    },
    selected() {
      return this.choosedLegends.length
    }
  },

  watch: {
    legendData: {
      handler(val, oldVal) {
        this.initShowingLegend()
      },
      deep: true
    },
    requested() {
      if (this.requested === this.needRequest && !this.inited) {
        this.defaultChoosed()
        this.showing = true
        this.inited = true
        if (this.canEmit) {
          this.emitCurve()
        }
      }
    }
  },

  beforeMount() {
    this.initShowingLegend()
  },

  beforeUpdate() {},

  methods: {
    defatultEchartsChoose() {
      if (this.inited) {
        this.emitCurve()
      }
      this.canEmit = true
    },
    initShowingLegend() {
      this.showingLegends = []
      this.maxChoosed = 0
      this.hidden = true
      let index = 0
      this.saveColor = []
      this.needCurve = {
        exchange: [],
        evaluationListIndex: this.instanceIndex,
        instanceList: this.instanceList
      }
      for (const val of this.filterLegend()) {
        const obj = {}
        let content = val
        if (!Array.isArray(val)) {
          content = [val]
        }
        obj.legend = content
        obj.index = index
        this.showingLegends.push(obj)
        index++
      }
      this.getSaveColor()
      if (this.requested === this.needRequest && !this.inited) {
        this.defaultChoosed()
        this.showing = true
        this.inited = true
        if (this.canEmit) {
          this.emitCurve()
        }
      }
    },

    defaultChoosed() {
      if (this.choosedLegends.length === 0) {
        let len =
					this.showingLegends.length > 6 ? 6 : this.showingLegends.length
        len = len < this.maxChoosed ? len : this.maxChoosed
        for (let i = 0; i < len; i++) {
          this.choosedLegend(this.showingLegends[i])
        }
      } else {
        for (let i = 0; i < this.choosedLegends.length; i++) {
          for (const val of this.showingLegends) {
            if (val.legend[0].text === this.choosedLegends[i].legend[0].text) {
              this.choosedLegends.splice(i, 1)
              this.choosedLegend(val)
              break
            }
          }
        }
      }
    },
    getSaveColor(legends) {
      for (const val of this.showingLegends) {
        const color = {}
        color.origin = val.legend[0].color || this.gray
        val.legend[0].color = this.gray
        if (val.legend[1]) {
          color.connect = val.legend[1].color || this.connectGray
          val.legend[1].color = this.connectGray
        }
        this.addToPreColor(color, true)
      }
      if (this.maxChoosed === 0) {
        this.maxChoosed === this.preColor.length
        for (let i = 0; i < this.preColor.length; i++) {
          this.addToPreColor({
            origin: this.preColor[i],
            connect: this.preConnect[i]
          })
        }
      }
    },

    addToPreColor(color, firstTime) {
      let has = false
      if (color.origin === this.gray) {
        return
      }
      for (const val of this.saveColor) {
        if (val.origin === color.origin) {
          has = true
          break
        }
      }
      if (!has) {
        this.saveColor.push(color)
        if (firstTime) {
          this.maxChoosed++
        }
      }
    },

    getPreColor() {
      return this.saveColor.shift()
    },

    clearLegends() {
      while (this.choosedLegends.length > 0) {
        this.choosedLegend(this.choosedLegends[0])
      }
      this.emitCurve()
    },

    chooseOne(obj) {
      this.choosedLegend(obj)
      this.emitCurve()
    },

    choosedLegend(obj) {
      if (obj.legend[0].text === '...') {
        this.showingDetails()
        return
      }
      let has = false
      const curveName = obj.legend[0].text
      let popOut = false
      let useColor = []
      if (this.choosedLegends.length > 0) {
        for (let i = 0; i < this.choosedLegends.length; i++) {
          if (this.choosedLegends[i].legend[0].text === obj.legend[0].text) {
            has = i + 1
            break
          }
        }
      }
      if (has) {
        popOut = true
        const model = this.choosedLegends.splice(has - 1, 1)[0]
        this.addToPreColor({
          origin: model.legend[0].color,
          connect: model.legend[1] ? model.legend[1].color : ''
        })
        model.legend[0].color = this.gray
        if (model.legend[1]) {
          model.legend[1].color = this.connectGray
        }
        this.showingLegends.splice(model.index, 1, model)
      } else {
        if (this.choosedLegends.length >= this.maxChoosed) {
          const model = this.choosedLegends.shift()
          this.addToPreColor({
            origin: model.legend[0].color,
            connect: model.legend[1] ? model.legend[1].color : ''
          })
          popOut = model.legend[0].text
          model.legend[0].color = this.gray
          if (model.legend[1]) {
            model.legend[1].color = this.connectGray
          }
          this.showingLegends.splice(model.index, 1, model)
        }
        const setcolor = this.getPreColor()
        obj.legend[0].color = setcolor.origin
        useColor = [setcolor.origin]
        if (obj.legend[1]) {
          obj.legend[1].color = setcolor.connect
          useColor.push(setcolor.connect)
        }
        this.showingLegends.splice(obj.index, 1, obj)
        this.choosedLegends.push(obj)
      }
      this.needCurve.exchange.push({
        curveName,
        popOut,
        useColor
      })
    },

    emitCurve() {
      if (this.instanceList.length !== 0) {
        for (const val of this.instanceList) {
          if (val.legendIndex === this.instanceIndex) {
            this.$emit('clickLegend', this.needCurve)
            this.needCurve.exchange = []
          }
        }
      }
    },

    // filter Color of other
    filterLegend() {
      const final = JSON.parse(JSON.stringify(this.legendData))
      const afterSold = []
      let middle = 0
      while (final.length > 0) {
        middle = 0
        for (let j = 0; j < final.length; j++) {
          if (Array.isArray(final[middle])) {
            if (final[middle][0].text > final[j][0].text) {
              middle = j
            }
          } else {
            if (final[middle].text > final[j].text) {
              middle = j
            }
          }
        }
        afterSold.push(...final.splice(middle, 1))
      }
      return this.formatterList(afterSold)
    },

    showingDetails() {
      this.hidden = !this.hidden
    },

    closeDetails() {
      this.hidden = true
    },

    formatterList(list) {
      const final = JSON.parse(JSON.stringify(list))
      const compare = function(ass, bss) {
        if (!ass || !bss) return true
        ass = ass.replace(/[\.\-]/g, '_')
        bss = bss.replace(/[\.\-]/g, '_')
        let aStart = ass.toString().match(/^([a-z]|[A-Z])+_?/)
        let bStart = bss.toString().match(/^([a-z]|[A-Z])+_?/)
        if (aStart && bStart && aStart[0] !== bStart[0]) {
          return aStart[0] > bStart[0]
        } else {
          if (aStart && bStart && aStart[0] && bStart[0]) {
            ass = ass.replace(aStart[0], '')
            bss = bss.replace(bStart[0], '')
            if (ass === '' && bss !== '') {
              return false
            } else if (ass !== '' && bss === '') {
              return true
            } else if (ass === '' && bss === '') {
              return true
            }
          }
          aStart = ass.toString().match(/^([0-9])+_?/)
          bStart = bss.toString().match(/^([0-9])+_?/)
          if (bStart && aStart) {
            const anum = aStart[0].replace('_', '')
            const bnum = bStart[0].replace('_', '')
            if (anum && bnum && parseFloat(anum) !== parseFloat(bnum)) {
              return parseFloat(anum) > parseFloat(bnum)
            } else {
              ass = ass.replace(aStart[0], '')
              bss = bss.replace(bStart[0], '')
              return compare(ass, bss)
            }
          } else {
            return compare(ass, bss)
          }
        }
      }
      final.sort((a, b) => {
        let atext = ''
        let btext = ''
        if (Array.isArray(a)) {
          atext = a[0].text
          btext = b[0].text
        } else {
          atext = a.text
          btext = b.text
        }
        const at = JSON.parse(JSON.stringify(atext))
        const bt = JSON.parse(JSON.stringify(btext))
        return compare(at, bt) ? 1 : -1
      })
      return final
    }
  }
}
</script>

<style scoped lang="scss">
.line-hint {
	margin-right: 12px;
	.hint-color {
		width: 10px;
		height: 10px;
		border-radius: 5px;
		margin-right: 5px;
	}
}

.detail-choose-dialog {
	position: absolute;
	top: 14px;
	right: 22px;
	padding: 10px;
	box-shadow: 1px 3px 10px -1px #aaa;
	border-radius: 4px;
}

.basic-choose {
  cursor: pointer;
  .hint-text {
    height: 18px;
    line-height: 14px;
    color: #6A6C75;
    background-color: #EBEDF0;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 2px;
  }
  .hint-text-detail {
    height: 18px;
    line-height: 14px;
    color: #6A6C75;
    background-color: #EBEDF0;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 2px;
  }
}

.detail-choose-dialog {
	z-index: 100000;
	background-color: #fff;
	min-width: 35%;
	max-width: 45%;
	.detail-title {
		width: 100%;
		margin-bottom: 10px;
		.detail-title-hint {
			.title-hint-content {
				font-size: 110%;
				font-weight: 700;
				margin: 0px 15px 0px 5px;
				.content-font {
					color: #494ece;
				}
			}
			.title-operation {
				cursor: pointer;
				color: #808080;
				text-decoration: underline;
			}
		}
	}
	.detail-content {
		width: 100%;
		.detail-item {
      min-width: 25%;
			padding: 5px 0px 10px 0px;
			.line-hint-detail {
				.hint-color-detail {
					width: 10px;
					height: 10px;
					border-radius: 5px;
					margin-right: 5px;
				}
				.basic-choose {
					padding: 2px 5px;
					margin: 1px 0px;
				}
			}
		}
	}
}
</style>
