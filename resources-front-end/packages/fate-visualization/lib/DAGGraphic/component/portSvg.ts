import { scaleLinear } from 'd3';
import { capitalize } from 'lodash';
import { EventCallback, PlotCommon } from '../Plot';
import configuration from './configuration';
import PortPlot from './PortPlot';

interface PropOptions {
  name: string;
  type: string;
  direction: string;
  tooltip: string;
  multiply: boolean;
  status: string;
  disable: boolean;

  width: number;
  height: number;
  cursor: number;
  total: number;
}

interface EventOptions {
  overPort: EventCallback;
  connect: EventCallback;
  outPort: EventCallback;
}

interface PortParameter {
  prop: PropOptions;
  attr: object;
  event: EventOptions;
}

export default function portSVG({ prop, attr, event }: PortParameter) {
  prop = Object.assign({}, prop);

  const options = {
    id: prop.name,
    creator: (options: any) => new PortPlot(options),
    tag: 'svg',
    prop,
    attr: Object.assign(
      {
        class: 'port_container',
        x: (d: PropOptions) => {
          const xAxis = scaleLinear()
            .domain([0, d.total + 1])
            .range([
              configuration.common.margin,
              d.width + configuration.common.margin,
            ]);
          return xAxis(d.cursor + 1) - configuration.port.content.width / 2;
        },
        y: (d: PropOptions) => {
          const yAxis = scaleLinear()
            .domain([0, 1])
            .range([0, d.height - configuration.common.margin]);
          return d.direction.match('input')
            ? yAxis(0) - configuration.port.content.height / 2
            : yAxis(1) + configuration.port.content.height / 2;
        },
      },
      attr
    ),
    event: {
      mouseover: (eve: any, tag: PlotCommon) => {
        event?.overPort && event?.overPort(eve, tag);
      },
      mouseout: (eve: any, tag: PlotCommon) => {
        event?.outPort && event?.outPort(eve, tag);
      },
      click: (eve: any, plot: PlotCommon) => {
        eve.stopPropagation()
        event?.connect && event?.connect(eve, plot);
      },
    },
    children: [
      {
        id: 'port_rect',
        tag: 'rect',
        prop,
        attr: Object.assign(
          {
            class: 'port_rect',
            fill: (d: PropOptions) => {
              return (configuration.port.style as any)[
                `${d.disable ? 'Disable' : capitalize(d.type.match(/data/i) ? 'data' : 'model')}${
                  d.disable && d.status === 'Unrun' ? '_Unrun' : ''
                }_Port`
              ];
            },
          },
          configuration.port.content
        ),
      },
      {
        id: 'port_multiple',
        tag: 'g',
        prop,
        attr: {
          class: 'port_multiply',
          display: (d: PropOptions) => (d.multiply ? 'normal' : 'none'),
        },
        children: (() => {
          const circles: any[] = [];
          for (let i = 1; i < 4; i++) {
            circles.push({
              id: `port_multiple_item`,
              tag: 'rect',
              prop: {},
              attr: Object.assign(
                {
                  x: () => {
                    const xAxis = scaleLinear()
                      .domain([0, 4])
                      .range([0, configuration.port.content.width])
                      .nice();
                    return xAxis(i) - configuration.port.multiply.width / 2;
                  },
                  y: () => {
                    const yAxis = scaleLinear()
                      .domain([0, 2])
                      .range([0, configuration.port.content.height])
                      .nice();
                    return yAxis(1) - configuration.port.multiply.height / 2;
                  },
                  fill: (d: PropOptions) =>
                    d.type.match(/data/i) ? '#b70' : '#0081a2',
                },
                configuration.port.multiply
              ),
            });
          }
          return circles;
        })(),
      },
    ],
  };

  return options;
}
