
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

export const MODEL_TYPES = {
  HomoLR: 'HomoLR',
  HeteroLR: 'HeteroLR',
  HeteroLinR: 'HeteroLinR',
  LocalBaseline: 'LocalBaseline',
  DataIO: 'DataIO',
  Evaluation: 'Evaluation',
  HeteroSecureBoost: 'HeteroSecureBoost',
  HeteroFeatureBinning: 'HeteroFeatureBinning',
  HeteroFeatureSelection: 'HeteroFeatureSelection',
  FeatureScale: 'FeatureScale',
  FederatedSample: 'FederatedSample',
  OneHotEncoder: 'OneHotEncoder',
  HeteroPoisson: 'HeteroPoisson',
  HomoNN: 'HomoNN',
  HeteroNN: 'HeteroNN',
  HeteroPearson: 'HeteroPearson',
  HomoSecureboost: 'HomoSecureboost',
  HeteroFM: 'HeteroFM',
  HomoFM: 'HomoFM',
  HeteroMF: 'HeteroMF',
  HeteroSVD: 'HeteroSVD',
  HeteroSVDPP: 'HeteroSVDPP',
  HeteroGMF: 'HeteroGMF',
  SBTFeatureTransformer: 'SBTFeatureTransformer'
}

export const METRIC_TYPES = {
  DATAIO_TABLE: 'DATAIO_TABLE',
  SCALE: 'SCALE',
  LOSS: 'LOSS',
  DATAIO_TEXT: 'DATAIO_TEXT',
  SAMPLE_TEXT: 'SAMPLE_TEXT',
  SAMPLE_TABLE: 'SAMPLE_TABLE',
  INTERSECTION: 'INTERSECTION',
  KS_EVALUATION: 'KS_EVALUATION',
  ROC_EVALUATION: 'ROC_EVALUATION',
  LIFT_EVALUATION: 'LIFT_EVALUATION',
  GAIN_EVALUATION: 'GAIN_EVALUATION',
  ACCURACY_EVALUATION: 'ACCURACY_EVALUATION',
  RECALL_BINARY_EVALUATION: 'RECALL_BINARY_EVALUATION',
  PRECISION_BINARY_EVALUATION: 'PRECISION_BINARY_EVALUATION',
  RECALL_MULTI_EVALUATION: 'RECALL_MULTI_EVALUATION',
  PRECISION_MULTI_EVALUATION: 'PRECISION_MULTI_EVALUATION',
  EVALUATION_SUMMARY: 'EVALUATION_SUMMARY',
  UNION: 'UNION',
  UPLOAD: 'UPLOAD',
  DOWNLOAD: 'DOWNLOAD',
  RSA: 'RSA',
  STEPWISE: 'STEPWISE',
  F1_SCORE: 'F1_SCORE',
  CONFUSION_MAT: 'CONFUSION_MAT',
  QUANTILE_PR: 'QUANTILE_PR',
  PSI: 'PSI',
  CLUSTERING_EVALUATION_SUMMARY: 'CLUSTERING_EVALUATION_SUMMARY',
  DISTANCE_MEASURE: 'DISTANCE_MEASURE',
  DBI: 'DBI',
  CONTINGENCY_MATRIX: 'CONTINGENCY_MATRIX',
  SAMPLE_WEIGHT: 'SAMPLE_WEIGHT',
  PERFORMANCE_SUM: 'PERFORMANCE_SUM',
  SBT_FEATURE_TRANSFORMER: 'SBT_FEATURE_TRANSFORMER',
  OVR: 'ovr'
}
