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
    for (const key in data) {
      const value = data[key];
      tableData.push(
        Object.assign({}, value, {
          label: key,
        })
      );
      options.push({
        label: key,
        value: key,
      });
    }
    tableHeader.push(
      Object.keys(tableData[0]).map((item: string) => {
        return {
          label: item,
          prop: item,
        };
      })
    );
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
        placeholder: 'Sample Filter',
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
