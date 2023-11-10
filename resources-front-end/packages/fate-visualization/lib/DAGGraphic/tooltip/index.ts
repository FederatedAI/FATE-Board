import measureText from '@/utils/measureText';
import parse from '../parse';
import { EventCallback, PlotCommon } from '../Plot';
import configuration from './configuration';
import downPath from './downPath';
import upPath from './upPath';

interface PropOptions {
  content: string;
  x: number;
  y: number;

  max: number;
  width: number;
  height: number;
  offset: number;

  direction?: string; // 'up' | 'down' | 'left' | 'right'
  title?: string;
}

interface EventOptions {
  tooltipOver: EventCallback;
}

interface TooltipParameter {
  prop: PropOptions;
  attr?: object;
  event?: EventOptions;
}

export default function tooltip(
  { prop, event }: TooltipParameter,
  parent: any
) {
  const explain = (prop: any) => {
    prop = Object.assign(
      {
        offset: configuration.offset,
        direction: 'up',
      },
      prop
    );
    const text: any = prop.content;
    const TitleWidth = prop.title
      ? measureText(
          prop.title,
          configuration.titleFontSize,
          configuration.titleFontFamily
        )
      : 0;
    if (prop.max && TitleWidth > prop.max) {
      prop.max = TitleWidth;
    }
    const TextWidth = measureText(
      prop.content,
      configuration.textFontSize,
      configuration.textFontFamily
    );
    if (prop.max && TextWidth < prop.max) {
      const len = Math.floor(
        prop.content * Number((prop.max / TextWidth).toFixed(2))
      );
      const txs: string[] = [];
      let from = 0;
      while (from < text.length) {
        txs.push(text.substr(from, len));
        from += len;
      }
      prop.content = txs;
      prop.width = prop.max + configuration.horz_padding * 2;
    } else {
      prop.content = [prop.content];
      prop.max = TextWidth;
      prop.width = TextWidth + configuration.horz_padding * 2;
    }

    let height = 0;
    if (prop.title) height += configuration.titleFontSize * 1.5 + 5;
    height += prop.content.length * configuration.textFontSize * 1.5 + 2;
    height += configuration.vert_padding * 2;
    prop.height = height;

    if (prop.direction.match(/up/i)) {
      if (height + configuration.margin * 2 + 10 > prop.y) {
        prop.direction = 'down';
      }
    } else if (prop.direction.match(/down/i)) {
      const containerHeight = Number(parent?.attr('height'));
      if (containerHeight - prop.y < height + configuration.margin * 2 + 10) {
        prop.direction = 'up';
      }
    }

    return prop;
  };

  prop = explain(prop);

  const options = {
    id: 'tooltip',
    tag: 'svg',
    prop,
    attr: {
      x: (d: PropOptions) => d.x - d.width / 2 - configuration.margin,
      y: (d: PropOptions) => {
        if (d.direction?.match(/up/i)) {
          return (
            d.y -
            configuration.trangleHeight -
            configuration.margin -
            d.height -
            configuration.offset
          );
        } else if (d.direction?.match(/down/i)) {
          return d.y - configuration.margin + configuration.offset;
        }
      },
    },
    event: {
      mouseout: (_eve: any, plot: PlotCommon) => {
        event?.tooltipOver && event?.tooltipOver(event, plot);
      },
    },
    children: [
      {
        id: 'tooltipContainer',
        tag: 'path',
        prop,
        attr: {
          d: (d: PropOptions) => {
            if (d.direction?.match(/up/i)) {
              return upPath(d);
            } else if (d.direction?.match(/down/i)) {
              return downPath(d);
            } else {
              return '';
            }
          },
          fill: configuration.content_style,
          stroke: configuration.border_style,
          'stroke-width': configuration.lineWidth,
        },
      },
      ...(() => {
        const children: any[] = [];
        const fromx = configuration.horz_padding + configuration.margin;
        let fromy =
          configuration.vert_padding +
          configuration.margin +
          (prop.direction?.match(/down/i) ? configuration.trangleHeight : 0);
        if (prop.title) {
          fromy += configuration.titleFontSize;
          children.push({
            id: 'tooltipTitle',
            tag: 'text',
            attr: {
              x: fromx,
              y: fromy,
              'font-size': configuration.titleFontSize,
              'font-family': configuration.titleFontFamily,
              fill: configuration.text_style,
            },
            text: prop.title,
          });
          fromy += configuration.titleFontSize * 1.5 + 5;
        }
        if (prop.content) {
          fromy += prop.title ? 0 : configuration.textFontSize * 1.2;
          for (const tx of prop.content) {
            children.push({
              tag: 'text',
              attr: {
                x: fromx,
                y: fromy,
                'font-size': configuration.textFontSize,
                'font-family': configuration.textFontFamily,
                fill: configuration.text_style,
              },
              text: tx,
            });
            fromy += configuration.textFontSize * 1.5 + 2;
          }
        }
        return children;
      })(),
    ],
  };

  return parse(options, parent);
}
