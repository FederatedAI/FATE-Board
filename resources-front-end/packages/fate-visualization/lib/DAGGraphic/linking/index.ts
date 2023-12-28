import parse from '../parse';
import { EventCallback, PlotCommon } from '../Plot';
import configuration from './configuration';

interface PropOptions {
  name?: string;
  from: number[];
  end: number[];
  choose: boolean;
  relativeChoose: boolean;
}

interface EventOptions {
  chooseLink: EventCallback;
  unchooseLink: EventCallback;
  delete: EventCallback;
  relative: EventCallback
  unrelative: EventCallback
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
  prop = Object.assign({ choose: false, relativeChoose: false }, prop);

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
          const s = d.from;
          const e = d.end;
          const beHer = e[1] < s[1]
          return Math.min(
            d.from[1] - configuration.margin,
            d.end[1] - configuration.margin
          ) - (beHer ? configuration.heighter : 0);
        },
        width: (d: PropOptions) => {
          return Math.abs(d.from[0] - d.end[0]) + configuration.margin * 2;
        },
        height: (d: PropOptions) => {
          const s = d.from;
          const e = d.end;
          const beHer = e[1] < s[1]
          return Math.abs(d.from[1] - d.end[1]) + configuration.margin * 2 + (beHer ? configuration.heighter * 2 : 0);
        },
      },
      attr
    ),
    style: {
      zIndex: (d: PropOptions) => {
        return (d.relativeChoose || d.choose) ? 5 : 1
      },
    },
    event: {
      keydown: (eve: any, plot: PlotCommon) => {
        const isDel = eve.code.match(/delete/i);
        if (isDel) {
          plot.remove();
        }
      },
      relative: (eve: any, tag: PlotCommon) => {
        if (!tag.prop.relativeChoose) {
          tag.setProp('relativeChoose', true, 100, () => {
            event?.relative && event?.relative(eve, tag);
          });
        }
      },
      unrelative: (eve: any, tag: PlotCommon) => {
        if (tag.prop.relativeChoose) {
          tag.setProp('relativeChoose', false, 100, () => {
            event?.unrelative && event?.unrelative(eve, tag);
          });
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
            const beHer = e[1] < s[1]
            const w = Math.abs(s[0] - e[0]);
            const h = Math.abs(s[1] - e[1]);

            const f = [s[0] < e[0] ? m : w + m, (s[1] < e[1] ? m : h + m) + (beHer ? configuration.heighter : 0)];
            const t = [e[0] < s[0] ? m : w + m, (e[1] < s[1] ? m : h + m) + (beHer ? configuration.heighter : 0)];
            let bet = t[1] - f[1]
            let md
            if (bet > 0) {
              bet = bet / 2
              md = [
                [f[0], f[1] + bet],
                [t[0], f[1] + bet],
              ]
            } else {
              bet = Math.min(bet / 2, -configuration.heighter)
              md = [
                [f[0], f[1] - bet],
                [t[0], f[1] + bet],
              ]
            }

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
            d.relativeChoose
              ? configuration.Relative
              : d.choose 
                ? configuration.choose_style
                : configuration.style,
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
