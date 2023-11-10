import { scaleLinear } from 'd3';
import configuration from './configuration';
import { SVGs } from '../svg';
import { PlotCommon } from '../Plot';

interface PropOptions {
  height: number;
  lock: boolean;
}

interface PrefixParameter {
  prop: PropOptions;
  attr: object;
}

export default function prefix({ prop, attr }: PrefixParameter) {
  prop = Object.assign({}, prop);

  const options = {
    id: 'prefix',
    tag: 'svg',
    prop,
    attr: Object.assign(
      {
        height: (d: PropOptions) => d.height,
        opacity: 1,
        overflow: 'visible',
      },
      attr,
      configuration.icon.size
    ),
    event: {
      lock: (event: any, tag: PlotCommon) => {
        const lock = event.detail;
        tag.setAttr('opacity', 0, 100, () => {
          tag.setProp('lock', lock);
          tag.setAttr('opacity', 1, 100);
        });
      },
    },
    children: [
      {
        id: 'lock',
        tag: SVGs().lock,
        prop,
        attr: {
          display: (d: PropOptions) => (d.lock ? 'normal' : 'none'),
          y: (d: PropOptions) => {
            const yAxis = scaleLinear()
              .domain([0, 2])
              .range([0, d.height + configuration.common.margin * 2]);
            return yAxis(1) - configuration.icon.size.height / 2;
          },
        },
      },
    ],
  };
  return options;
}
