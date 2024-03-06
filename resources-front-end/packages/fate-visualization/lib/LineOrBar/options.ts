import configuration from '@/configuration';
import { isObject, merge } from 'lodash';
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
  tooltip: object;
}

export default function options({
  tooltip,
  xAxis,
  yAxis,
  series,
  zoomType,
  legendCustomer,
  color,
}: OptionsParameter): any {
  const legendData: string[] = [];
  let options: any = merge(
    {
      tooltip: Object.assign({
        trigger: 'axis',
      }, tooltip || {}),
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
        } else {
          list.push({
            type: 'value',
            axisLine: {
              show: true
            }
          })
        }
        return list.flat(Infinity);
      })(),

      series: (() => {
        const list = [];
        if (series) {
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
                (param as any).type === 'bar' ? {
                  barMaxWidth: 30
                } : {},
                param
              )
            );
            if ((param as any).name) legendData.push((param as any).name);
          }
        }
        return list.flat(Infinity);
      })(),
      grid: {
        top: '12%',
        left: '5%',
        right: '5%',
        bottom: '8%'
      }
    },
    configuration
  );

  if (options.series.length > 0) {
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
        minSpan: 20
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
        minSpan: 20
      },
    ];
    if (color) {
      for (let i = 0; i < options.series.length; i++) {
        const serie = options.series[i];
        serie.itemStyle = {
          color: color[i],
        };
        if ((serie as any).type === 'line') {
          if (!serie.lineStyle) {
            serie.lineStyle = {
              color: color[i],
            };
          } else {
            serie.lineStyle.color = color[i]
          }
          if (serie.areaStyle && isObject(serie.areaStyle)) {
            serie.areaStyle.color = color[i]
          }
        }
      }
    }
  } else {
    options = {
      title: {
        text: 'No Data',
        x: 'center',
        y: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      xAxis: {
        axisLine: {
          show: false
        }
      },
      yAxis: {
        axisLine: {
          show: false
        }
      }
    }
  }
  return options;
}
