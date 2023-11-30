import toFixed from '@/utils/toFixed';
import { isUndefined } from 'lodash';
import getModelData from '../tools/getModelData';
import toSelect from '../tools/toSelect';
import toTable from '../tools/toTable';
import toText from '../tools/toText';

export default function Coordinated_lr(
  modelData: object,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const modelInstance = getModelData(modelData);

  const { data, meta } = modelInstance.output_model;
  const { ovr } = meta;
  const { estimator } = data;

  const WeightTableDataExplain = (estimator_data: any, label: any) => {
    const { is_converged, header, end_epoch, param } = estimator_data;
    const { coef_, intercept_ } = param;

    const text = {
      'model label': label,
      coverged: is_converged,
      iteration: end_epoch,
      label,
    };

    const tableHeader: any = [
      {
        type: 'index',
        label: 'index',
        width: '100',
      },
      {
        prop: 'variable',
        label: 'variable',
        sortable: true,
      },
      {
        prop: 'weight',
        label: 'weight',
        sortable: true,
      },
    ];

    const tableData = (() => {
      const list: any = (header || coef_).map((val: string, key: number) => {
        return {
          variable: !header ? key : val,
          weight: toFixed(coef_[key][0]),
        };
      });
      if (intercept_) {
        list.push({
          variable: 'intercept',
          weight: intercept_,
        });
      }
      return list;
    })();

    return {
      text,
      table: {
        header: tableHeader,
        data: tableData,
      },
    };
  };

  const options: any[] = [];
  const displayData: any[] = [];
  if (ovr) {
    let i = 0;
    for (const key in estimator) {
      options.push({
        label: key,
        value: i,
      });
      displayData.push(WeightTableDataExplain(estimator[key], key));
      i++;
    }
  } else {
    displayData.push(WeightTableDataExplain(estimator, undefined));
  }

  const LR_model_container = {
    id: 'LRModelContainer',
    tag: 'section',
    prop: { class: 'f-d-container f-d-margin' },
    children: <any[]>[],
  };

  const hasSelection = options && options.length > 0;
  if (hasSelection) {
    LR_model_container.children.push(
      toSelect('LROVRSelection', options, {
        placeholder: '',
        label: 'one_vs_rest model',
      })
    );
  }

  const displayText = displayData[0].text;
  for (const key in displayText) {
    const value = displayText[key];

    if (!isUndefined(value)) {
      LR_model_container.children.push(
        toText(
          hasSelection
            ? {
                request: (value: any) => {
                  return String(displayData[parseFloat(value || '0')].text[key]) + ' ';
                },
                parameter: ['LROVRSelection.modelValue'],
              }
            : String(value),
          key
        )
      );
    }
  }

  LR_model_container.children.push(
    toTable(
      hasSelection
        ? {
            request: (value: string) => displayData[parseFloat(value || '0')].table.header,
            parameter: ['LROVRSelection.modelValue'],
          }
        : displayData[0].table.header,
      hasSelection
        ? {
            request: (value: string) => displayData[parseFloat(value || '0')].table.data,
            parameter: ['LROVRSelection.modelValue'],
          }
        : displayData[0].table.data
    )
  );

  return LR_model_container;
}
