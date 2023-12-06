import { isNumber, isObject } from 'lodash';
import sort from '../tools/sort';
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
  let tableData: any = [];
  const tableHeader: any = [];

  if (comp_type.match(new RegExp(KeyToHeader.join('|'), 'i'))) {
    tableHeader.push({
      label: 'label',
      prop: 'label'
    });
    
    for (const key in data) {
      if (key.match(/total/i) || isNumber(parseFloat(key))) {
        const row = Object.assign({
          label: key
        }, data[key])
        for (const key in row) {
          if (!tableHeader.some((header: any) => header.prop === key)) {
            tableHeader.push({
              label: key,
              prop: key
            })
          }
        }
        tableData.push(row)
      } else {
        const value = data[key];
        if (!tableHeader.some((header: any) => header.prop === key)) {
          tableHeader.push({
            label: key,
            prop: key
          })
        }
        if (isObject(value)) {
          for (const label in value) {
            if (!options.some((item: any) => item.value === label)) {
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
          width: 80,
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

  tableData = sort(tableData, 'label', (a: any, b: any) => {
    if (a['label'].match(/total/i)) {
      return 1
    } else {
      return -1
    }
  })

  const SummaryMetricContainer = toGroup();

  if (options.length > 1) {
    SummaryMetricContainer.children.push({
      id: 'SummaryMetricsOperation',
      tag: 'section',
      prop: { class: 'f-d-group-right' },
      children: [
        toSelect('SummaryMetricSelection', options, {
          placeholder: 'Filter',
          modelValue: '',
        }),
      ],
    });
  }

  SummaryMetricContainer.children.push(
    toTable(
      tableHeader,
      options.length > 1
        ? {
            request: (value: string) => {
              if (value) {
                const cursor = tableData.findIndex(
                  (each: any) => each.label === value
                );
                if (cursor >= 0) return [tableData[cursor]];
                else return [];
              } else {
                return tableData;
              }
            },
            parameter: ['SummaryMetricSelection.modelValue'],
          }
        : tableData
    )
  );

  return SummaryMetricContainer;
}
