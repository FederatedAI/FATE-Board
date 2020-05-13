<template>

  <section>
    <div v-if="isNoMetricOutput && isNoModelOutput" class="no-data">No data</div>
    <ul>
      <li v-for="(output,index) in filterForSpecialData" :key="index">
        <div v-if="output.type==='text'" class="flex">
          <p class="model-text" v-html="output.data"/>
        </div>
        <div v-if="output.type==='table'" class="flex flex-col">
          <pagination-table
            :ref="'table' + index"
            :table-data="output.data.tBody"
            :have-default-index="output.index ? output.index.label : false"
            :header="outputTypeHeaderFilter(output)"
            :has-search="false"
            :has-pagination="false"
            :have-index="false"
            :filters="sampleTableFilter"
            style="width:100%;"
          >
            <template slot="form">
              <div v-if="modelOutputType === modelNameMap.sample" class="flex flex-row flex-start flex-center">
                <el-select v-model="sampleSelection" :clearable="true" size="small" placeholder="请选择label">
                  <el-option v-for="(data,index) in sampleLabels(output.data.tBody)" :key="index" :label="data.label" :value="data.value"/>
                </el-select>
              </div>
            </template>
          </pagination-table>
        </div>
      </li>
    </ul>
    <div v-if="checkForModelDisplay" class="line-height-between">
      <!--boost-->
      <div v-if="modelOutputType===modelNameMap.boost || modelOutputType===modelNameMap.homoBoost">
        <!--<pre class="boost-json"> {{ modelOutput.formatString }} </pre>-->
        <p v-if="bestIterationCheck" class="model-text model-text-big" style="color: #3e4052;font-family: 'Roboto';font-weight: bold;margin-bottom: 12px;">The final model: iter {{ modelOutput.bestIteration }}</p>
        <div class="boost-wrapper">
          <div class="boost-top flex flex-center space-between">
            <!--top-left-->
            <div class="flex flex-center">
              <span class="boost-text h3-style">Tree</span>
              <div>
                <span v-if="modelOutput.classOptions">label_index: </span>
                <el-select v-if="modelOutput.classOptions" v-model="treesValue" size="small" @change="changeBoostTrees">
                  <el-option
                    v-for="item in modelOutput.classOptions"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"/>
                </el-select>
              </div>
            </div>
            <!--top-right-->
            <div class="flex flex-center">
              <div v-show="isTreeBtnLikeLine" class="spectrum-wrapper flex flex-center">
                <span>tree size: max</span>
                <span
                  :style="{'background': `linear-gradient(to right,rgba(${treesColor[treesValue]},1), rgba(${treesColor[treesValue]},0.1))`}"
                  class="spectrum-bar"/>
                <span>min</span>
              </div>
              <!--query-->
              <el-input
                v-model="treeId"
                type="text"
                placeholder="tree Id"
                class="query"
                size="small"
                @keyup.enter.native="enterTreeId">
                <img slot="suffix" :src="icons.normal.query" alt="" class="icon-query" @click="enterTreeId">
              </el-input>
              <icon-hover-and-active
                :class-name="'boost-switch-btn'"
                :default-url="isTreeBtnLikeLine?icons.normal['tree-line']:icons.normal['tree-spectrum']"
                :hover-url="isTreeBtnLikeLine?icons.hover['tree-line']:icons.hover['tree-spectrum']"
                :active-url="isTreeBtnLikeLine?icons.hover['tree-line']:icons.hover['tree-spectrum']"
                @clickFn="swithTreeBtn(`rgb(${treesColor[treesValue]})`)"
              />
            </div>
          </div>
          <div :style="{ 'background': boostSpectrumStyle.background, position: 'relative' }" class="boost-trees">
            <echart-container
              :class="{'w-100':true ,'h-100':true}"
              :options="treeCheckLine"
              @getEchartInstance="getTreesLineInstance"/>
            <boost-tree-hint v-show="isTreeBtnLikeLine" ref="boostTreeHint" :tree-hint="boostSpectrumStyle.colors" :border="boostSpectrumStyle.border" @chooseItem="chooseItems"/>
          </div>
          <div class="flex">
            <span class="boost-text">Tree ID: {{ modelOutput.currentTreeData.id }}</span>
            <span class="boost-text">Tree Size: {{ modelOutput.currentTreeData.size }}</span>
          </div>
          <div v-drag="treeSuitables" v-scale="treeScale" class="tree-container box-border pos-r overflow-hidden">
            <div ref="forTreePic" :style="calcTreeSize" class="pos-a" style="">
              <echart-container
                :class="['w-100','h-100']"
                :options="treeStuffOptions"
                @getEchartInstance="getTreeInstance"/>
            </div>
            <div class="flex flex-col flex-center suitable-button" style="margin-left:20px">
              <div class="sutiable-button-item item-suitable" @click="treeSuitable">
                <i class="el-icon-full-screen"/>
              </div>
              <div class="sutiable-button-item item-plus" @click="treePlus">
                <i class="el-icon-plus"/>
              </div>
              <div class="sutiable-button-item item-minus" @click="treeMinus">
                <i class="el-icon-minus"/>
              </div>
            </div>
          </div>
        </div>
        <!--variable importance-->
        <div v-if="modelOutput.variableImportanceOptions" class="boost-wrapper" style="position:relative;">
          <div class="flex flex-col variable-importance-wrapper" style="overflow:hidden;">
            <div class="flex flex-row space-between" style="margin-bottom:24px">
              <h3 class="feature-title h3-style">Feature Importance</h3>
              <div v-if="(role==='guest' && featureSelectedColors.length > 0) && modelOutputType !== modelNameMap.homoBoost" class="flex flex-end flex-center feature-check">
                <el-checkbox v-model="featureGuest" label="guest" size="small" @change="featureSelectedChange">guest</el-checkbox>
                <el-checkbox v-model="featureHost" label="host" size="small" @change="featureSelectedChange">host</el-checkbox>
                <span class="feature-select" @click.stop="hiddenFeatreSelected">select</span>
                <div v-show="!featureHidden" class="flex flex-col flex-center feature-detail-choose-dialog">
                  <div class="flex flex-row flex-center space-between feature-detail-title" @click.stop>
                    <div class="flex flex-row flex-start feature-detail-title-hint">
                      <span class="feature-title-hint-content">
                        Total:
                        <span class="feature-content-font">{{ featureTotal }}</span>
                      </span>
                      <span class="feature-title-hint-content">
                        Selected:
                        <span class="feature-content-font">{{ featureSelectedTotal }}</span>
                      </span>
                      <span class="feature-title-hint-content feature-title-operation" @click.stop="featureSelectedClear">Clear</span>
                    </div>
                    <i class="el-icon-close page-arrow" style="cursor:pointer;" @click="hiddenFeatreSelected"/>
                  </div>
                  <div class="flex flex-row flex-wrap flex-start feature-detail-content">
                    <div v-for="(item, index) in featureSelectedColors" :key="index" class="flex flex-row flex-center feature-detail-item" @click.stop="chooseOneFeature(item)">
                      <div :style="'background-color:' + item.bgColor + ';'" class="flex flex-row flex-center justify-center feature-detail-content">
                        <span :style="'color:' + item.color + ';'" class="feature-hint-text-deltail">{{ item.text }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="role==='guest' || modelOutputType === modelNameMap.homoBoost" class="feature-table">
              <el-table
                v-if="featureImportanceShowing"
                :data="featureTableBody"
                :cell-class-name="featureImportanceClass"
                :header-cell-class-name="featureImportanceHeaderClass"
                :max-height="'440px'"
                :empty-text="'No Data'"
                size="small"
                @current-change="featureImportanceCurrentChange"
              >
                <el-table-column :label="'FEATURE'" width="100">
                  <template slot-scope="scope">
                    <span class="fearture-span" style="padding-right:20px;">
                      <!-- {{ modelOutputType !== modelNameMap.homoBoost ? (scope.row.sitename.indexOf('guest') >=0 ? scope.row.name : scope.row.fid) : scope.row.name }} -->
                      {{ scope.row.name }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column :label="''">
                  <template slot-scope="scope">
                    <div class="flex flex-row flex-center">
                      <el-progress :percentage="featureImportanceProgress(scope)" :format="boostProgressFormat" :show-text="false" class="feature-progress"/>
                      <span>{{ scope.row.importance }}</span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
        <div v-if="role==='host' && modelOutput.featureHostTable && modelOutputType !== modelNameMap.homoBoost" class="boost-wrapper" style="position:relative;">
          <div class="variable-importance-wrapper" style="overflow-x:hidden;max-height:800px">
            <h3 class="feature-title h3-style">Feature Mapping</h3>
            <pagination-table
              :table-data="modelOutput.featureHostTable.tBody"
              :page-size="10"
              :header="modelOutput.featureHostTable.tHeader"
              :default-index="true"
            />
          </div>
        </div>
      </div>
      <!--dataio-->
      <div v-else-if="modelOutputType===modelNameMap.dataIO">
        <div v-if="modelOutput.imputerData" style="margin-bottom: 12px;">
          <pagination-table
            :table-data="modelOutput.imputerData"
            :page-size="10"
            :header="dataIoImputerHeader"
          >
            <div slot="form" class="flex flex-center space-between" style="padding: 10px">
              <h2>Missing Fill Detail</h2>
            </div>
          </pagination-table>
        </div>
        <div v-if="modelOutput.outlierData">
          <pagination-table
            :table-data="modelOutput.outlierData"
            :page-size="10"
            :header="dataIoOulierHeader"
          >
            <div slot="form" class="flex flex-center space-between" style="padding: 10px">
              <h2>Outlier Replace Detail</h2>
            </div>
          </pagination-table>
        </div>
      </div>
      <!--scale-->
      <div v-else-if="modelOutputType===modelNameMap.scale">
        <pagination-table
          :table-data="modelOutput.tBody"
          :page-size="10"
          :header="filterScaleHeader"
        />
      </div>
      <!--lr-->
      <div
        v-else-if="modelOutputType===modelNameMap.homoLR ||
          modelOutputType===modelNameMap.heteroLR||
          modelOutputType===modelNameMap.sklearnLR||
          modelOutputType===modelNameMap.heteroLinR ||
          modelOutputType===modelNameMap.homoNN ||
        modelOutputType===modelNameMap.poisson"
        class="line-height-between">
        <p v-if="bestIterationCheck" class="model-text model-text-big" style="color: #3e4052;font-family: 'Roboto';font-weight: bold;margin-bottom: 12px;">The Final Model: iter {{ modelOutput.bestIteration }}</p>
        <div v-if="LRSelect.length > 0" class="flex flex-row flex-center">
          <span class="model-text lr-span-label" style="padding-right:5px;margin-bottom: 0px;">one_vs_rest model:</span>
          <el-select :value="lrModelChooseItem" size="mini" @change="LrSelection">
            <el-option
              v-for="(item, index) in LRSelect"
              :key="index"
              :label="item.replace(/\:.+/, '')"
              :value="item"/>
          </el-select>
        </div>
        <p v-if="filterForStepwise" class="model-text" style="color: #3e4052;font-family: 'Roboto';font-weight: bold;margin-bottom: 12px;">The Final Model Information:</p>
        <p v-if="LRSelect.length > 0 && role === 'guest'" class="model-text" style="margin-bottom: 0">model label: {{ lrModelChooseItem.replace(/^.+\:/, '') }}</p>
        <p class="model-text" style="margin-bottom: 0">iterations: {{ LRIters }}</p>
        <p class="model-text">converged: {{ LRisConverged }}</p>
        <pagination-table
          :table-data="LRtData"
          :page-size="10"
          :header="lrHeader"/>
      </div>
      <!-- heteroNN -->
      <div v-else-if="modelOutputType===modelNameMap.heteroNN">
        <p v-if="bestIterationCheck" class="model-text model-text-big" style="color: #3e4052;font-family: 'Roboto';font-weight: bold;margin-bottom: 12px;">The Final Model: iter {{ modelOutput.bestIteration }}</p>
      </div>
      <!--selection-->
      <div v-else-if="modelOutputType===modelNameMap.selection">
        <pagination-table
          :table-data="selectionContent"
          :cell-class-name="selectionCellClassName"
          :header="selectionHeader"
          :have-index="false"
          :have-default-index="true"
          :has-pagination="false"
        >
          <template slot="formAppend">
            <div
              v-if="role==='guest'"
              class="flex flex-end flex-center"
              style="margin-left:40px;">
              <el-radio v-model="selectionType" size="small" label="guest">guest</el-radio>
              <el-radio v-model="selectionType" :disabled="!(modelOutput.hostBody && modelOutput.hostBody.length>0)" label="host" size="small" @change="hostSelectionRadio">host</el-radio>
              <el-select :disabled="!(selectionType === 'host')" v-model="selectionSelection" size="small" placeholder="请选择">
                <el-option v-for="(item, index) in selectionHostType" :key="index" :label="item.label" :value="item.value"/>
              </el-select>
            </div>
          </template>
        </pagination-table>
      </div>
      <!--one hot-->
      <div v-else-if="modelOutputType===modelNameMap.oneHot">
        <div style="margin-top: 20px;">
          <pagination-table
            :table-data="oneHotSelectValue ? modelOutput.variableData[oneHotSelectValue] : []"
            :page-size="10"
            :header="oneHotHeader"
            :has-search="false"
          >
            <div slot="form">
              <el-select v-model="oneHotSelectValue" no-data-text="no data" size="small" placeholder="" @change="changeOneHot">
                <el-option
                  v-for="(item,index) in modelOutput.options"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </pagination-table>
        </div>
      </div>
      <!--binning-->
      <div v-else-if="modelOutputType===modelNameMap.binning">
        <pagination-table
          :table-data="binningTableContent"
          :page-size="10"
          :header="filterHeader()"
        >
          <template slot="formAppend">
            <div v-if="role==='guest'" class="flex flex-end flex-center" style="margin-left:40px;" >
              <el-checkbox v-model="binningType" size="small" label="guest">guest</el-checkbox>
              <el-checkbox v-model="binningHostType" :disabled="countingModel['hostData'].id.length === 0" size="small" label="host">host</el-checkbox>
              <el-select :disabled="!binningHostType" v-model="binningSelection" multiple collapse-tags size="small" placeholder="请选择">
                <el-option v-for="(item, index) in binningHostSelections" :key="index" :label="item" :value="item"/>
              </el-select>
            </div>
          </template>
        </pagination-table>
        <div class="border-spliter"/>
        <div>
          <div v-if="binningSelectValue">
            <pagination-table
              :has-search="false"
              :table-data="binningSecondTableContent"
              :page-size="10"
              :header="binningHeaderfliter"
            >
              <template slot="form">
                <el-select v-model="binningSelectValue" size="small" @change="changeBinning">
                  <el-option
                    v-for="(item,index) in binningSecongTableContentSelect"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
              <template slot="formAppend">
                <div v-if="role==='guest'" class="flex flex-end flex-center">
                  <el-radio v-model="binningSelectValueType" label="guest" size="small" @change="changeToHost">guest</el-radio>
                  <el-radio v-model="binningSelectValueType" :disabled="binningHostSelections.length === 0" size="small" label="host" @change="changeToHost">host</el-radio>
                  <el-select :disabled="binningSelectValueType !== 'host'" v-model="binningSelectHostContent" placeholder="请选择" size="small" @change="changeToHost">
                    <el-option v-for="(item, index) in binningHostSelections" :key="index" :label="item" :value="item"/>
                  </el-select>
                </div>
              </template>
            </pagination-table>
          </div>
        </div>
        <echart-container v-if="hostEchartsHiddenBeforeHaveData" :class="isFullScreen?'full-screen-echart':'echart'" style="margin-top:24px;" @getEchartInstance="getStackBarInstance" />
        <echart-container v-if="hostEchartsHiddenBeforeHaveDatas" :class="isFullScreen?'full-screen-echart':'echart'" style="margin-top:24px;" @getEchartInstance="getWoeInstance"/>
      </div>
      <!-- correlation -->
      <div v-else-if="modelOutputType===modelNameMap.correlation">
        <div class="flex flex-row flex-start correlation-containers">
          <pagination-table
            :table-data="modelOutput.correlation.anony"
            :page-size="10"
            :header="modelOutput.correlation.anonyHeader"
            class="correlation-table"
          />
          <correlation
            ref="correlationCanvas"
            :variable="modelOutput.correlation.localHeader"
            :other-variable="modelOutput.correlation.otherHeader"
            :nums="modelOutput.correlation.corr"
            :role="role"
            :class="{'fullscreen-canvas':isFullScreen}"
            class="correlation-relationship-canvas"
          />
        </div>
      </div>
    </div>
    <div v-if="filterForStepwise">
      <stepwise :output="filterForStepwise" :role="role" :requested="requested" :need-request="needRequest"/>
    </div>
    <ul v-if="lossList.length>0" class="cv-wrapper line-height-between">
      <li
        v-for="(output,instanceIndex) in lossList"
        :key="instanceIndex"
        style="position:relative;"
      >
        <div v-if="output.type.toLowerCase()==='loss'" class="w-100 overflow-hidden">
          <div class="cv-top flex flex-center space-between" style="min-height:42px;align-items:flex-start;">
            <div class="flex flex-center">
              <h3 class="h3-style" style="margin-right: 20px;">{{ output.type }}</h3>
              <p class="name_space_for_h3_style">{{ output.nameSpace }}</p>
              <div v-if="showFresh" class="flex flex-row flex-center refresh-pointer loss-refresh" @click="refreshNew">
                <i class="el-icon-refresh-right refresh-content"/>
                <span>refresh</span>
              </div>
            </div>
            <curve-legends
              :ref="'loss' + output.type + output.nameSpace"
              :legend-data="output.legendData"
              :instance-index="instanceIndex"
              :instance-list="lossInstanceList"
              :requested="requested"
              :need-request="needRequest"
              @clickLegend="clickLegendForCurves"/>
          </div>
          <echart-container
            :class="[isFullScreen?'full-screen-echart':'echart']"
            :options="initEchartOptions(output.data, true)"
            :legend-index="instanceIndex"
            :requested="requested"
            :need-request="needRequest"
            @initedAllOptions="emitCurvelegengEmit('loss' + output.type + output.nameSpace)"
            @getEchartInstance="getLossInstance"/>
        </div>
        <div v-else class="w-100 overflow-hidden">
          <div class="cv-top flex flex-center space-between" style="min-height:42px;align-items:flex-start;">
            <div class="flex flex-center">
              <h3 class="h3-style" style="margin-right: 20px;">{{ output.type }}</h3>
              <p>{{ output.nameSpace }}</p>
            </div>
            <curve-legends
              :legend-data="output.legendData"
              :instance-index="instanceIndex"
              :instance-list="lossInstanceList"
              @clickLegend="clickLegend"/>
          </div>
          <echart-container
            :class="[isFullScreen?'full-screen-echart':'echart']"
            :options="output.data"
            :legend-index="instanceIndex"
            @getEchartInstance="getLossInstance"/>
        </div>
      </li>
    </ul>
    <!--model summary-->
    <div v-if="modelSummaryData.tHeader.length>0 && modelSummaryCollapsedMsg.length>0">
      <pagination-table
        :header="modelSummaryCollapsedHeader"
        :table-data="modelSummaryCollapsedMsg"
        :span-method="summarySpanMethod"
        :has-search="(modelSummaryTitle === 'Performance scores')"
        :has-pagination="false"
        :have-index="false"
      >
        <h3 slot="form" class="h3-style">{{ modelSummaryTitle }}</h3>
      </pagination-table>
      <div class="border-spliter" />
    </div>
    <!--cv-->
    <div class="flex flex-row flex-center space-between">
      <ul v-if="evaluationOutputTypeList.length > 1" class="cv-tab-list flex flex-center line-height-between">
        <li
          v-for="(type,index) in evaluationOutputTypeList"
          :key="index"
          :class="{active:currentCvTab===index}"
          @click="changeCvTab(index)"
        >{{ type }}
        </li>
      </ul>
    </div>
    <ul v-if="evaluationInstances.length>0" class="cv-wrapper line-height-between">
      <li
        v-for="(output,instanceIndex) in evaluationInstances"
        v-show="output.type === evaluationOutputTypeList[currentCvTab] && allNameSpace[choosedNameSpace] === output.nameSpace"
        :key="instanceIndex"
        style="position:relative;"
        @click="exchangeCurveStatus('cv' + output.type + output.nameSpace)"
      >
        <div v-if="haveDataTypeList.indexOf(output.type)!==-1" class="w-100 overflow-hidden">
          <div class="cv-top flex flex-center space-between" style="min-height:42px;align-items:flex-start;">
            <div class="flex flex-center">
              <h3 class="h3-style" style="margin-right: 20px;">{{ output.type }}</h3>
              <div class="flex flex-row">
                <span
                  v-for="(nameItem, nameIndex) in allNameSpace"
                  :key="nameIndex"
                  :class="{'chooseed-namespace':allNameSpace[choosedNameSpace] === nameItem}"
                  class="chooseable-namespace"
                  @click="changeChoosedNameSpace(nameIndex, 'echart' + output.type)">{{ nameItem }}</span>
                <div v-if="showFresh" class="flex flex-row flex-center refresh-pointer" @click="refreshNew">
                  <i class="el-icon-refresh-right refresh-content"/>
                  <span>refresh</span>
                </div>
              </div>
            </div>
            <curve-legends
              :ref="'cv' + output.type + output.nameSpace"
              :legend-data="output.legendData"
              :instance-index="instanceIndex"
              :instance-list="echartInstanceList"
              :requested="requested"
              :need-request="needRequest"
              @clickLegend="clickLegendForCurves"/>
          </div>
          <echart-container
            :ref="'echart' + output.type + output.nameSpace"
            :class="[isFullScreen?'full-screen-echart':'echart']"
            :options="initEchartOptions(output.data, true)"
            :legend-index="instanceIndex"
            :requested="requested"
            :need-request="needRequest"
            @initedAllOptions="emitCurvelegengEmit('cv' + output.type + output.nameSpace)"
            @getEchartInstance="getEchartInstance"/>
        </div>
      </li>
    </ul>
  </section>
</template>

<script>
import EchartContainer from '@/components/EchartContainer'
import IconHoverAndActive from '@/components/IconHoverAndActive'
import PaginationTable from './PaginationTable'
import { deepCloneArr, exportExcel, deepClone, formatFloat } from '@/utils'
import CurveLegend from './CurveLegend'
import CurveLegends from './CurveLegends'
import Correlation from '@/components/CanvasComponent/pearsonDiagram'
import BoostTreeHint from './BoostTreeHint'
import { mapGetters } from 'vuex'
import stepwise from './stepwise'

export default {
  name: 'ModelOutput',
  components: {
    EchartContainer,
    PaginationTable,
    CurveLegend,
    CurveLegends,
    IconHoverAndActive,
    Correlation,
    BoostTreeHint,
    stepwise
  },
  props: {
    metricOutputList: {
      type: Array,
      default() {
        return []
      }
    },
    modelSummaryData: {
      type: Object,
      default() {
        return {
          tHeader: [],
          tBody: []
        }
      }
    },
    role: {
      type: String,
      default: ''
    },
    modelOutputType: {
      type: String,
      default: ''
    },
    modelOutput: {
      type: Object,
      default() {
        return {}
      }
    },
    isNoModelOutput: {
      type: Boolean,
      default: false
    },
    isNoMetricOutput: {
      type: Boolean,
      default: false
    },
    isFullScreen: {
      type: Boolean,
      default: false
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
      binningSelectValue: '',
      oneHotSelectValue: '',
      stackBarInstance: null,
      treesLineInstance: null,
      variableImportanceInstance: null,
      echartInstanceList: [],
      lossInstanceList: [],
      isTreeBtnLikeLine: true,
      woeInstance: null,
      imputerDataPage: 1,
      outlierDataPage: 1,
      binningType: true,
      binningHostType: false,
      binningSelection: [],
      selectionSelection: '',
      selectionType: 'guest',
      featureGuest: true,
      featureHost: false,
      featureImportanceShowing: true,
      treeInstance: null,
      treeId: '',
      treesValue: 0,
      hostEchartsHiddenBeforeHaveData: false,
      hostEchartsHiddenBeforeHaveDatas: false,
      evaluationOutputTypeListArr: ['ROC', 'K-S', 'Lift', 'Gain', 'Precision Recall', 'Accuracy'],
      choosedNameSpace: 0,
      dataIoOulierHeader: [
        {
          prop: 'variable',
          label: 'variable'
        },
        {
          prop: 'ratio',
          label: 'outlier value ratio'
        },
        {
          prop: 'value',
          label: 'fill_value'
        }
      ],
      oneHotHeader: [
        {
          prop: 'value',
          label: 'value'
        },
        {
          prop: 'encoded_vector',
          label: 'encoded_vector'
        }
      ],
      lrHeader: [
        {
          prop: 'variable',
          label: 'variable',
          sortable: true
        },
        {
          prop: 'weight',
          label: 'weight',
          sortable: true
        }
      ],
      scaleHeader: [
        {
          prop: 'variable',
          label: 'variable'
        },
        {
          prop: 'columnLower',
          label: 'columnLower'
        },
        {
          prop: 'columnUpper',
          label: 'columnUpper'
        },
        {
          prop: 'mean',
          label: 'mean'
        },
        {
          prop: 'std',
          label: 'std'
        }
      ],
      dataIoImputerHeader: [
        {
          prop: 'variable',
          label: 'variable'
        },
        {
          prop: 'ratio',
          label: 'imputer value ratio'
        },
        {
          prop: 'value',
          label: 'fill_value'
        }
      ],
      binningSummaryHeader: [
        {
          prop: 'variable',
          label: 'variable'
        },
        {
          prop: 'iv',
          label: 'IV'
        },
        {
          prop: 'monotonicity',
          label: 'monotonicity'
        }
      ],
      binningHeader: [
        {
          prop: 'binning',
          label: 'binning'
        },
        {
          prop: 'iv',
          label: 'iv'
        },
        {
          prop: 'woe',
          label: 'woe'
        },
        {
          prop: 'event_count',
          label: 'event_count'
        },
        {
          prop: 'event_ratio',
          label: 'event_ratio'
        },
        {
          prop: 'non_event_count',
          label: 'non_event_count'
        },
        {
          prop: 'non_event_ratio',
          label: 'non_event_ratio'
        }
      ],
      hideColor: '#999BA3',
      sampleSelection: '',
      featureHidden: true,
      featureSelected: [],
      featureIniting: false,
      binningSelectionInit: false,
      binningSelectValueType: 'guest',
      binningSelectHostContent: '',
      treeSuitables: {},
      treeScale: '',
      featureImportCurrentRow: '',
      lrModelChoose: 0
    }
  },
  computed: {
    ...mapGetters([
      'modelNameMap',
      'metricTypeMap',
      'currentCvTab',
      'evaluationFlags',
      'evaluationInstances',
      'treesColor',
      'treesBorderColor',
      'icons'
    ]),
    checkForModelDisplay() {
      return this.modelOutputType && this.modelOutput && !this.isNoModelOutput
    },
    bestIterationCheck() {
      const bi = this.modelOutput.bestIteration
      return bi !== undefined ? (bi !== -1) : false
    },
    allNameSpace() {
      const final = []
      for (const val of this.evaluationInstances) {
        if (final.indexOf(val.nameSpace) < 0) {
          final.push(val.nameSpace)
        }
      }
      return final
    },
    LRisConverged() {
      if (this.modelOutput.isConverged !== undefined) {
        return this.modelOutput.isConverged
      } else {
        return this.modelOutput.tData[this.lrModelChoose].isConverged
      }
    },
    LRIters() {
      if (this.modelOutput.iters !== undefined) {
        return this.modelOutput.iters
      } else {
        return this.modelOutput.tData[this.lrModelChoose].iters
      }
    },
    LRtData() {
      if (this.modelOutput.tData[this.lrModelChoose].data) {
        return this.modelOutput.tData[this.lrModelChoose].data
      } else {
        return this.modelOutput.tData
      }
    },
    LRSelect() {
      const final = []
      if (this.modelOutput.tData[0].name) {
        for (const val of this.modelOutput.tData) {
          final.push(val.name)
        }
      }
      return final
    },
    lrModelChooseItem() {
      return this.modelOutput.tData[this.lrModelChoose].name
    },
    filterForSpecialData() {
      const final = []
      const special = ['stepwise']
      for (const val of this.metricOutputList) {
        if (val.type.indexOf(special) < 0) {
          final.push(val)
        }
      }
      return final
    },
    filterForStepwise() {
      for (const val of this.metricOutputList) {
        if (val.type === 'stepwise') {
          return val.data
        }
      }
      return null
    },
    binningHeaderfliter() {
      const headers = JSON.parse(JSON.stringify(this.binningHeader))
      if (this.role.toUpperCase() === 'HOST') {
        headers.splice(1, 0, {
          prop: 'anonym in guest',
          label: 'anonym in guest'
        })
      }
      return headers
    },
    treeStuffOptions() {
      return this.modelOutput.treeOptions
    },
    correlationContent() {
      return []
    },
    correlationHeader() {
      return []
    },
    correlationVariable() {
      return [...this.modelOutput.localHeader, ...this.otherSelection]
    },
    showFresh() {
      if (this.evaluationInstances.length > 0) {
        for (const val of this.evaluationInstances) {
          if (val.type === this.evaluationOutputTypeList[this.currentCvTab]) {
            return true
          }
        }
      }
      return false
    },
    featureTotal() {
      const final = []
      for (const val of this.modelOutput.featureTable.tBody) {
        if (val.sitename.indexOf('host') >= 0) {
          if (final.indexOf(val.sitename) < 0) {
            final.push(val.sitename)
          }
        }
      }
      return final.length
    },
    featureSelectedTotal() {
      return this.featureSelected.length
    },
    featureSelectedColors() {
      const final = []
      for (const val of this.modelOutput.featureTable.tBody) {
        if (val.sitename.indexOf('host') >= 0) {
          if (final.indexOf(val.sitename) < 0) {
            final.push(val.sitename)
          }
        }
      }
      for (let i = 0; i < final.length; i++) {
        const val = final[i]
        if (this.featureSelected.indexOf(val) >= 0) {
          final[i] = { text: val, color: '#ffff', bgColor: '#4159D1' }
        } else {
          final[i] = { text: val, color: this.hideColor, bgColor: '#EBEDF0' }
        }
      }
      return final
    },
    featureTableBody() {
      const final = JSON.parse(JSON.stringify(this.modelOutput.featureTable.tBody))
      if (!this.featureGuest && this.modelOutputType !== this.modelNameMap.homoBoost) {
        for (let i = 0; i < final.length; i++) {
          if (final[i].sitename.indexOf('guest') >= 0) {
            final.splice(i, 1)
            i--
          }
        }
      }
      if (!this.featureHost && this.modelOutputType !== this.modelNameMap.homoBoost) {
        for (let i = 0; i < final.length; i++) {
          if (final[i].sitename.indexOf('host') >= 0) {
            final.splice(i, 1)
            i--
          }
        }
      } else {
        for (let i = 0; i < final.length; i++) {
          if (final[i].sitename.indexOf('host') >= 0) {
            if (this.featureSelected.indexOf(final[i].sitename) < 0) {
              final.splice(i, 1)
              i--
            }
          }
        }
      }
      return final
    },
    binningTableContent() {
      const final = []
      const idList = this.countingModel.hostData.id
      if (this.binningType) {
        final.push(...this.countingModel.data.sourceData)
      }
      if (this.binningHostType) {
        if (this.binningSelection.length > 0 && this.binningSelection[0]) {
          for (const val of this.binningSelection) {
            const index = idList.indexOf(val)
            final.push(...this.countingModel.hostData.data[index].sourceData)
          }
        }
      }
      return final
    },
    binningHostSelections() {
      if (!this.binningSelectionInit) {
        this.initbinningSelection(this.countingModel.hostData.id)
      }
      return this.countingModel.hostData.id
    },
    binningSecondTableContent() {
      if (!this.binningSelectHostContent) {
        this.initBinningSecondSelection()
      }
      let obj = this.countingModel[this.binningSelectValueType === 'guest' ? 'data' : 'hostData']
      if (this.binningSelectValueType === 'host') {
        for (let i = 0; i < obj.id.length; i++) {
          if (this.binningSelectHostContent === obj.id[i]) {
            obj = obj.data[i]
            break
          }
        }
      }
      return obj.variableData[this.binningSelectValue]
    },
    binningSecongTableContentSelect() {
      const vm = this
      if (!this.binningSelectHostContent) {
        this.initBinningSecondSelection()
      }
      let obj = this.countingModel[this.binningSelectValueType === 'guest' ? 'data' : 'hostData']
      if (this.binningSelectValueType === 'host') {
        for (let i = 0; i < obj.id.length; i++) {
          if (this.binningSelectHostContent === obj.id[i]) {
            obj = obj.data[i]
            break
          }
        }
      }
      const final = JSON.parse(JSON.stringify(obj.options))
      final.sort((a, b) => {
        const compare = vm.bigger(a.label, b.label)
        if (compare === 0) return 0
        else if (compare) return 1
        else return -1
      })
      return final
    },
    secureBoostFeature() {
      return this.modelOutput.variableImportanceOptions
    },
    boostSpectrumStyle() {
      if (!this.modelOutput.treesOverviewData || this.modelOutput.treesOverviewData.length === 0) {
        return ''
      }
      const data = this.modelOutput.treesOverviewData
      const color = this.treesColor[this.treesValue || 0]
      const border = this.treesBorderColor[this.treesValue || 0]
      if (data.length > 1) {
        const unit = 100 / (data.length - 1)
        let maxSize = 0
        let minSize = 0
        this.modelOutput.treesOverviewData.forEach((item, index) => {
          const size = item.size
          if (index === 0) {
            maxSize = minSize = size
          } else {
            if (size > maxSize) {
              maxSize = size
            }
            if (size < minSize) {
              minSize = size
            }
          }
        })
        const diffValue = maxSize - minSize
        const getOpacity = size => {
          const v = size - minSize
          return diffValue > 0 ? (v / diffValue * 0.7) + 0.3 : 1
        }
        let gradientStr = ''
        const fromColor = []
        this.modelOutput.treesOverviewData.forEach((item, index, data) => {
          gradientStr += `rgba(${color},${getOpacity(item.size)}) ${unit * index}%`
          fromColor.push({ color: `rgba(${color},${getOpacity(item.size)})`, treeId: index, treeData: item.data, treeSize: item.size })
          if (index < data.length - 1) {
            gradientStr += ', '
          }
        })
        // console.log(gradientStr)
        return {
          // 'background': `linear-gradient(to right,rgba(73,78,206,0.7) 30%, rgba(73,78,206,0.2) 70%, rgba(73,78,206,0.9) 100%)`
          'background': `linear-gradient(to right,${gradientStr})`,
          colors: fromColor,
          border: border
        }
      } else {
        return { 'background': 'rgba(73,78,206,0.05)', colors: [{ color: `rgba(${color},1)`, treeId: 0 }], border: `rgba(${border},1)` }
      }
    },
    calcTreeSize() {
      const vm = this
      // const size = this.modelOutput.currentTreeData.size
      const treeWidth = this.modelOutput.currentTreeData.treeWidth
      const depth = this.modelOutput.currentTreeData.maxDepth
      // console.log(size, depth)
      let height = '100%'
      const width = '100%'
      let minWidth = '100%'
      if (depth > 3) {
        // width = `calc(100% + ${size} * 75px)`
        minWidth = `${treeWidth}px`
      }
      if (depth > 5) {
        height = `calc(100% + ${depth - 5} * 100px)`
      }
      this.$nextTick(() => {
        const p = getComputedStyle(this.$refs['forTreePic'].parentElement)
        const s = getComputedStyle(this.$refs['forTreePic'])
        const scale = this.$refs['forTreePic'].style.transform ? parseFloat(this.$refs['forTreePic'].style.transform.replace(/scale\(/, '')) : 1
        const cleft = (parseFloat(p.width) - parseFloat(s.width)) / 2
        const ctop = (parseFloat(s.height) * (scale - 1)) / 2
        vm.$refs['forTreePic'].style.top = ctop + 'px'
        vm.$refs['forTreePic'].style.left = cleft + 'px'
        vm.treeInstance.resize()
      })
      return {
        width, height, minWidth
      }
    },
    evaluationOutputTypeList() {
      const arr = []
      this.evaluationInstances.forEach(item => {
        if (item.type && arr.indexOf(item.type) === -1) {
          arr.push(item.type)
        }
      })
      return this.evaluationOutputTypeListArr.filter(type => {
        return arr.indexOf(type) !== -1
      })
    },
    modelSummaryCollapsedMsg() {
      const final = {}
      let f = []
      const collapse = JSON.parse(JSON.stringify(this.modelSummaryData.tBody))
      for (const val of collapse) {
        if (!final[val.metric_namespace]) {
          final[val.metric_namespace] = []
        }
        final[val.metric_namespace].push(val)
      }
      for (const index in final) {
        final[index] = this.sortOfByName(final[index], 'metric_name')
      }
      for (const index in final) {
        f = Array.concat(f, final[index])
      }
      return f
    },
    modelSummaryCollapsedHeader() {
      const header = JSON.parse(JSON.stringify(this.modelSummaryData.tHeader))
      if (this.modelSummaryTitle === 'Performance scores') {
        for (const val of header) {
          if (val.label !== '') {
            val.sortable = true
          }
        }
      }
      return header
    },
    haveDataTypeList() {
      return this.evaluationOutputTypeList.filter((item, index) => {
        return this.evaluationFlags[index] === true
      })
    },
    lossList() {
      return this.evaluationInstances.filter(item => {
        return item.type === this.metricTypeMap.loss
      })
    },
    modelSummaryTitle() {
      return this.modelOutputType === this.modelNameMap.evaluation
        // ? 'Evaluation scores' : 'Cross Performance scores'
        ? 'Evaluation scores' : 'Performance scores'
    },
    filterScaleHeader() {
      const isHideCol = this.metricOutputList[0] && this.metricOutputList[0].scaleMethod === 'min_max_scale'
      const header = isHideCol ? this.scaleHeader.slice(0, 3) : this.scaleHeader
      for (const val of header) {
        val.sortable = true
      }
      return header
    },
    countingModel() {
      if (this.modelOutputType === this.modelNameMap.selection) {
        this.filterSelectionHeader()
      }
      const models = JSON.parse(JSON.stringify(this.modelOutput))
      return models
    },
    treeCheckLine() {
      const middle = deepClone(this.modelOutput.treesLineData)
      if (Array.isArray(middle.yAxis)) {
        middle.yAxis[0].max = this.modelOutput.maxTreeSize
      } else {
        middle.yAxis.max = this.modelOutput.maxTreeSize
      }
      return middle
    },
    treeCheckHint() {
      const middle = deepClone(this.modelOutput.treesLineData)
      if (Array.isArray(middle.yAxis)) {
        middle.yAxis[0].max = this.modelOutput.maxTreeSize
      } else {
        middle.yAxis.max = this.modelOutput.maxTreeSize
      }
      return middle
    },
    sampleTableFilter() {
      if (this.sampleSelection !== '' && this.sampleSelection !== null && this.sampleSelection !== undefined) {
        return [{ col: 'label', filter: [this.sampleSelection] }]
      } else {
        return []
      }
    },
    selectionHostType() {
      const final = []
      for (let i = 0; i < this.countingModel['hostBody'].length; i++) {
        final.push({ label: i, value: i })
      }
      return final
    },
    selectionContent() {
      if (this.selectionType === 'guest') {
        return this.countingModel[this.selectionType + 'Body']
      } else {
        return this.countingModel[this.selectionType + 'Body'][this.selectionSelection]
      }
    },
    selectionHeader() {
      if (this.selectionType === 'guest') {
        return this.countingModel[this.selectionType + 'Header']
      } else {
        return this.countingModel[this.selectionType + 'Header'][this.selectionSelection]
      }
    }
  },
  watch: {
    modelOutput() {
      this.initFeatureShowing()
    }
  },
  mounted() {
    // console.log('mounted')
    // console.log(this.modelSummaryData)
    window.addEventListener('resize', function() {

    })
  },
  beforeUpdate() {
    // console.log('before update')
    this.initFeatureShowing()
  },
  updated() {
    if (this.modelOutputType === this.modelNameMap.binning && this.modelOutput) {
      let list = []
      let index = 0
      list = this.modelOutput[this.binningSelectValueType === 'guest' ? 'data' : 'hostData']
      if (this.binningSelectValueType !== 'guest') {
        for (let i = 0; i < list.id.length; i++) {
          if (this.binningSelectHostContent === list.id[i]) {
            index = i
            break
          }
        }
        list = list.data[index]
      }
      if (list && list.options && !this.binningSelectValue) {
        this.binningSelectValue = list.options[0].value
      }
      const stackBarData = list.stackBarData[this.binningSelectValue]
      const woeData = list.woeData[this.binningSelectValue]
      if (stackBarData && woeData) {
        let sb = true
        let wb = true
        for (const val of stackBarData.series) {
          if (!val.data || Object.values(val.data).length === 0) {
            sb = false
            break
          }
        }
        for (const val of woeData.series) {
          if (!val.data || Object.values(val.data).length === 0) {
            wb = false
            break
          }
        }
        if (sb) {
          this.hostEchartsHiddenBeforeHaveData = true
          this.stackBarInstance && this.stackBarInstance.setOption(stackBarData, true)
        }
        if (wb) {
          this.hostEchartsHiddenBeforeHaveDatas = true
          this.woeInstance && this.woeInstance.setOption(woeData, true)
        }
      }
    }
    if (this.modelOutputType === this.modelNameMap.oneHot && this.modelOutput) {
      if (this.modelOutput.options && !this.oneHotSelectValue) {
        this.oneHotSelectValue = this.modelOutput.options[0].value
      }
    }
    // if (this.modelOutputType === this.modelNameMap.boost && this.modelOutput) {
    //   console.log(123)
    // }
  },
  methods: {
    LrSelection(item) {
      for (let i = 0; i < this.LRSelect.length; i++) {
        if (this.LRSelect[i] === item) {
          this.lrModelChoose = i
          break
        }
      }
    },
    featureSelectedClear() {
      this.featureSelected = []
    },
    hiddenFeatreSelected() {
      this.featureHidden = !this.featureHidden
    },
    initFeatureShowing() {
      if (!this.featureIniting && this.featureSelected.length === 0 && this.modelOutput && this.modelOutput.featureTable) {
        for (const val of this.modelOutput.featureTable.tBody) {
          if (val.sitename.indexOf('host') >= 0) {
            if (this.featureSelected.indexOf(val.sitename) < 0) {
              this.featureSelected.push(val.sitename)
            }
          }
        }
        this.featureIniting = true
      }
    },
    chooseOneFeature(item) {
      let has = false
      if (this.featureSelected.indexOf(item.text) >= 0) {
        has = true
        this.featureSelected.splice(this.featureSelected.indexOf(item.text), 1)
      }
      if (!has) {
        this.featureSelected.push(item.text)
      }
    },
    featureSelectedChange() {
      this.featureImportanceShowing = false
      if (this.featureHost) {
        if (this.featureSelected.length === 0) {
          for (const val of this.featureSelectedColors) {
            this.featureSelected.push(val.text)
          }
        }
      }
      this.$nextTick(() => {
        this.featureImportanceShowing = true
      })
    },
    changeBinning(value) {
      this.binningSelectValue = value
      // console.log(this.binningSelectValue)
      // console.log(this.modelOutput, this.currentbinningData)
      let list = []
      let stackBarData = ''
      let woeData = ''
      let index = 0
      list = this.modelOutput[this.binningSelectValueType === 'guest' ? 'data' : 'hostData']
      if (this.binningSelectValueType !== 'guest') {
        for (let i = 0; i < list.id.length; i++) {
          if (this.binningSelectHostContent === list.id[i]) {
            index = i
            break
          }
        }
      }
      if (this.binningSelectValueType === 'guest') {
        stackBarData = list.stackBarData[value]
        woeData = list.woeData[value]
      } else {
        stackBarData = list.data[index].stackBarData[value]
        woeData = list.data[index].woeData[value]
      }
      if (stackBarData && woeData) {
        let sb = true
        let wb = true
        for (const val of stackBarData.series) {
          if (!val.data || Object.values(val.data).length === 0) {
            sb = false
            break
          }
        }
        for (const val of woeData.series) {
          if (!val.data || Object.values(val.data).length === 0) {
            wb = false
            break
          }
        }
        if (sb) {
          this.hostEchartsHiddenBeforeHaveData = true
          this.stackBarInstance.setOption(stackBarData, true)
        }
        if (wb) {
          this.hostEchartsHiddenBeforeHaveDatas = true
          this.woeInstance.setOption(woeData, true)
        }
      }
    },
    changeOneHot(value) {
      // console.log('changeonehot', value)
    },
    getStackBarInstance(instance) {
      this.stackBarInstance = instance
    },
    getVariableImportanceInstance(instance) {
      this.variableImportanceInstance = instance
    },
    getWoeInstance(instance) {
      this.woeInstance = instance
    },
    getTreeInstance(instance) {
      this.treeInstance = instance
    },
    initData() {
      this.treeId = ''
      this.treesValue = 0
    },
    getTreesLineInstance(instance) {
      // console.log(instance.getZr())
      const _this = this
      instance.getZr().on('click', params => {
        const pointInPixel = [params.offsetX, params.offsetY]
        if (instance.containPixel('grid', pointInPixel)) {
          let newId = 0
          if (_this.modelOutput.treesOverviewData.length === 1) {
            newId = 0
          } else {
            newId = Math.round(instance.convertFromPixel({ seriesIndex: 0 }, [params.offsetX, params.offsetY])[0])
          }
          // console.log(xIndex)
          // console.log(this.modelOutput)
          // const modelOutput = this.modelOutput
          // if (modelOutput.currentTreeData.id !== newId) {
          //   const newTreeData = modelOutput.treesOverviewData[newId]
          //   modelOutput.currentTreeData.id = newId
          //   modelOutput.currentTreeData.size = newTreeData.size
          //   modelOutput.treeOptions.series.data = newTreeData.data
          //   this.treeInstance.setOption(modelOutput.treeOptions, true)
          // }
          this.clickTreesLine(newId)
        }
      })
      this.treesLineInstance = instance
    },
    chooseItems(item) {
      this.clickTreesLine(item.treeId)
    },
    treeSuitablePosition(top, left) {
      this.treeSuitables.top = top
      this.treeSuitables.left = left
      this.treeSuitables.original = true
    },
    getTreesHintInstance(instance) {
      // console.log(instance.getZr())
      const _this = this
      instance.getZr().on('click', params => {
        const pointInPixel = [params.offsetX, params.offsetY]
        if (instance.containPixel('grid', pointInPixel)) {
          let newId = 0
          if (_this.modelOutput.treesOverviewData.length === 1) {
            newId = 0
          } else {
            newId = Math.round(instance.convertFromPixel({ seriesIndex: 0 }, [params.offsetX, params.offsetY])[0])
          }
          // console.log(xIndex)
          // console.log(this.modelOutput)
          // const modelOutput = this.modelOutput
          // if (modelOutput.currentTreeData.id !== newId) {
          //   const newTreeData = modelOutput.treesOverviewData[newId]
          //   modelOutput.currentTreeData.id = newId
          //   modelOutput.currentTreeData.size = newTreeData.size
          //   modelOutput.treeOptions.series.data = newTreeData.data
          //   this.treeInstance.setOption(modelOutput.treeOptions, true)
          // }
          this.clickTreesLine(newId)
        }
      })
      this.treesLineInstance = instance
    },
    clickTreesLine(id) {
      const modelOutput = this.modelOutput
      if (modelOutput.currentTreeData.id !== id) {
        const newTreeData = modelOutput.treesOverviewData[id]
        modelOutput.currentTreeData.id = id
        modelOutput.currentTreeData.size = newTreeData.size
        modelOutput.currentTreeData.maxDepth = newTreeData.maxDepth
        modelOutput.currentTreeData.treeWidth = newTreeData.treeWidth
        modelOutput.treeOptions.series.data = newTreeData.data
        const treesLineOption = this.treesLineInstance.getOption()
        const maxTreeSize = modelOutput.maxTreeSize
        treesLineOption.series[0].markLine.data[0] = [
          {
            coord: [id, 0]
          },
          {
            coord: [id, maxTreeSize]
          }
        ]
        if (this.isTreeBtnLikeLine) {
          treesLineOption.yAxis[0].max = maxTreeSize
        }
        this.treeInstance.setOption(modelOutput.treeOptions, true)
        this.treesLineInstance.setOption(treesLineOption, true)
        if (this.treeSuitables) this.treeSuitables.original = false
        this.treeScale = { x: 0, y: 0, whole: false }
      }
    },
    handlePageChange({ page }) {
      // console.log(page)
    },
    selectionCellClassName({ row, column, rowIndex, columnIndex }) {
      // let disabledRowIndex = 0
      if (!this.modelOutput[this.selectionType + 'Header']) {
        return 0
      }
      let className = 'selection-default'
      const { property, type } = column
      if (type !== 'index') {
        if (row[property + '_disable']) {
          className += ' selection-none'
        } else {
          className += ' selection-disabled'
        }
      }
      return className
      // const header = this.modelOutput[this.selectionType + 'Header']
      // const body = this.modelOutput[this.selectionType + 'Body']

      // for (let i = 0; i < body.length; i++) {
      //   const row = body[i]
      //   if (Object.keys(row).length < header.length) {
      //     disabledRowIndex = i
      //     break
      //   }
      // }
      // let className = 'selection-default'
      // const { property, type } = column
      // if (type !== 'index') {
      //   if (rowIndex >= disabledRowIndex) {
      //     if (!row[property]) {
      //       className += ' selection-none'
      //     } else {
      //       className += ' selection-disabled'
      //     }
      //   }
      // }
      // return className
    },
    changeCvTab(index) {
      for (const val of this.evaluationInstances) {
        if (val.type === this.evaluationOutputTypeList[this.currentCvTab]) {
          this.exchangeCurveStatus('cv' + val.type + val.nameSpace)
          break
        }
      }
      this.$store.dispatch('ChangeCvTab', index)
      const arr = deepCloneArr(this.evaluationFlags)
      if (!arr[index]) {
        arr[index] = true
        this.$store.dispatch('SetCvFlags', arr)
      }
      this.choosedNameSpace = 0
    },
    changeChoosedNameSpace(newIndex, instanceref) {
      const that = this
      this.choosedNameSpace = newIndex
      this.$nextTick(() => {
        that.$refs[instanceref + that.allNameSpace[that.choosedNameSpace]][0].resize()
      })
    },
    enterTreeId() {
      const treeId = Number.parseInt(this.treeId)
      if (isNaN(treeId)) {
        this.$message({
          type: 'warning',
          message: 'please enter a number'
        })
        return
      }
      if (treeId >= 0 && treeId <= this.modelOutput.treesOverviewData.length - 1) {
        this.clickTreesLine(treeId)
        this.$refs['boostTreeHint'].changeChoosed(treeId)
      } else {
        this.$message({
          type: 'warning',
          message: 'this id is not exist'
        })
      }
      // if(this.modelOutput.treesOverviewData)
    },
    changeBoostTrees(value, label) {
      let maxTreeSize = 0
      this.modelOutput.allTreesLineSeriesData[value].forEach(item => {
        if (item[1] > maxTreeSize) {
          maxTreeSize = item[1]
        }
      })
      this.modelOutput.maxTreeSize = maxTreeSize
      // console.log(this.modelOutput)
      const treeOptions = this.modelOutput.treeOptions
      const newColor = this.treesColor[value % this.treesColor.length]
      if (this.modelOutput.allTreesOverviewData) {
        treeOptions.series.data = this.modelOutput.allTreesOverviewData[value][0].data
        this.modelOutput.treesOverviewData = this.modelOutput.allTreesOverviewData[value]
      }
      treeOptions.series.label.backgroundColor = `rgb(${newColor})`
      treeOptions.series.leaves.label.backgroundColor = `rgba(${newColor},0.6)`
      this.swithTreeBtn(`rgb(${newColor})`, false)
      this.treeInstance.setOption(treeOptions, true)
      if (this.treesLineInstance) {
        const option = this.treesLineInstance.getOption()
        if (this.modelOutput.allTreesLineSeriesData) {
          // console.log(this.modelOutput.allTreesLineSeriesData)
          option.series[0].data = this.modelOutput.allTreesLineSeriesData[value]
        }
        if (!this.isTreeBtnLikeLine) {
          option.backgroundColor = '#f8f8fa'
          option.color = '#FF8800'
          option.tooltip[0].backgroundColor = `rgb(${newColor})`
          option.tooltip[0].textStyle.color = '#fff'
          option.tooltip[0].axisPointer.lineStyle.color = `rgb(${newColor})`
        } else {
          option.backgroundColor = 'transparent'
          option.color = 'transparent'
          option.tooltip[0].backgroundColor = '#fff'
          option.tooltip[0].textStyle.color = `rgb(${newColor})`
          option.tooltip[0].axisPointer.lineStyle.color = '#FF9A4D'
        }
        option.series[0].markLine.data[0] = [
          {
            coord: [0, 0]
          },
          {
            coord: [0, maxTreeSize]
          }
        ]
        this.modelOutput.currentTreeData.id = 0
        this.modelOutput.currentTreeData.size = this.modelOutput.allTreesOverviewData[value][0].size
        this.modelOutput.currentTreeData.maxDepth = this.modelOutput.allTreesOverviewData[value][0].maxDepth
        this.modelOutput.currentTreeData.treeWidth = this.modelOutput.allTreesOverviewData[value][0].treeWidth
        this.treesLineInstance.setOption(option, true)
      }
    },
    swithTreeBtn(color = '#494ece', isClick = true) {
      // console.log(color)
      if (this.treesLineInstance) {
        const option = this.treesLineInstance.getOption()
        if (!this.isTreeBtnLikeLine) {
          option.backgroundColor = 'transparent'
          option.color = 'transparent'
          option.tooltip[0].backgroundColor = '#fff'
          option.tooltip[0].textStyle.color = color
          option.tooltip[0].axisPointer.lineStyle.color = '#FF9A4D'
          option.yAxis[0].max = this.modelOutput.maxTreeSize
          if (this.modelOutput.treesOverviewData.length === 1) {
            let st = this.treesLineInstance.getDom().children[0].getAttribute('style')
            st = st.replace('border-bottom:2px solid #ff8800;', '')
            this.treesLineInstance.getDom().children[0].setAttribute('style', st)
          }
        } else {
          option.backgroundColor = '#f8f8fa'
          option.color = '#FF8800'
          option.tooltip[0].backgroundColor = color
          option.tooltip[0].textStyle.color = '#fff'
          option.tooltip[0].axisPointer.lineStyle.color = color
          option.yAxis[0].max = null
          if (this.modelOutput.treesOverviewData.length === 1) {
            let st = this.treesLineInstance.getDom().children[0].getAttribute('style')
            st += 'border-bottom:2px solid #ff8800;'
            this.treesLineInstance.getDom().children[0].setAttribute('style', st)
          }
        }
        this.treesLineInstance.setOption(option, true)
      }
      if (isClick) {
        this.isTreeBtnLikeLine = !this.isTreeBtnLikeLine
      }
    },
    EchartInstancesResize() {
      // console.log('resize')
      this.echartInstanceList.forEach(item => {
        item.instance.resize()
      })
      this.lossInstanceList.forEach(item => {
        item.instance.resize()
      })
      this.woeInstance && this.woeInstance.resize()
      this.stackBarInstance && this.stackBarInstance.resize()
      this.treeInstance && this.treeInstance.resize()
      this.treesLineInstance && this.treesLineInstance.resize()
      this.variableImportanceInstance && this.variableImportanceInstance.resize()
    },
    summarySpanMethod({ row, column, rowIndex, columnIndex }) {
      // console.log(column, rowIndex, columnIndex)
      // if (rowIndex === 0 && columnIndex === 0) {
      //   console.log(this.modelSummaryData)
      // }
      // if (columnIndex === 0) {
      //   if (rowIndex % 2 === 0) {
      //     return {
      //       rowspan: 2,
      //       colspan: 1
      //     }
      //   } else {
      //     return {
      //       rowspan: 0,
      //       colspan: 0
      //     }
      //   }
      // }
      // return {
      //   rowspan: 1,
      //   colspan: 1
      // }
    },
    clearEchartInstance() {
      this.echartInstanceList = []
      this.lossInstanceList = []
    },
    clickLegendForCurves({ exchange, evaluationListIndex, instanceList }) {
      let echartInstanceListIndex = -1
      for (let i = 0; i < instanceList.length; i++) {
        const instance = instanceList[i]
        if (instance.legendIndex === evaluationListIndex) {
          echartInstanceListIndex = i
          break
        }
      }
      // console.log(echartInstanceListIndex, curveName)
      if (echartInstanceListIndex === -1) {
        return
      }
      const instance = instanceList[echartInstanceListIndex].instance
      const options = instance.getOption()
      const series = options.series
      for (const val of exchange) {
        let { curveName, popOut } = val
        const { useColor } = val
        curveName = curveName.replace(/(_tpr|_fpr|_precision|_recall)/g, '')
        if (typeof popOut === 'string') {
          popOut = popOut.replace(/(_tpr|_fpr|_precision|_recall)/g, '')
        }
        const maxLength = useColor ? useColor.length : 1
        let index = 1
        // console.log(series)
        for (let i = 0; i < series.length; i++) {
          const item = series[i]
          const name = item.name.replace(/(_tpr|_fpr|_precision|_recall)/g, '')
          if (name === curveName || (!name && curveName === item.pairType)) {
            // if (item.itemStyle) {
            //   item.itemStyle.opacity = item.itemStyle.opacity === 1 ? 0 : 1
            // }
            // if (item.lineStyle) {
            //   item.lineStyle.opacity = item.lineStyle.opacity === 1 ? 0 : 1
            // }
            // if (item.areaStyle) {
            //   item.areaStyle.opacity = item.areaStyle.opacity === 0.1 ? 0 : 0.1
            // }
            if (item.itemStyle) {
              item.itemStyle.opacity = popOut.length ? 1 : (!popOut ? 1 : 0)
              item.itemStyle.color = popOut.length ? useColor[index - 1] : (!popOut ? useColor[index - 1] : this.hideColor)
            }
            if (item.lineStyle) {
              item.lineStyle.opacity = popOut.length ? 1 : (!popOut ? 1 : 0)
            }
            if (item.areaStyle) {
              item.areaStyle.opacity = popOut.length ? 0.1 : (!popOut ? 0.1 : 0)
            }
            if (index < maxLength) {
              index++
            }
          }
          if (typeof popOut === 'string') {
            if (name === popOut || (!name && popOut === item.pairType)) {
              if (item.itemStyle) {
                item.itemStyle.opacity = 0
                item.itemStyle.color = this.hideColor
              }
              if (item.lineStyle) {
                item.lineStyle.opacity = 0
              }
              if (item.areaStyle) {
                item.areaStyle.opacity = 0
              }
            }
          }
        }
      }
      instance.setOption(options)
    },
    clickLegend({ curveName, evaluationListIndex, instanceList }) {
      curveName = curveName.replace(/(_tpr|_fpr|_precision|_recall)/g, '')
      let echartInstanceListIndex = -1
      for (let i = 0; i < instanceList.length; i++) {
        const instance = instanceList[i]
        if (instance.legendIndex === evaluationListIndex) {
          echartInstanceListIndex = i
          break
        }
      }
      // console.log(echartInstanceListIndex, curveName)
      if (echartInstanceListIndex === -1) {
        return
      }
      const instance = instanceList[echartInstanceListIndex].instance
      const options = instance.getOption()
      const series = options.series
      // console.log(series)
      for (let i = 0; i < series.length; i++) {
        const item = series[i]
        const name = item.name.replace(/(_tpr|_fpr|_precision|_recall)/g, '')
        if (name === curveName || (!name && curveName === item.pairType)) {
          if (item.itemStyle) {
            item.itemStyle.customer = item.itemStyle.opacity === 1 ? item.itemStyle.color : item.itemStyle.customer
            item.itemStyle.color = item.itemStyle.opacity === 1 ? this.hideColor : item.itemStyle.customer
            item.itemStyle.opacity = item.itemStyle.opacity === 1 ? 0 : 1
          }
          if (item.lineStyle) {
            item.lineStyle.opacity = item.lineStyle.opacity === 1 ? 0 : 1
          }
          if (item.areaStyle) {
            item.areaStyle.opacity = item.areaStyle.opacity === 0.1 ? 0 : 0.1
          }
        }
      }
      instance.setOption(options)
    },
    getEchartInstance(instance, legendIndex) {
      this.echartInstanceList.push({ instance, legendIndex })
    },
    getLossInstance(instance, legendIndex) {
      this.lossInstanceList.push({ instance, legendIndex })
    },
    testExport() {
      const modelOutput = this.modelOutput
      const selectionType = this.selectionType
      const header = modelOutput[selectionType + 'Header']
      const data = modelOutput[selectionType + 'Body']
      exportExcel({ header, data })
    },
    sortOfByName(final, name) {
      final.sort((a, b) => {
        let aMatch = ''
        let bMatch = ''
        if (Array.isArray(a[0])) {
          aMatch = a[0][name].match(/[0-9]+/g)
          bMatch = b[0][name].match(/[0-9]+/g)
        } else if (a instanceof Object) {
          aMatch = a[name].match(/[0-9]+/g)
          bMatch = b[name].match(/[0-9]+/g)
        } else {
          return 0
        }
        if (aMatch && bMatch) {
          for (let i = 0; i < Math.max(aMatch.length, bMatch.length); i++) {
            if (aMatch[i] && bMatch[i]) {
              if (parseInt(aMatch[i]) > parseInt(bMatch[i])) {
                return 1
              } else if (parseInt(aMatch[i]) < parseInt(bMatch[i])) {
                return -1
              }
            } else {
              if (!aMatch[i]) {
                return 1
              }
              if (!bMatch[i]) {
                return -1
              }
            }
          }
        } else {
          return 0
        }
      })
      return final
    },
    filterHeader() {
      if (this.role === 'host') {
        let had = false
        for (let i = 0; i < this.binningSummaryHeader.length; i++) {
          if (this.binningSummaryHeader[i].prop === 'anonymInGuest') {
            had = true
            break
          }
        }
        if (!had) {
          this.binningSummaryHeader.splice(1, 0, {
            prop: 'anonymInGuest',
            label: 'anonym in guest'
          })
        }
      }
      for (const val of this.binningSummaryHeader) {
        if (val.prop.toString().toLowerCase().indexOf('binding') < 0) {
          // && val.prop.toString().toLowerCase().indexOf('monotonicity') < 0) {
          val.sortable = true
        }
      }
      return this.binningSummaryHeader
    },
    filterSelectionHeader() {
      if (this.role === 'host') {
        let had = false
        for (let i = 0; i < this.modelOutput.guestHeader.length; i++) {
          if (this.modelOutput.guestHeader[i].prop === 'binding') {
            had = true
            break
          }
        }
        if (!had) {
          this.modelOutput.guestHeader.splice(1, 0, {
            prop: 'binding',
            label: 'anonym in guest'
          })
        }
      }
    },
    outputTypeHeaderFilter(output) {
      const header = JSON.parse(JSON.stringify(output.data.tHeader))
      if (this.modelOutputType === this.modelNameMap.sample) {
        for (const val of header) {
          val.sortable = true
        }
      }
      return header
    },
    initEchartOptions(options, haveCurve) {
      const series = options.series
      for (const item of series) {
        if (item.type === 'line' && haveCurve) {
          if (item.itemStyle) {
            item.itemStyle.opacity = 0
            item.itemStyle.color = this.hideColor
          }
          if (item.lineStyle) {
            item.lineStyle.opacity = 0
          }
          if (item.areaStyle) {
            item.areaStyle.opacity = 0
          }
        }
      }
      return options
    },
    exchangeCurveStatus(name) {
      for (const val of this.$refs[name]) {
        val.closeDetails()
      }
    },
    refreshNew() {
      // TODO: scroll到达相关位置
      this.$emit('refresh')
    },
    sampleLabels(output) {
      const middle = []
      for (const val of output) {
        if (middle.indexOf(val.label) < 0) {
          middle.push(val.label)
        }
      }
      const final = []
      for (const val of middle) {
        final.push({ label: val, value: val })
      }
      return final
    },
    boostProgressFormat(percentage) {
      return formatFloat(percentage / 100)
    },
    hostSelectionRadio() {
      if (this.selectionType === 'host') {
        if (!this.selectionSelection) {
          this.selectionSelection = this.selectionHostType[0] ? this.selectionHostType[0].value : ''
        }
      }
    },
    featureImportanceProgress(progress) {
      let big = 0
      for (const val of this.featureTableBody) {
        if (val.importance > big) {
          big = val.importance
        }
      }
      return (progress.row.importance / big) * 100
    },
    featureImportanceClass(obj) {
      let final = ''
      if (obj.columnIndex === 0) {
        final += 'featureImportFirstCol'
      } else if (obj.columnIndex === 1) {
        final += 'featureImportSecongCol'
      } else {
        final += 'featureImportOtherCol'
      }
      if (this.featureImportCurrentRow) {
        let check = true
        for (const key in obj.row) {
          if (obj.row[key] !== this.featureImportCurrentRow[key]) {
            check = false
            break
          }
        }
        if (check) {
          final += ' featureImportCurrentRowStyle'
        }
      }
      return final
    },
    featureImportanceHeaderClass(obj) {
      if (obj.columnIndex === 0) {
        return 'featureImportHeaderFirstCol'
      } else if (obj.columnIndex === 1) {
        return 'featureImportHeaderSecongCol'
      } else {
        return 'featureImportHeaderOtherCol'
      }
    },
    featureImportanceCurrentChange(row, oldRow) {
      this.featureImportCurrentRow = row
    },
    initbinningSelection(list) {
      this.binningSelectionInit = true
      this.binningSelection = []
      for (const val of list) {
        this.binningSelection.push(val)
      }
    },
    initBinningSecondSelection() {
      if (this.binningHostSelections.length > 0) {
        this.binningSelectHostContent = this.binningHostSelections[0]
      }
    },
    changeToHost() {
      const vm = this
      if (!this.binningSelectHostContent) {
        this.initBinningSecondSelection()
      }
      let list = []
      let index = 0
      list = this.modelOutput[this.binningSelectValueType === 'guest' ? 'data' : 'hostData']
      if (this.binningSelectValueType !== 'guest') {
        for (let i = 0; i < list.id.length; i++) {
          if (this.binningSelectHostContent === list.id[i]) {
            index = i
            break
          }
        }
        list = list.data[index]
      }
      if (list && list.options) {
        const final = JSON.parse(JSON.stringify(list.options))
        final.sort((a, b) => {
          const compare = vm.bigger(a.label, b.label)
          if (compare === 0) return 0
          else if (compare) return 1
          else return -1
        })
        this.binningSelectValue = final[0].value
      }
    },
    emitCurvelegengEmit(refname) {
      this.$refs[refname][0].defatultEchartsChoose()
    },
    resizeDialogContent() {
      const c = this.$refs['correlationCanvas']
      if (Array.isArray(c)) {
        for (const val of c) {
          val.canvasResize()
        }
      } else {
        if (c) {
          c.canvasResize()
        }
      }
    },
    treeSuitable() {
      const pos = {}
      const scal = {}
      const sty = getComputedStyle(this.$refs['forTreePic'])
      const parentSty = getComputedStyle(this.$refs['forTreePic'].parentElement)
      const xScale = parseInt(parentSty.width) / parseInt(sty.width)
      const yScale = parseInt(parentSty.height) / parseInt(sty.height)
      if (xScale < yScale) {
        scal.x = xScale
        scal.y = xScale
        scal.whole = true
        pos.left = parseFloat(sty.width) * (xScale - 1) / 2
        pos.top = parseFloat(sty.height) * (xScale - 1) / 2
      } else {
        pos.top = 0
        scal.x = yScale
        scal.y = yScale
        scal.whole = true
        pos.left = parseFloat(sty.width) * (yScale - 1) / 2
        pos.top = parseInt(sty.height) * (yScale - 1) / 2
      }
      pos.original = true
      this.treeSuitables = pos
      this.treeScale = scal
    },
    treePlus() {
      this.treeScale = {
        x: 0.2,
        y: 0.2,
        whole: false
      }
      this.treeSuitables.original = false
    },
    treeMinus() {
      this.treeScale = {
        x: -0.2,
        y: -0.2,
        whole: false
      }
      this.treeSuitables.original = false
    },
    bigger(a, b) {
      if (a.toString() === b.toString()) {
        return 0
      }
      if (typeof a === 'number') {
        return a > b
      } else {
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
        return compare(a, b)
      }
    }
  }
}
</script>

<style lang="scss">
  @import "../../styles/modelOutput";

  .line-height-between {
    margin-bottom: 20px
  }

  .refresh-pointer{
    padding-right: 10px;
    color: #4159D1;
    cursor: pointer;
    .refresh-content{
      padding-right: 5px;
      margin-left: 15px;
    }
  }
  .loss-refresh {
    margin-bottom: 0px;
  }
  .feature-title {
    margin-bottom: 15px;
    height: 20px;
  }
  .feature-check {
    height: 30px;
    padding-right: 10px;
    .feature-detail-choose-dialog{
      z-index: 100000;
      position: absolute;
      top: 14px;
      right: 22px;
      padding: 24px 24px 14px 24px;
      box-shadow: 1px 3px 10px -1px #aaa;
      border-radius: 4px;
      background-color: #fff;
      min-width: 35%;
      max-width: 35%;
    }
    .feature-detail-title {
      width: 100%;
      margin-bottom: 10px;
      .feature-detail-title-hint {
        .feature-title-hint-content {
          font-size: 16px;
          font-weight: 700;
          margin-right:30px;
          .content-font {
            color: #494ece;
          }
          .feature-content-font {
            color: #4159D1
          }
        }
        .feature-title-operation {
          cursor: pointer;
          color: #808080;
          text-decoration: underline;
        }
      }
    }
    .feature-detail-content {
      width: 100%;
      .feature-detail-item {
        padding: 5px 5px 10px 5px;
        .feature-detail-content {
          border-radius: 2px;
          background-color: #F8F8FA;
          padding: 2px 8px;
          margin: 1px 5px 1px 0px;
          cursor: pointer;
        }
				.feature-hint-color-detail {
					width: 10px;
					height: 10px;
					border-radius: 5px;
					margin-right: 5px;
        }
      }
    }
  }
  .feature-select {
    cursor: pointer;
		color: #808080;
		text-decoration: underline;
  }
  .feature-table {
    height: calc(100% - 65px);
    .el-table {
      .fearture-span {
        display: block;
        width: 100px;
        padding-right: 30px;
      }
      .feature-progress {
        width: 80%;
        .el-progress-bar {
          width: 90%
        }
        .el-progress__text {
          margin-left: 50px;
        }
      }
      td {
        border: 0px;
        padding: 5px 0px;
        .cell{
          padding: 0px 5px;
        }
      }
      th {
        .cell {
          font-size: 120%;
          color: #494ece;
          padding: 10px 5px;
        }
      }
    }
    .featureImportFirstCol {
      padding: 0px !important;
      border-top: 6px solid #fff !important;
      .cell {
        background-color: #EBEDF0;
        height: 24px;
        padding: 0px 12px !important;
      }
    }
    .featureImportSecongCol {
      padding: 0px !important;
      border-top: 6px solid #fff !important;
      border-right: 6px solid #fff !important;
      .cell {
        background-color: #FAFBFC;
        height: 24px;
        padding: 0px 12px !important;
      }
    }
    .featureImportOtherCol {
      padding: 0px !important;
      border-top: 6px solid #fff !important;
      .cell {
        background-color: #ffffff;
        height: 24px;
        padding: 0px 12px !important;
      }
    }
    .featureImportHeaderFirstCol {
      background-color: #4159D1;
      padding: 0px 1px;
      .cell {
        color: #fff !important;
        height: 24px;
        font-size: 14px !important;
        line-height: 24px;
        padding: 0px 12px !important;
      }
    }
    .featureImportHeaderSecongCol {
      background-color: #5E7FEB;
      max-height: 24px;
      padding: 0px 1px;
      border-right: 6px solid #fff;
      .cell {
        color: #fff !important;
        height: 24px;
        font-size: 14px !important;
        line-height: 24px;
        padding: 0px 12px !important;
      }
    }
    .featureImportHeaderOtherCol {
      background-color: #DEECFC;
      max-height: 24px;
      padding: 0px 1px;
      .cell {
        height: 24px;
        font-size: 14px !important;
        line-height: 24px;
        padding: 0px 12px !important;
      }
    }
    .featureImportCurrentRowStyle {
      border-right-color: #ededfa !important;
      .cell {
        background-color: #ededfa !important;
      }
    }
  }
  .suitable-button {
    position: absolute;
    bottom: 0px;
    left: 0px;
    .sutiable-button-item {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #F8F8FA;
      margin-bottom: 12px;
      color: #BBBBC8;
      &:hover {
        background-color: #494ece;
        color: #fff;
      }
    }
  }
  .border-spliter {
    width: 100%;
    height: 2px;
    margin: 24px 0px;
    border: 0px;
    background-color: #DCDDE0;
  }
</style>
