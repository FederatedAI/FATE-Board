import { isObject } from 'lodash';
import toData from '../tools/toData';
import toGroup from '../tools/toGroup';
import toSelect from '../tools/toSelect';
import toTable from '../tools/toTable';

const KeyToHeader = ['sample'];
export default function Summary(
  metric_data: any,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const { data } = metric_data;

  const options: any = [];
  const tableData: any = [];
  const tableHeader: any = [];

  if (comp_type.match(new RegExp(KeyToHeader.join('|'), 'i'))) {
    tableHeader.push({
      label: 'label',
      prop: 'label'
    });
    for (const key in data) {
      const value = data[key];
      tableHeader.push({
        label: key,
        prop: key
      })
      if (isObject(value)) {
        for (const label in value) {
          if (options.some((item: any) => item.value === label)) {
            options.push({
              label,
              value: label
            })
          }

          const cursor = tableData.findIndex((item: any) => item.label === label)
          if (cursor < 0) {
            tableData.push({
              label,
              [key]: (value as any)[label]
            });
          } else {
            tableData[cursor][key] = (value as any)[label]
          }
        }
      }
    }
    if (!tableData[0]) {
      tableData.push(data)
    }
  } else {
    tableHeader.push(
      ...[
        {
          type: 'index',
          label: 'index',
          width: 80
        },
        {
          label: 'variable',
          prop: 'variable',
        },
        {
          label: 'value',
          prop: 'value',
        },
      ]
    );
    tableData.push(
      ...Object.keys(data).map((key: string) => {
        return {
          variable: key,
          value: toData(data[key]),
        };
      })
    );
  }

  const SummaryMetricContainer = toGroup();

  if (options.length > 1) {
    SummaryMetricContainer.children.push(
      toSelect('SummaryMetricSelection', options, {
        placeholder: 'Filter',
      })
    );
  }

  SummaryMetricContainer.children.push(
    toTable(
      tableHeader,
      (() => {
        return options.length > 1
          ? {
              request: (value: string) => {
                const cursor = tableData.findIndex(
                  (each: any) => each.label === value
                );
                if (cursor >= 0) return [tableData[cursor]];
                else return [];
              },
              parameter: ['SummaryMetricSelection'],
            }
          : tableData;
      })()
    )
  );

  return SummaryMetricContainer;
}
