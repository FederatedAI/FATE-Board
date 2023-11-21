import configuration from '@/configuration';
import { merge } from 'lodash';
import toAxis from './axis';
import toLegend from './legend';

type Val = string | number;
interface AxisOptions {
  name?: string;
  data?: Val[];
  min?: number;
  max?: number;
}

interface Series {
  type: string;
  data: Val[];
  label: unknown;
  xAxisIndex?: number;
  yAxisIndex?: number;
}

interface OptionsParameter {
  xAxis?: AxisOptions | AxisOptions[];
  yAxis?: AxisOptions | AxisOptions[];

  series: Series | Series[];

  zoomType?: string;
  legendCustomer?: boolean;
  color?: string[];
}

export default function options({
  xAxis,
  yAxis,
  series,
  zoomType,
  legendCustomer,
  color,
}: OptionsParameter): any {
  const legendData: string[] = [];
  const options: any = merge({
    tooltip: {
      trigger: 'axis',
    },
    xAxis: (() => {
      const list: object[] = [];
      if (xAxis) {
        for (const param of [xAxis].flat(Infinity)) {
          list.push(toAxis(param));
        }
      }
      return list.flat(Infinity);
    })(),
    yAxis: (() => {
      const list: object[] = [];
      if (yAxis) {
        for (const param of [yAxis].flat(Infinity)) {
          list.push(toAxis(param));
        }
      }
      return list.flat(Infinity);
    })(),
    series: (() => {
      const list = [];
      for (const param of [series].flat(Infinity)) {
        list.push(
          Object.assign(
            {
              xAxisIndex: 0,
              yAxisIndex: 0,
              emphasis: {
                focus: 'series',
              },
            },
            param
          )
        );
        if ((param as any).name) legendData.push((param as any).name);
      }
      return list.flat(Infinity);
    })(),
  }, configuration);

  if (!!legendCustomer === false) {
    options.legend = toLegend(legendData);
  }
  options.dataZoom = [
    {
      type: zoomType || 'inside',
      xAxisIndex: options.xAxis.reduce(
        (acc: number[], _val: unknown, cur: number) => {
          acc.push(cur);
          return acc;
        },
        []
      ),
      show: true,
    },
    {
      type: zoomType || 'inside',
      yAxisIndex: options.yAxis.reduce(
        (acc: number[], _val: unknown, cur: number) => {
          acc.push(cur);
          return acc;
        },
        []
      ),
      show: true,
    },
  ];
  if (color) {
    for (let i = 0; i < options.series.length; i++) {
      const serie = options.series[i];
      serie.itemStyle = {
        color: color[i],
      };
      if ((serie as any).type === 'line') {
        serie.lineStyle = {
          color: color[i],
        };
      }
    }
  }
  return options;
}
