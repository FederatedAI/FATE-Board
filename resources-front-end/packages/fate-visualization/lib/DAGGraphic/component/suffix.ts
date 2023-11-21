import { scaleLinear } from 'd3';
import { toTime } from 'fate-tools';
import { EventCallback, PlotCommon } from '../Plot';
import { SVGs } from '../svg';
import configuration from './configuration';

interface PropOptions {
  height: number;
  duration?: number;
  status: string;
  disable: boolean;
}

interface EventOptions {
  retry: EventCallback;
}

interface SuffixParameter {
  prop: PropOptions;
  attr: object;
  event: EventOptions;
}

let runningTimeout: any;
export default function suffix({ prop, attr, event }: SuffixParameter) {
  prop = Object.assign({ duration: 0 }, prop);

  const options: any = {
    id: 'suffix',
    tag: 'svg',
    prop,
    attr: Object.assign(
      {
        opacity: 1,
        overflow: 'visible',
      },
      attr
    ),
    event: {
      status: (event: any, tag: PlotCommon) => {
        const status = event.detail;
        tag.setAttr('opacity', 0, 100, () => {
          tag.dispatchDeep('unrunning');
          tag.setProp('status', status, 100, () => {
            if (status.match(/running/i)) {
              tag.dispatchDeep('running');
            }
            tag.setAttr('opacity', 1, 100);
          });
        });
      },
    },
    children: [
      {
        id: 'status',
        tag: (d: PropOptions) => {
          if (d.status.match(/success/i)) {
            return SVGs()[d.disable ? 'discomplete' : 'complete'];
          } else if (d.status.match(/fail/i)) {
            return SVGs()[d.disable ? 'diserror' : 'error'];
          } else {
            return 'path';
          }
        },
        prop,
        attr: Object.assign(
          {
            y: (d: PropOptions) => {
              const yAxis = scaleLinear()
                .domain([0, 2])
                .range([0, d.height + configuration.common.margin * 2]);
              return yAxis(1) - configuration.icon.size.height / 2;
            },
            display: (d: PropOptions) =>
              !!d.status.match(/success|fail/i) ? 'normal' : 'none',
            fill: (d: any) => d.match(/success/i) ? configuration.icon.color.Success : configuration.icon.color.Fail,
            stroke: (d: any) => d.match(/success/i) ? configuration.icon.color.Success : configuration.icon.color.Fail
          },
          configuration.icon.size
        ),
      },

      {
        id: 'tiktok',
        tag: 'text',
        prop,
        attr: {
          display: (d: PropOptions) =>
            !!d.status.match(/running/i) ? 'normal' : 'none',
          y: (d: PropOptions) => {
            const yAxis = scaleLinear()
              .domain([0, 2])
              .range([0, d.height + configuration.common.margin * 2]);
            return yAxis(1) + configuration.common.fontSize / 3;
          },
          fill: configuration.suffix.style.color,
          fontSize: configuration.common.fontSize,
          fontFamily: configuration.common.fontFamily,
        },
        event: {
          running: (_event: any, tag: PlotCommon) => {
            const running = () => {
              runningTimeout = setTimeout(() => {
                if (tag.dom) {
                  tag.setProp('duration', (tag.prop as any).duration + 1);
                  running();
                }
              }, 1000);
            };
            running();
          },
          unrunning: () => {
            if (runningTimeout) {
              clearTimeout(runningTimeout);
            }
          },
        },
        text: (d: PropOptions) => {
          return toTime(d.duration || 0);
        },
      },

      {
        id: 'retry',
        tag: 'text',
        prop,
        attr: {
          display: (d: PropOptions) =>
            d.status.match(/fail/i) ? 'normal' : 'none',
          x: configuration.icon.size.width + configuration.common.margin * 2,
          y: (d: PropOptions) => {
            const yAxis = scaleLinear()
              .domain([0, 2])
              .range([0, d.height + configuration.common.margin * 2]);
            return yAxis(1) + configuration.common.fontSize / 3;
          },
          fill: configuration.suffix.style.color,
          fontSize: configuration.common.fontSize,
          fontFamily: configuration.common.fontFamily,
          cursor: 'pointer',
        },
        event: {
          click: (eve: any, tag: PlotCommon) => {
            eve.stopPropagation()
            event.retry && event.retry(eve, tag);
          },
        },
        text: 'retry',
      },
    ],
  };

  return options;
}
