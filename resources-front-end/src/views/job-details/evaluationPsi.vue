<template>
  <section style="margin-bottom: 24px;">
    <div v-if="topline" class="border-spliter" style="margin-top: 0px;" />
    <pagination-table
      :header="summaryHeader"
      :table-data="summaryBody"
      :has-search="false"
      :has-pagination="false"
      :have-index="true"
      :summary="summaryFinal"
    >
      <div slot="form" class="selection-container flex flex-row flex-center">
        <h3 class="h3-style">PSI Summary</h3>
        <div v-if="selectionModel.length > 1">
          <span class="select-label">Select Model:</span>
          <el-select
            v-model="summaryChoose"
            @change="instanceChange('echartPsiSummary', 'summaryCharts')"
          >
            <el-option v-for="(item, index) in selectionModel" :key="index" :label="item" :value="item" />
          </el-select>
        </div>
      </div>
    </pagination-table>

    <echart-container
      :ref="'echartPsiSummary'"
      :class="[isFullScreen?'full-screen-echart':'echart']"
      :options="summaryCharts"
      :requested="requested"
      :need-request="needRequest"
      :legend-index="'echartPsiSummary'"
      style="height:550px"
      @getEchartInstance="getEchartInstance"
    />

    <pagination-table
      :header="quantileHeader"
      :table-data="quantileBody"
      :has-search="false"
      :has-pagination="false"
      :have-index="true"
      style="margin-top: 24px;"
    >
      <div slot="form" class="selection-container flex flex-row flex-center">
        <h3 class="h3-style">Quantile Distribution</h3>
        <div v-if="selectionModel.length > 1">
          <span class="select-label">Select Model:</span>
          <el-select
            v-model="quantileChoose"
            @change="instanceChange('echartQuantile', 'quantileCharts')"
          >
            <el-option v-for="(item, index) in selectionModel" :key="index" :label="item" :value="item" />
          </el-select>
        </div>
      </div>
    </pagination-table>

    <echart-container
      :ref="'echartQuantile'"
      :class="[isFullScreen?'full-screen-echart':'echart']"
      :options="quantileCharts"
      :requested="requested"
      :need-request="needRequest"
      :legend-index="'echartQuantile'"
      style="height:550px"
      @getEchartInstance="getEchartInstance"
    />
    <div class="border-spliter" style="margin-top: 24px;" />
  </section>
</template>

<script>
import EchartContainer from '@/components/EchartContainer'
import paginationTable from './PaginationTable'

export default {
  name: 'EvaluationPSI',

  components: {
    paginationTable,
    EchartContainer
  },

  props: {
    summary: {
      type: Array | Object,
      default: () => {}
    },
    topline: {
      type: Boolean,
      default: false
    },
    requested: {
      type: Number,
      default: 0
    },
    needRequest: {
      type: Number,
      default: 0
    },
    isFullScreen: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      summaryChoose: '',
      quantileChoose: '',
      echartInstances: new Map(),
      selectionModel: []
    }
  },

  computed: {
    summaryHeader() {
      return this.summaryChoose
        ? Object.keys(this.evaluationPSI).length > 0
          ? this.evaluationPSI[this.summaryChoose].summary
          : []
        : []
    },
    summaryBody() {
      let result = []
      if (this.summaryChoose && Object.keys(this.evaluationPSI).length > 0) {
        result = JSON.parse(
          JSON.stringify(this.evaluationPSI[this.summaryChoose].list)
        )
        for (const val of result) {
          val.expected = (val.expected * 100).toFixed(4) + '%'
          val.actual = (val.actual * 100).toFixed(4) + '%'
        }
      }
      return result
    },
    summaryCharts() {
      return this.evaluationPSI[this.summaryChoose].summaryPic
    },
    summaryFinal() {
      const result = {
        psi: 'Total PSI: ' + this.evaluationPSI[this.summaryChoose].totalPSI
      }
      return result
    },
    quantileHeader() {
      return this.quantileChoose
        ? Object.keys(this.evaluationPSI).length > 0
          ? this.evaluationPSI[this.quantileChoose].quantile
          : []
        : []
    },
    quantileBody() {
      let result = []
      if (this.quantileChoose && Object.keys(this.evaluationPSI).length > 0) {
        result = JSON.parse(
          JSON.stringify(this.evaluationPSI[this.quantileChoose].list)
        )
        for (const val of result) {
          val.expected = (val.expected * 100).toFixed(4) + '%'
          val.actual = (val.actual * 100).toFixed(4) + '%'
          val.val_event = (val.val_event * 100).toFixed(4) + '%'
          val.train_event = (val.train_event * 100).toFixed(4) + '%'
          val.expected_interval =
						val.expected_interval + ' (' + val.expected + ')'
          val.actual_interval = val.actual_interval + ' (' + val.actual + ')'
        }
      }
      return result
    },
    quantileCharts() {
      return this.evaluationPSI[this.quantileChoose].quantilePic
    },
    evaluationPSI() {
      let result = null
      for (const val of this.summary) {
        if (val.type === 'PSI_summary') {
          result = val
        }
      }
      return result ? result.data : result
    }
  },

  watch: {
    summary: {
      handler(newVal, oleVal) {
        this._initing()
      },
      deep: true
    }
  },

  beforeMount() {
    this._initing()
  },

  methods: {
    _initing() {
      this.selectionModel = Object.keys(this.evaluationPSI)
      this.summaryChoose = this.selectionModel[0]
      this.quantileChoose = this.selectionModel[0]
    },
    getEchartInstance(instance, name) {
      this.echartInstances.set(name, instance)
    },
    resize() {
      this.echartInstances.forEach(item => {
        item.resize()
      })
    },
    instanceChange(name, prop) {
      const instance = this.echartInstances.get(name)
      instance.setOption(this[prop])
    }
  }
}
</script>

<style scoped lang="scss">
.selection-container {
	.select-label {
		margin-left: 24px;
		margin-right: 12px;
	}
}
</style>
