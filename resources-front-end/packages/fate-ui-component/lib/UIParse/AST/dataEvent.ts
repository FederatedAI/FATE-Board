/* eslint-disable @typescript-eslint/no-explicit-any */
import { isString } from 'lodash';
import Data from './data';
import ASTNode from './node';

export default class DataEvent extends Data<object> {
  context?: ASTNode<any>;

  constructor(defaultValue: object, context: ASTNode<any>) {
    super(defaultValue, false, false);
    this.context = context;
  }

  set(
    keyword: string,
    value: unknown,
    norecord?: boolean | undefined,
    unobser?: boolean | undefined
  ): void;
  set(
    keyword: object,
    value?: undefined,
    norecord?: boolean | undefined,
    unobser?: boolean | undefined
  ): void;
  set(
    keyword: string | object,
    value?: unknown,
    norecord?: boolean,
    unobser?: boolean
  ): void {
    if (isString(keyword)) {
      const origin = value;
      // 事件绑定回调
      value = (event: Event) => {
        return (<any>origin)(event, this.context);
      };
    }
    super.set(<any>keyword, value, norecord, unobser);
  }

  release() {
    super.release();
    this.context = undefined;
  }
}
