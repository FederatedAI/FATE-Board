import toOpacity from '@/utils/toOpacity';
import { scaleLinear } from 'd3';
import { capitalize } from 'lodash';
import { PortInfo } from '.';
import { EventCallback, PlotCommon } from '../Plot';
import configuration from './configuration';
import portSVG from './portSvg';
import StagePlot from './StagePlot';

interface PropOptions {
  name: string;

  width: number;
  height: number;
  txWidth: number;

  status: string;
  disable: boolean;
  stage: string;
  choose: boolean;
  relativeChoose: boolean;

  input: PortInfo[];
  output: PortInfo[];
}

interface EventOptions {
  overPort: EventCallback;
  outPort: EventCallback;
  choose: EventCallback;
  unchoose: EventCallback;
  connect: EventCallback;
  overStage: EventCallback;
  outStage: EventCallback;
  relative: EventCallback
  unrelative: EventCallback
}

interface MainBodyParameter {
  prop: PropOptions;
  attr: object;
  event: EventOptions;
}

function styles(part: string, data: any): string {
  if (part.match(/border/i) && data.relativeChoose) {
    return (configuration.body.style as any)['Relative']
  }
  return (configuration.body.style as any)[
    `${capitalize(data.status)}_${capitalize(part)}${
      data.choose ? '_Choose' : data.disable ? '_Disable' : ''
    }`
  ];
}

export default function mainBody({ prop, attr, event }: MainBodyParameter) {
  prop = Object.assign({}, prop);

  const options = {
    id: 'mainbody',
    tag: 'svg',
    prop,
    attr: Object.assign(
      {
        class: 'mainbody_container',
        overflow: 'visible',
      },
      attr
    ),
    event: {
      status: (eve: any, tag: PlotCommon) => {
        const status = eve.detail;
        const change = () => {
          tag.setProp('status', status, 200, () => {
            if (status.match(/running/i)) {
              tag.dispatchDeep('running');
            }
          });
        };
        tag.dispatchDeep('unrunning');
        change();
      },
      click: (eve: any, tag: PlotCommon) => {
        eve.stopPropagation()
        if (!tag.prop.choose) {
          tag.setProp('choose', true, 100, () => {
            event?.choose && event?.choose(eve, tag);
          });
        }
      },
      unchoose: (eve: any, tag: PlotCommon) => {
        if (tag.prop.choose) {
          tag.setProp('choose', false, 100, () => {
            event?.unchoose && event?.unchoose(eve, tag);
          });
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
        id: 'body',
        tag: 'rect',
        prop,
        attr: {
          x: configuration.common.margin,
          y: configuration.common.margin,
          width: (d: PropOptions) => d.width,
          height: (d: PropOptions) => d.height,
          fill: (d: PropOptions) => styles('body', d),
          stroke: 'none',
          'fill-opacity': 1,
          rx: configuration.body.size.Radius,
        },
        event: {
          running: (_event: any, tag: PlotCommon) => {
            const toOpc = () => {
              tag.setAttr(
                'fill',
                (d: PropOptions) => toOpacity(styles('body', d)),
                600,
                () => toWid(),
                () => {
                  tag.setAttrs(
                    {
                      width: (d: PropOptions) => d.width,
                      fill: (d: PropOptions) => styles('body', d),
                    },
                    100
                  );
                }
              );
            };
            const toWid = () => {
              tag.setAttrs(
                {
                  fill: (d: PropOptions) => styles('body', d),
                  width: 0,
                },
                0,
                () => {
                  tag.setAttr(
                    'width',
                    (d: PropOptions) => d.width,
                    2000,
                    () => toOpc()
                  );
                },
                () => {
                  tag.setAttrs(
                    {
                      width: (d: PropOptions) => d.width,
                      fill: (d: PropOptions) => styles('body', d),
                    },
                    100
                  );
                }
              );
            };
            toOpc();
          },
          unrunning: (_event: any, tag: PlotCommon) => {
            tag.dom.interrupt();
          },
        },
      },

      {
        id: 'border',
        tag: 'rect',
        prop,
        attr: {
          x: configuration.common.margin,
          y: configuration.common.margin,
          width: (d: PropOptions) => d.width,
          height: (d: PropOptions) => d.height,
          fill: 'none',
          stroke: (d: PropOptions) => styles('border', d),
          'stroke-width': configuration.common.lineWidth,
          'fill-opacity': 0,
          rx: configuration.body.size.Radius,
        },
      },

      {
        id: 'stage1',
        tag: 'rect',
        prop,
        attr: {
          x: configuration.common.margin + 2,
          y: configuration.common.margin + 2,
          width: configuration.body.size.stageWidth,
          height: (d: PropOptions) => d.height - 4,
          fill: (d: PropOptions) =>
            (configuration.body.style as any)[`stage${capitalize(d.stage)}`],
          stroke: (d: PropOptions) =>
            (configuration.body.style as any)[`stage${capitalize(d.stage)}`],
          'stroke-width': configuration.common.lineWidth / 2,
          'fill-opacity': 1,
          rx: configuration.body.size.Radius,
          display: 'none',
        },
      },
      {
        id: 'stage2',
        tag: 'rect',
        creator: (options: any) => new StagePlot(options),
        prop,
        attr: {
          x: (d: PropOptions) =>
            d.width -
            configuration.common.margin -
            configuration.body.size.stageCircle,
          y: configuration.common.margin * 3,
          width: configuration.body.size.stageCircle,
          height: configuration.body.size.stageCircle,
          fill: (d: PropOptions) =>
            (configuration.body.style as any)[`stage${capitalize(d.stage)}`],
          rx: configuration.body.size.Radius,
          display: (d: PropOptions) =>
            !d.stage.match(/default/i) ? 'normal' : 'none',
        },
        event: {
          mouseover: (eve: any, plot: PlotCommon) => {
            event.overStage && event.overStage(eve, plot);
          },
          mouseout: (eve: any, plot: PlotCommon) => {
            event.outStage && event.outStage(eve, plot);
          },
        },
      },

      {
        id: 'name',
        tag: 'text',
        prop,
        attr: {
          x: (d: PropOptions) => {
            const xAxis = scaleLinear()
              .domain([0, 2])
              .range([0, d.width + configuration.common.margin * 2])
              .nice();
            return xAxis(1) - (d.txWidth || 0) / 2;
          },
          y: (d: PropOptions) => {
            const yAxis = scaleLinear()
              .domain([0, 2])
              .range([0, d.height + configuration.common.margin * 2]);
            return yAxis(1) + configuration.common.fontSize / 3;
          },
          'font-size': configuration.common.fontSize,
          'font-family': configuration.common.fontFamily,
          cursor: 'pointer',
          fill: (d: PropOptions) => styles('text', d),
        },
        text: prop.name,
      },

      ...(() => {
        const ports: object[] = [];
        for (let i = 0; i < prop.input.length; i++) {
          ports.push(
            portSVG({
              prop: <any>(
                Object.assign(
                  { total: prop.input.length, cursor: i },
                  prop,
                  prop.input[i]
                )
              ),
              attr: {},
              event: <any>event,
            })
          );
        }
        for (let i = 0; i < prop.output.length; i++) {
          ports.push(
            portSVG({
              prop: <any>(
                Object.assign(
                  { total: prop.output.length, cursor: i },
                  prop,
                  prop.output[i]
                )
              ),
              attr: {},
              event: <any>event,
            })
          );
        }
        return ports;
      })(),
    ],
  };
  return options;
}
