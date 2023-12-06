import { isString, isUndefined } from 'lodash';
import getModelData from '../tools/getModelData';
import sort from '../tools/sort';
import toGroup from '../tools/toGroup';
import toSelect from '../tools/toSelect';
import toTable from '../tools/toTable';

export default function hetero_feature_selection(
  modelData: object,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const mData = getModelData(modelData);
  const { data, meta } = mData.train_output_model;
  const { select_col, method } = meta;
  const { inner_method, selection_obj_list } = data;
  let slist = selection_obj_list;
  if (isString(slist)) {
    slist = JSON.parse(slist);
  }

  const isGuest = role.match(/guest/i);

  const defaultHeader: any = [
    {
      label: 'variable',
      prop: 'variable',
    },
  ];

  const options: any = [];
  if (isGuest) {
    options.push({
      label: 'guest',
      value: 'guest',
    });
  } else {
    options.push({
      label: 'host',
      valur: 'host',
    });
  }
  const tData: any = {};
  const tHeader: any = {};

  const current = isGuest ? 'guest' : 'host';

  const tableExplain = (selectionData: any) => {
    const {
      all_metrics,
      all_selected_mask,
      all_host_metrics,
      all_host_selected_mask,
      selected_mask,
      host_selected_mask,
      method,
    } = selectionData;

    // current role data
    if (all_metrics || all_selected_mask) {
      const toMetricsData = tData[current] || [];
      const toMetricsHeader = tHeader[current] || [...defaultHeader];
      for (const variable in all_selected_mask) {
        const row: any = {};
        row['variable'] = variable;
        for (const col in all_selected_mask[variable]) {
          if (!toMetricsHeader.some((item: any) => item.prop === col)) {
            toMetricsHeader.push({ label: col, prop: col });
          }
          row[col] = {
            value: all_metrics?.[variable][col] || '-',
            filter: all_selected_mask?.[variable][col] || true,
          };
        }
        if (selected_mask && !isUndefined(selected_mask[variable])) {
          row._filter = !selected_mask[variable];
        }
        toMetricsData.push(row);
      }
      tHeader[current] = toMetricsHeader;
      tData[current] = toMetricsData;
    } else if (!all_metrics && !all_host_metrics) {
      const toMethodData = tData[current] || [];
      const toMethodHeader = tHeader[current] || [...defaultHeader];
      toMethodHeader.push({
        label: method,
        prop: method,
      });
      for (const variable in selected_mask) {
        const row: any = {};
        row['variable'] = variable;
        row[method] = '-';
        row._filter = !selected_mask[variable];
        const cursor = toMethodData.findIndex(
          (item: any) => item['variable'] === variable
        );
        if (cursor >= 0) {
          Object.assign(toMethodData[cursor], row);
        }
      }
      tHeader[current] = toMethodHeader;
      tData[current] = toMethodData;
    }

    if (all_host_metrics || all_host_selected_mask) {
      // host for data
      for (const option in all_host_selected_mask) {
        if (!options.some((item: any) => item.value === option)) {
          options.push({
            label: option,
            value: option,
          });
        }
        const toHostData = tData[option] || [];
        const toHostHeader = tHeader[option] || [...defaultHeader];
        for (const variable in all_host_selected_mask[option]) {
          const row: any = {};
          row['variable'] = variable;
          for (const col in all_host_metrics[option][variable]) {
            if (!toHostHeader.some((item: any) => item.prop === col)) {
              toHostHeader.push({
                label: col,
                prop: col,
              });
            }
            row[col] = {
              value: all_host_metrics[option]?.[variable][col] || '-',
              filter: all_host_selected_mask?.[option][variable][col] || true,
            };
          }
          const selected_mask = host_selected_mask?.[option] || true;
          if (selected_mask && !isUndefined(selected_mask[variable])) {
            row._filter = !selected_mask[variable];
          }

          const cursor = toHostData.findIndex(
            (item: any) => item['variable'] === variable
          );
          if (cursor >= 0) {
            Object.assign(toHostData[cursor], row);
          } else {
            toHostData.push(row)
          }
        }
        tHeader[option] = toHostHeader;
        tData[option] = toHostData;
      }
    }
  };

  if (Array.isArray(slist)) {
    for (const each of slist) {
      tableExplain(each);
    }
  } else {
    tableExplain(slist);
  }

  for (const key in tData) {
    tData[key] = sort(tData[key], 'variable', (a: any, b: any) => {
      if (a._filter && b._filter) {
        return 0
      } else if (a._filter) {
        return 1
      } else if (b._filter) {
        return -1
      } else {
        return 0
      }
    })
  }

  const group = toGroup();
  const hasSelection = options.length > 1;
  if (hasSelection) {
    group.children.push({
      id: 'SelectionFilter',
      tag: 'section',
      prop: { class: 'f-d-group-right' },
      children: [toSelect('SelectionSelect', options)],
    });
  }
  group.children.push(
    toTable(
      hasSelection
        ? {
            request: (value: string) => tHeader[value],
            parameter: ['SelectionSelect.modelValue'],
          }
        : tHeader[Object.keys(tHeader)[0]],
      hasSelection
        ? {
            request: (value: string) => tData[value],
            parameter: ['SelectionSelect.modelValue'],
          }
        : tData[Object.keys(tData)[0]],
      {
        index: true,
        maxHeight: undefined,
      }
    )
  );
  return group;
}
