<template>
  <div class="flex flex-col stepwise-container">
    <section class="flex flex-col steps-training">
      <div v-for="(item, index) in commontTables" :key="index" class="eachTable">
        <span class="container-title">{{ item.tableName }}</span>
        <pagination-table
          :table-data="standardTableBody(item.tbody)"
          :header="standardTableHeader(item.theader)"
          :have-default-index="false"
          :has-search="false"
          :has-pagination="false"
          :have-index="false"
          style="width:100%;"
        />
      </div>
    </section>
    <section class="flex flex-col steps-header">
      <span class="container-title">Steps:</span>
      <div class="flex flex-row">
        <span
          v-for="(item,index) in nameOfSteps"
          :key="index"
          :class="{'btn-choosed':(stepIndexOfShowing === item.prop)}"
          class="step-btn"
          @click.stop="chooseStep(item.prop)"
        >{{ item.label }}</span>
      </div>
    </section>
    <section class="flex flex-col steps-content">
      <span class="container-title small-title">{{ displayStepName }}</span>
      <div class="step-line" />
      <div v-for="(item, index) in stepContent.tables" :key="index" class="each-table">
        <span class="container-title small-title sub-title">{{ item.tableName }}</span>
        <pagination-table
          :table-data="standardTableBody(item.tbody)"
          :header="standardTableHeader(item.theader)"
          :have-default-index="false"
          :has-search="false"
          :has-pagination="false"
          :have-index="false"
          style="width:100%;"
        />
      </div>
    </section>
    <footer class="steps-footer">
      <span class="container-title">Summary</span>
      <div v-for="(item, index) in summaryTables" :key="index" class="each-table">
        <span
          v-if="index===0 && item.tableName"
          class="container-title small-title sub-title block-check"
        >choose the end</span>
        <span v-if="item.tableName" class="container-title small-title sub-title">{{ item.tableName }}</span>
        <pagination-table
          :table-data="standardTableBody(item.tbody)"
          :header="standardTableHeader(item.theader)"
          :have-default-index="false"
          :has-search="false"
          :has-pagination="false"
          :have-index="false"
          style="width:100%;"
        />
        <span
          v-if="index===0 && !item.tableName"
          class="container-title small-title sub-title"
        >choose the end</span>
      </div>
    </footer>
  </div>
</template>

<script>
/**
 * name: stepWise
 * purpose: Display data related to stepwise method
 * module: Hetero lr、Hetero lin regression、Hetero poisson regression
 */
import paginationTable from './PaginationTable'
export default {
  name: 'StepwiseOperation',
  components: {
    paginationTable
  },
  props: {
    output: {
      type: Object,
      default: () => {}
    },
    role: {
      type: String,
      default: 'guest'
    },
    requested: {
      type: Number,
      default: 0
    },
    needRequest: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      stepNameOfShowing: 'step0',
      stepIndexOfShowing: 0,
      nameOfSteps: [],
      inited: false,
      stepContent: [],
      displayStepName: '',
      summaryTables: [],
      commontTables: []
    }
  },
  computed: {},

  watch: {
    output: {
      handler() {
        this.initing()
      },
      deep: true
    },
    requested: {
      handler() {
        this.initing()
      }
    }
  },

  beforeMount() {
    this.initing()
  },

  methods: {
    // operations
    chooseStep(stepName) {
      this.stepNameOfShowing = 'step ' + stepName
      this.stepIndexOfShowing = stepName
      this.getStepContent()
      this.getDisplayStepName()
      this.getSummaryTables()
      this.getCommonTable()
    },
    getNameOfSteps() {
      const final = []
      for (let i = 0; i < this.output.steps.length; i++) {
        final.push({
          label: i,
          prop: i
        })
      }
      this.nameOfSteps = final
    },
    getStepContent() {
      this.stepContent = this.output.steps[this.stepIndexOfShowing]
    },
    getDisplayStepName() {
      const removed = this.stepContent.remove
      const entered = this.stepContent.enter
      let extra = ''
      if (removed.length > 0 || entered.length > 0) {
        extra += ' : Effect '
      }
      if (removed.length > 0) {
        extra +=
					(Array.isArray(removed) ? removed.join(', ') : removed) + ' Removed '
      }
      if (entered.length > 0) {
        extra +=
					(Array.isArray(entered) ? entered.join(', ') : entered) + ' Entered '
      }
      this.displayStepName = this.stepNameOfShowing + extra
    },
    getSummaryTables() {
      this.summaryTables = this.output.summary.tables
    },
    getCommonTable() {
      this.commontTables = this.output.common
    },
    standardTableHeader(tableHeader) {
      const final = JSON.parse(JSON.stringify(tableHeader))
      const length = final.length >= 5 ? final.length : 5
      for (let i = 0; i < length; i++) {
        if (typeof final[i] !== 'object') {
          final[i] = {
            label: final[i] || '',
            prop: final[i] || ''
          }
        }
      }
      return final
    },

    standardTableBody(tbody) {
      return tbody
    },

    // other function
    initing() {
      if (this.requested === this.needRequest && !this.inited) {
        this.getNameOfSteps()
        this.chooseStep(this.nameOfSteps[0].prop)
        this.inited = true
      }
    }
  }
}
</script>

<style scoped lang="scss">
.steps-header {
	margin-bottom: 24px;
	.step-btn {
		width: 48px;
		height: 24px;
		font-size: 12px;
		color: #6a6c75;
		background-color: #ebedf0;
		border-radius: 2px;
		margin-right: 10px;
		line-height: 24px;
		text-align: center;
		cursor: pointer;
	}
	.btn-choosed {
		background-color: #4159d1;
		color: #ffffff;
	}
}
.container-title {
	font-size: 24px;
	color: #3e4052;
	// font-family: 'Roboto';
	font-weight: bold;
	margin-bottom: 12px;
}
.small-title {
	font-size: 16px;
}
.sub-title {
	font-size: 12px;
	color: #6a6c75;
}
.block-check {
	display: block;
	margin: 24px 0px;
}
.steps-content {
	.step-line {
		width: 100%;
		height: 2px;
		background-color: #dcdde0;
		margin-bottom: 24px;
	}
	.each-table {
		margin-bottom: 24px;
	}
}
.steps-footer {
	.each-table {
		margin-bottom: 24px;
	}
}
</style>
