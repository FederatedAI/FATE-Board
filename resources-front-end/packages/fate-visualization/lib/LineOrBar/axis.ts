import { isUndefined } from 'lodash';

interface PropOptions {
  data?: Array<keyof any>;

  name?: string; // 单位
  type?: string;

  min?: number;
  max?: number;
}

const configuration = {
  max_item_in_line: 12,
  max_string_in_line: 10,
};

export default function toAxis(props: PropOptions[] | PropOptions) {
  const toOption = (prop: PropOptions) => {
    return Object.assign(
      {
        type:
          prop.type ||
          !isUndefined(prop.min) ||
          !isUndefined(prop.max) ||
          isUndefined(prop.data)
            ? 'value'
            : 'category',
        axisTick: {
          alignWithLabel: true,
        },
        axisLine: {
          show: true,
          onZero: true
        },
        axisLabel: {
          rotate:
            prop.data && prop.data.length > configuration.max_item_in_line
              ? 45
              : 0,
        },
        minInterval: 0.1,
        nameLocation: 'end',
        nameGap: '10',
        nameRotate:
          prop.name && prop.name.length > configuration.max_string_in_line
            ? 45
            : 0,
      },
      prop
    );
  };

  const result: object[] = [];
  for (const prop of [props].flat(Infinity)) {
    result.push(toOption(<PropOptions>prop));
  }
  return result;
}
