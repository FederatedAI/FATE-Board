
/**
 *
 *  Copyright 2019 The FATE Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import Cookies from 'js-cookie'

const app = {
  state: {
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      withoutAnimation: false
    },
    device: 'desktop',
    isOpenReqSimulate: Cookies.get('isOpenReqSimulate') !== 'false',
    modelNameMap: {
      homoLR: 'HomoLR',
      heteroLR: 'HeteroLR',
      heteroLinR: 'HeteroLinR',
      sklearnLR: 'LocalBaseline',
      dataIO: 'DataIO',
      evaluation: 'Evaluation',
      boost: 'HeteroSecureBoost',
      binning: 'HeteroFeatureBinning',
      homoBinning: 'HomoFeatureBinning',
      selection: 'HeteroFeatureSelection',
      scale: 'FeatureScale',
      sample: 'FederatedSample',
      oneHot: 'OneHotEncoder',
      poisson: 'HeteroPoisson',
      homoNN: 'HomoNN',
      heteroNN: 'HeteroNN',
      correlation: 'HeteroPearson',
      homoBoost: 'HomoSecureboost',
      heterofm: 'HeteroFM',
      homofm: 'HomoFM',
      heteroMF: 'HeteroMF',
      heteroSVD: 'HeteroSVD',
      heteroSVDPP: 'HeteroSVDPP',
      heteroGMF: 'HeteroGMF',
      psi: 'PSI',
      statistic: 'DataStatistics',
      reader: 'Reader',
      scorecard: 'Scorecard',
      transformer: 'Transformer',
      modelLoader: 'ModelLoader',
      featureImputation: 'FeatureImputation',
      LabelTransform: 'LabelTransform',
      heteroSSHELR: 'HeteroSSHELR',
      CacheLoader: 'CacheLoader',
      SSHELinR: 'SSHELinR',
      SSHEPoissonR: 'SSHEPoissonR',
      Writer: 'Writer'
    },
    metricTypeMap: {
      dataIOTable: 'DATAIO_TABLE',
      scale: 'SCALE',
      loss: 'LOSS',
      dataIOText: 'DATAIO_TEXT',
      sampleText: 'SAMPLE_TEXT',
      sampleTable: 'SAMPLE_TABLE',
      intersection: 'INTERSECTION',
      'K-S': 'KS_EVALUATION',
      ROC: 'ROC_EVALUATION',
      Lift: 'LIFT_EVALUATION',
      Gain: 'GAIN_EVALUATION',
      Accuracy: 'ACCURACY_EVALUATION',
      RecallBinary: 'RECALL_BINARY_EVALUATION',
      PrecisionBinary: 'PRECISION_BINARY_EVALUATION',
      RecallMulti: 'RECALL_MULTI_EVALUATION',
      PrecisionMulti: 'PRECISION_MULTI_EVALUATION',
      Summary: 'EVALUATION_SUMMARY',
      Union: 'UNION',
      Upload: 'UPLOAD',
      Download: 'DOWNLOAD',
      RSA: 'RSA',
      Stepwise: 'STEPWISE',
      F1Score: 'F1_SCORE',
      ConfusionMat: 'CONFUSION_MAT',
      quantilePr: 'QUANTILE_PR',
      PSI: 'PSI',
      ModelLoader: 'MODEL_LOADER',
      FeatureImputation: 'FEATURE_IMPUTATION',
      LabelTransform: 'LABEL_TRANSFORM',
      CacheLoader: 'CACHE_LOADER'
    },
    icons: {
      normal: {
        fullscreen: require('../../icons/full_screen_on_default.png'),
        offscreen: require('../../icons/full_screen_off_default.png'),
        close: require('@/icons/jobdetail_outputsfromjob_visualization_close_default.png'),
        left: require('@/icons/jobdetail_outputsfromjob_visualization_pagebackward_default.png'),
        right: require('@/icons/jobdetail_outputsfromjob_visualization_pageforward_default.png'),
        success: require('@/icons/dashboard_job_complete.png'),
        failed: require('@/icons/dashboard_job_failed.png'),
        'tree-line': require('@/icons/tree_line_default.png'),
        'tree-spectrum': require('@/icons/tree_spectrum_default.png'),
        query: require('@/icons/dashboard_log_search_default.png'),
        edit: require('@/icons/svg/edit_default.svg'),
        dashBoardFold: require('@/icons/svg/fold_dashboard_default.svg'),
        fold: require('@/icons/svg/fold_default.svg'),
        dashBoardUnfold: require('@/icons/svg/unfold_dashboard_default.svg'),
        unfold: require('@/icons/svg/unfold_default.svg')
      },
      active: {
        fullscreen: require('@/icons/full_screen_on_click.png'),
        offscreen: require('@/icons/full_screen_off_click.png'),
        close: require('@/icons/jobdetail_outputsfromjob_visualization_close_click.png'),
        left: require('@/icons/jobdetail_outputsfromjob_visualization_pagebackward_click.png'),
        right: require('@/icons/jobdetail_outputsfromjob_visualization_pageforward_click.png'),
        query: require('@/icons/dashboard_log_search_click.png'),
        edit: require('@/icons/svg/edit_click.svg'),
        dashBoardFold: require('@/icons/svg/fold_dashboard_click.svg'),
        fold: require('@/icons/svg/fold_hover&click.svg'),
        dashBoardUnfold: require('@/icons/svg/unfold_dashboard_click.svg'),
        unfold: require('@/icons/svg/unfold_hover&click.svg')
      },
      hover: {
        fullscreen: require('@/icons/full_screen_on_hover.png'),
        offscreen: require('@/icons/full_screen_off_hover.png'),
        close: require('@/icons/jobdetail_outputsfromjob_visualization_close_hover.png'),
        left: require('@/icons/jobdetail_outputsfromjob_visualization_pagebackward_hover.png'),
        right: require('@/icons/jobdetail_outputsfromjob_visualization_pageforward_hover.png'),
        'tree-line': require('@/icons/tree_line_hover&click.png'),
        'tree-spectrum': require('@/icons/tree_spectrum_hover&click.png'),
        query: require('@/icons/dashboard_log_search_hover.png'),
        edit: require('@/icons/svg/edit_hover.svg'),
        dashBoardFold: require('@/icons/svg/fold_dashboard_hover.svg'),
        fold: require('@/icons/svg/fold_hover&click.svg'),
        dashBoardUnfold: require('@/icons/svg/unfold_dashboard_hover.svg'),
        unfold: require('@/icons/svg/unfold_hover&click.svg')
      }
    },
    currentCvTab: 0,
    evaluationFlags: [],
    evaluationInstances: [],
    treesColor: ['73,78,206', '7,135,210', '1,161,194', '107,142,0', '2,135,69', '236,118,0', '225,51,51', '130,53,180', '212,0,120', '82,85,112'],
    treesBorderColor: ['#3135A6', '#056299', '#01839E', '#586E16', '#16663F', '#C26100', '#9E1616', '#663387', '#910052', '#343647'],
    lastJob: null
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = false
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    CHANGE_LAST_JOB: (state, job) => {
      state.lastJob = job
    },
    SWITCH_REQ_SIMULATE: (state, flag) => {
      state.isOpenReqSimulate = flag
      Cookies.set('isOpenReqSimulate', flag)
    },
    INIT_MODEL_OUTPUT: (state) => {
      state.currentCvTab = 0
      state.evaluationFlags = []
    },
    CHANGE_CV_TAB: (state, index) => {
      state.currentCvTab = index
    },
    SET_CV_FLAGS: (state, arr) => {
      state.evaluationFlags = arr
    },
    SET_CURVE_INSTANCES: (state, arr) => {
      state.evaluationInstances = arr
    }

  },
  actions: {
    ChangeCvTab({ commit }, index) {
      commit('CHANGE_CV_TAB', index)
    },
    SetCvFlags({ commit }, arr) {
      commit('SET_CV_FLAGS', arr)
    },
    SetCurveInstances({ commit }, arr) {
      commit('SET_CURVE_INSTANCES', arr)
    },
    InitModelOutput({ commit }) {
      commit('INIT_MODEL_OUTPUT')
    },
    CloseSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    ToggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    SwitchReqSimulate({ commit }, flag) {
      commit('SWITCH_REQ_SIMULATE', flag)
    },
    changeLastJob({ commit }, job) {
      commit('CHANGE_LAST_JOB', job)
    }
  }
}

export default app
