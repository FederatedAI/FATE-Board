import { FCharts } from '@/components/LineChart';
import { FRangeTable } from '@/components/RangeTable';
import { isNumber } from 'lodash-es';
import fixed from '../tools/fixed';
import toGroup from '../tools/toGroup';
import evaluationAccuracy from './evaluationAccuracy';
import evaluationBinPrecisionRecall from './evaluationBinPrecisionRecall';
import evaluationGain from './evaluationGain';
import evaluationKS from './evaluationKS';
import evaluationLift from './evaluationLift';
import evaluationMultPrecisionRecall from './evaluationMultPrecisionRecall';
import evaluationRoc from './evaluationRoc';

export default function evaluation(
  metric_data: any,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const { data, groups } = metric_data;

  let isRangeScoreTable = true
  const scoreTable = {
    header: [
      {
        label: '',
        prop: 'component',
      },
      {
        label: 'dataset',
        prop: 'dataset'
      }
    ],
    data: <any>[],
  };

  let isRangeConfusionTable = false
  const confusionMatrixTable = {
    header: [
      {
        label: '',
        prop: 'component',
      },
      {
        label: 'dataset',
        prop: 'dataset'
      }
    ],
    data: <any>[],
  };

  const chartInfo: any = {};
  const ks = evaluationKS(role, partyId, component, comp_type, id);
  const gain = evaluationGain(role, partyId, component, comp_type, id);
  const lift = evaluationLift(role, partyId, component, comp_type, id);
  const accuracy = evaluationAccuracy(role, partyId, component, comp_type, id);
  const roc = evaluationRoc(role, partyId, component, comp_type, id);
  const binPR = evaluationBinPrecisionRecall(
    role,
    partyId,
    component,
    comp_type,
    id
  );
  const multPr = evaluationMultPrecisionRecall(
    role,
    partyId,
    component,
    comp_type,
    id
  );

  for (const fromComponent in data) {
    let componentspace = data[fromComponent];

    for (const namespace in componentspace) {
      const componentInfo = componentspace[namespace];

      const scoreRow: any = {
        component: fromComponent,
        dataset: namespace
      };
      const confusionRow: any = [
        {
          component: fromComponent,
          dataset: namespace
        },
        {
          component: fromComponent,
          dataset: namespace
        },
      ];

      const precisionRecall = <any>{};
      for (const each of componentInfo.flat(Infinity)) {
        const { metric, val } = each;

        // auc
        if (metric.match(/auc/i)) {
          if (!scoreTable.header.some((item) => item.prop === 'auc')) {
            scoreTable.header.push({
              label: 'auc',
              prop: 'auc',
            });
          }
          scoreRow['auc'] = fixed(val);
        }

        // ks
        else if (metric.match(/ks/i) && !metric.match(/table/i)) {
          if (!scoreTable.header.some((item) => item.prop === 'ks')) {
            scoreTable.header.push({
              label: 'ks',
              prop: 'ks',
            });
          }
          scoreRow['ks'] = fixed(val);
        }

        // k-s chart, roc
        else if (metric.match(/ks/i) && metric.match(/table/i)) {
          ks.lineExplain(val, namespace, fromComponent);
          roc.lineExplain(val, namespace, fromComponent);
        }

        // confusion_matrix
        else if (metric.match(/confusion_matrix/i)) {
          isRangeConfusionTable = true
          const { cuts, fn, fp, tn, tp } = val;
          if (
            !confusionMatrixTable.header.some((item) => item.prop === 'label')
          ) {
            confusionMatrixTable.header.push(
              ...[
                {
                  label: 'true label  predict label',
                  prop: 'label',
                },
                {
                  label: '0',
                  prop: 'n',
                },
                {
                  label: '1',
                  prop: 'p',
                },
              ]
            );
          }
          const rate = (cursor: number, origin: any) => {
            return (
              fixed(
                (origin[cursor] /
                  (tn[cursor] + fn[cursor] + fp[cursor] + tp[cursor])) *
                  100
              ) + '%'
            );
          };

          confusionRow[0]['label'] = '0';
          confusionRow[0]['n'] = (val: any) => {
            let cursor = cuts.findIndex((data: any) => val < data);
            if (cursor <= 0) {
              cursor = cuts.length - 1;
            } else {
              cursor -= 1;
            }
            return `${tn[cursor]}(${rate(cursor, tn)})`;
          };
          confusionRow[0]['p'] = (val: any) => {
            let cursor = cuts.findIndex((data: any) => val < data);
            if (cursor <= 0) {
              cursor = cuts.length - 1;
            } else {
              cursor -= 1;
            }
            return `${fp[cursor]}(${rate(cursor, fp)})`;
          };
          confusionRow[1]['label'] = '1';
          confusionRow[1]['n'] = (val: any) => {
            let cursor = cuts.findIndex((data: any) => val < data);
            if (cursor <= 0) {
              cursor = cuts.length - 1;
            } else {
              cursor -= 1;
            }
            return `${fn[cursor]}(${rate(cursor, fn)})`;
          };
          confusionRow[1]['p'] = (val: any) => {
            let cursor = cuts.findIndex((data: any) => val < data);
            if (cursor <= 0) {
              cursor = cuts.length - 1;
            } else {
              cursor -= 1;
            }
            return `${tp[cursor]}(${rate(cursor, tp)})`;
          };
        }

        // gain chart
        else if (metric.match(/gain/i)) {
          gain.lineExplain(val, namespace, fromComponent);
        }

        // lift
        else if (metric.match(/lift/i)) {
          lift.lineExplain(val, namespace, fromComponent);
        }

        // precision
        else if (metric.match(/precision/i)) {
            // table
            if (!scoreTable.header.some((item) => item.prop === 'precision')) {
              scoreTable.header.push({
                label: 'precision',
                prop: 'precision',
              });
            }
          if (metric.match(/biclass/i)) {
            const isBinary = metric.match(/biClass/i);
            precisionRecall.binary = isBinary;
            const { cuts, p } = val;
            isRangeScoreTable = true

            let position: any;
            scoreRow['precision'] = (range: number) => {
              for (let i = 0; i < cuts.length; i++) {
                if (range < cuts[i]) {
                  position = i - 1;
                  break;
                } else if (range === cuts[i]) {
                  position = i;
                  break;
                }
              }
              if (position < 0) position = 0;
              return fixed(p[position]);
            };
            precisionRecall.precision = val;
          } else if (metric.match(/mult/)) {
            isRangeScoreTable = false
            scoreRow.precision = fixed(val)
          }
        }

        // recall
        else if (metric.match(/recall/i)) {
          
          // table
          if (!scoreTable.header.some((item) => item.prop === 'recall')) {
            scoreTable.header.push({
              label: 'recall',
              prop: 'recall',
            });
          }

          if (metric.match(/biclass/i)) {
            const isBinary = metric.match(/biClass/i);
            precisionRecall.binary = isBinary;

            const { cuts, r } = val;
            isRangeScoreTable = true

            let position: any;
            scoreRow['recall'] = (range: number) => {
              for (let i = 0; i < cuts.length; i++) {
                if (range < cuts[i]) {
                  position = i - 1;
                  break;
                } else if (range === cuts[i]) {
                  position = i;
                  break;
                }
              }
              if (position < 0) position = 0;
              return fixed(r[position]);
            };
            precisionRecall.recall = val;
          } else {
            isRangeScoreTable = false
            scoreRow.recall = fixed(val)
          }
        }

        // accuracy
        else if (metric.match(/accuracy/i)) {
          if (metric.match(/biclass/i)) {
            accuracy.lineExplain(val, namespace, fromComponent);
          } else {
            if (isNumber(val)) {
              if (!scoreTable.header.some((item) => item.prop === 'accuracy')) {
                scoreTable.header.push({
                  label: 'accuracy',
                  prop: 'accuracy',
                });
              }
              isRangeScoreTable = false
              scoreRow.accuracy = fixed(val)
            }
          }
        }

        // f1Score
        else if (metric.match(/fscore/i)) {
          if (
            !confusionMatrixTable.header.some((item) => item.prop === 'fscore')
          ) {
            confusionMatrixTable.header.splice(2, 0, {
              label: 'F1-score',
              prop: 'fscore',
            });
          }
          const { cuts, f_score } = val;
          for (const row of confusionRow) {
            let position: any;
            row['fscore'] = (range: number) => {
              for (let i = 0; i < cuts.length; i++) {
                if (range < cuts[i]) {
                  position = i - 1;
                  break;
                } else if (range === cuts[i]) {
                  position = i;
                  break;
                }
              }
              if (position < 0) position = 0;
              return fixed(f_score[position]);
            };
          }
        }
      }

      if (Object.keys(precisionRecall).length > 0) {
        if (precisionRecall.binary) {
          binPR.lineExplain(
            Object.assign(
              {},
              precisionRecall.precision,
              precisionRecall.recall
            ),
            namespace,
            fromComponent
          );
        } else {
          multPr.lineExplain(
            Object.assign(
              {},
              precisionRecall.precision,
              precisionRecall.recall
            ),
            namespace,
            fromComponent
          );
        }
      }

      scoreTable.data.push(scoreRow);
      confusionMatrixTable.data.push(...confusionRow);
    }

    const rocChart = roc.lineChart();
    if (Object.keys(rocChart).length > 0) chartInfo['ROC'] = rocChart;

    const ksChart = ks.lineChart();
    if (Object.keys(ksChart).length > 0) chartInfo['K-S'] = ksChart;

    const gainChart = gain.lineChart();
    if (Object.keys(gainChart).length > 0) chartInfo['Gain'] = gainChart;

    const liftChart = lift.lineChart();
    if (Object.keys(liftChart).length > 0) chartInfo['Lift'] = liftChart;

    const multPrChart = multPr.lineChart();
    if (Object.keys(multPrChart).length > 0) chartInfo['Precision_Recall'] = multPrChart;

    const binPrChart = binPR.lineChart();
    if (Object.keys(binPrChart).length > 0) chartInfo['Precision Recall'] = binPrChart;

    const accuracyChart = accuracy.lineChart();
    if (Object.keys(accuracyChart).length > 0) chartInfo['Accuracy'] = accuracyChart;
  }

  const group = toGroup();
  group.prop.class += ' f-d-seperator'
  group.children.push({
    id: 'EvaluationScore',
    tag: FRangeTable,
    prop: {
      title: 'Evaluation Scores',
      label: 'Quantile',
      header: scoreTable.header,
      data: scoreTable.data,
      range: isRangeScoreTable ? 1 : false,
      explain: 'Update Precision and Recall under the new quantile condition'
    },
  });

  if (isRangeConfusionTable && confusionMatrixTable.data.length > 0) {
    group.children.push({
      id: 'ConfusionMatrix',
      tag: FRangeTable,
      prop: {
        title: 'Confusion Matrix',
        label: 'Classification Threshold',
        header: confusionMatrixTable.header,
        data: confusionMatrixTable.data,
        range: 0.5,
        explain: 'Update the confusion matrix information under the new threshold condition'
      },
    });
  }

  if (Object.keys(chartInfo).length > 0) {
    group.children.push({
      id: 'EvaluationCharts',
      tag: FCharts,
      prop: {
        data: chartInfo,
      },
    });
  }
  return group;
}
