import { EventCallback, PlotCommon } from '../Plot';
import parse from '../parse';
import configuration from './configuration';

interface PropOptions {
  name?: string;
  from: number[];
  end: number[];
  choose: boolean;
}

interface EventOptions {
  chooseLink: EventCallback;
  unchooseLink: EventCallback;
  delete: EventCallback;
}

interface LinkingParameter {
  prop: PropOptions;
  attr: object;
  event: EventOptions;
}

export default function linking(
  { prop, attr, event }: LinkingParameter,
  parent: PlotCommon | undefined | unknown
) {
  prop = Object.assign({ choose: false }, prop);

  const options = {
    id: prop.name,
    tag: 'svg',
    append: false,
    prop,
    attr: Object.assign(
      {
        x: (d: PropOptions) => {
          return Math.min(
            d.from[0] - configuration.margin,
            d.end[0] - configuration.margin
          );
        },
        y: (d: PropOptions) => {
          return Math.min(
            d.from[1] - configuration.margin,
            d.end[1] - configuration.margin
          );
        },
        width: (d: PropOptions) => {
          return Math.abs(d.from[0] - d.end[0]) + configuration.margin * 2;
        },
        height: (d: PropOptions) => {
          return Math.abs(d.from[1] - d.end[1]) + configuration.margin * 2;
        },
      },
      attr
    ),
    style: {
      zIndex: 1,
    },
    event: {
      keydown: (eve: any, plot: PlotCommon) => {
        const isDel = eve.code.match(/delete/i);
        if (isDel) {
          plot.remove();
        }
      },
    },
    children: [
      {
        id: 'path',
        tag: 'path',
        prop,
        attr: {
          d: (d: PropOptions) => {
            let path = '';

            const m = configuration.margin;
            const s = d.from;
            const e = d.end;
            const w = Math.abs(s[0] - e[0]);
            const h = Math.abs(s[1] - e[1]);

            const f = [s[0] < e[0] ? m : w + m, s[1] < e[1] ? m : h + m];
            const t = [e[0] < s[0] ? m : w + m, e[1] < s[1] ? m : h + m];
            const md = [
              [f[0], f[1] + (t[1] - f[1]) / 2],
              [t[0], f[1] + (t[1] - f[1]) / 2],
            ];

            path += `M ${f[0]} ${f[1]}`;
            path += `C ${(() => {
              let str = '';
              for (const middle of md) {
                str += middle.join(' ') + ', ';
              }
              str += t.join(' ');
              return str;
            })()}`;

            return path;
          },
          fill: 'none',
          stroke: (d: PropOptions) =>
            d.choose ? configuration.choose_style : configuration.style,
          'stroke-width': (d: PropOptions) =>
            d.choose ? configuration.choose_lineWidth : configuration.lineWidth,
          'stroke-linecap': 'round',
        },
        event: {
          choose: (eve: any, plot: PlotCommon) => {
            if (!plot.prop.choose) {
              plot.setProp('choose', true, 100, () => {
                event?.chooseLink && event?.chooseLink(eve, plot);
              });
            }
          },
          unchoose: (eve: any, plot: PlotCommon) => {
            if (plot.prop.choose) {
              plot.setProp('choose', false, 100, () => {
                event?.unchooseLink && event?.unchooseLink(eve, plot);
              });
            }
          },
        },
      },
    ],
  };

  return parse(options, parent);
}
