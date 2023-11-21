import parse from '../parse';
import { EventCallback, PlotCommon } from '../Plot';
import configuration from './configuration';
import DataInputPlot from './dataInputPlot';

interface PropOptions {
  name: string;
  type: string;
  relativeChoose: boolean;

  x: number;
  y: number;

  tooltip: string;
}

interface EventOptions {
  overInput: EventCallback;
  outInput: EventCallback;
  connect: EventCallback;
  relative: EventCallback
  unrelative: EventCallback
}

interface StartInputParameter {
  prop: PropOptions;
  attr: object;
  event: EventOptions;
}

export default function startInput(
  { prop, attr, event }: StartInputParameter,
  parent: PlotCommon | undefined | unknown
) {
  prop = Object.assign({}, prop);

  const options = {
    id: prop.name,
    creator: (options: any) => new DataInputPlot(options),
    tag: 'svg',
    prop,
    attr: Object.assign(
      {
        class: 'datainput_container',
        x: (d: PropOptions) =>
          d.x - configuration.size.width / 2 - configuration.common.margin,
        y: (d: PropOptions) =>
          d.y - configuration.size.height / 2 - configuration.common.margin,
      },
      attr
    ),
    event: {
      mouseover: (eve: any, plot: PlotCommon) => {
        event?.overInput && event?.overInput(eve, plot);
      },
      mouseout: (eve: any, plot: PlotCommon) => {
        event?.outInput && event?.outInput(eve, plot);
      },
      connect: (eve: any, plot: PlotCommon) => {
        event?.connect && event?.connect(eve, plot);
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
        tag: 'rect',
        prop,
        attr: Object.assign(
          {
            x: configuration.common.margin,
            y: configuration.common.margin,
            fill: (d: any) => {
              return d.type.match(/data/i)
                ? configuration.styles.data
                : d.type.match(/model/i)
                ? configuration.styles.model
                : d.type.match(/cache/i)
                ? configuration.styles.cache
                : configuration.styles.stroke;
            },
            stroke: (d: any) => 
              d.relativeChoose
                ? configuration.styles.Relative
                : configuration.styles.stroke,
            'stroke-width': configuration.common.lineWidth,
          },
          configuration.size
        ),
      },
    ],
  };

  const tag = parse(options, parent);

  return tag;
}
