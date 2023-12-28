import measureText from '@/utils/measureText';
import parse from '../parse';
import { EventCallback, PlotCommon } from '../Plot';
import configuration from './configuration';
import mainBody from './mainBody';
import prefix from './prefix';
import suffix from './suffix';

export interface PortInfo {
  name: string;
  type: string;
  tooltip: string;
  multiply: boolean;
  direction: string;
}

interface PropOptions {
  name: string;
  type: string;

  x: number;
  y: number;

  width: number;
  height: number;
  txWidth: number;

  status: string;
  disable: boolean;
  stage: string;
  lock: boolean;
  relativeChoose: boolean;
  choose: boolean;
  duration?: number;

  input: PortInfo[];
  output: PortInfo[];
}

interface EventOptions {
  retry: EventCallback;
  choose: EventCallback;
  unchoose: EventCallback;
  overPort: EventCallback;
}

interface MainBodyParameter {
  prop: PropOptions;
  attr: object;
  event: EventOptions;
}

export default function component(
  { prop, attr, event }: MainBodyParameter,
  parent: PlotCommon | undefined | unknown
) {
  prop = Object.assign(
    (() => {
      if (!prop.txWidth || !prop.width || !prop.height) {
        const CCB = configuration.body;
        const txWidth = Number(
          measureText(
            prop.name,
            configuration.common.fontSize,
            configuration.common.fontFamily
          ) || 260
        );
        const width = Math.max(
          Number(
            (txWidth + CCB.size.leftPadding + CCB.size.rightPadding).toFixed(2)
          ),
          CCB.size.minWidth
        );
        const height = Number(
          (
            configuration.common.fontSize +
            CCB.size.topPadding +
            CCB.size.bottomPadding
          ).toFixed(2)
        );
        return {
          width,
          height,
          txWidth,
        };
      } else {
        return {};
      }
    })(),
    {
      relativeChoose: false,
      choose: false,
      status: 'unrun',
      lock: false,
      duration: 0,
      disable: false,
    },
    prop
  );

  const options: any = {
    id: prop.name,
    tag: 'svg',
    prop: prop,
    attr: Object.assign(
      {
        class: 'component_container',
        overflow: 'visible',
        x: (d: PropOptions) => {
          const CC = configuration.common;
          return (
            d.x - d.width / 2 - CC.margin * 2 - configuration.icon.size.width
          );
        },
        y: (d: PropOptions) => {
          const CC = configuration.common;
          return (
            d.y - d.height / 2 - CC.margin - configuration.icon.size.height
          );
        },
      },
      attr
    ),
    style: {
      zIndex: 2,
    },
    children: [
      prefix({
        prop,
        attr: {
          y: configuration.common.margin,
        },
      }),
      mainBody({
        prop,
        attr: {
          x: configuration.icon.size.width + configuration.common.margin * 2,
          y: configuration.common.margin,
        },
        event: <any>event,
      }),
      suffix({
        prop,
        attr: {
          x: (d: PropOptions) =>
            d.width +
            configuration.common.margin * 7 +
            configuration.icon.size.width,
          y: configuration.common.margin,
        },
        event,
      }),
    ],
  };

  const tag = parse(options, parent);
  if (prop.status.match(/running/i)) {
    tag.dispatchDeep('running');
  }

  return tag;
}
