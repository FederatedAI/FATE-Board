/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction, isNumber, isObject, isString, isUndefined } from 'lodash';
import Configuration from '../configuration';
import Stack from '../utils/Stack';
import toArray from '../utils/toArray';
import HistoryList from './history';
import Observer, { Notification } from './observer';

export default class Data<C extends object> {
  content: C = <C>{};

  protected history?: HistoryList;
  protected observer?: Observer;

  constructor(
    defaultValue?: C,
    history: boolean | number = false, // 是否记录变化 | 可以是number格式设定历史记录最高上限
    observable = false
  ) {
    // 历史记录对象
    if (history !== false) {
      this.history = new HistoryList(isNumber(history) ? history : undefined);
      // 记录初始状态
      this.history.pushStack({
        type: 'origin',
        snapshot: this.getSnapshot(),
      });
    }
    // 对象监测
    if (observable) {
      this.observer = new Observer();
    }
    // 默认数值设置
    defaultValue && this.set(defaultValue);
  }

  protected getSnapshot() {
    return Object.assign({}, this.content);
  }

  /**
   * 数据设置
   * @param keyword 关键字，或者变更数据项
   * @param value 新数值
   * @param norecord 是否不记录变化
   */
  set(
    keyword: string,
    value: unknown,
    norecord?: boolean,
    unobser?: boolean
  ): void;
  set(
    keyword: object,
    value?: undefined,
    norecord?: boolean,
    unobser?: boolean
  ): void;
  set(
    keyword: string | object,
    value?: unknown,
    norecord = false,
    unobser = false
  ): void {
    // 数据更新
    let oldValue;
    if (isString(keyword)) {
      const keys = keyword.trim().split(Configuration.SplitMark);
      let target: any = this.content;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i === keys.length - 1) {
          oldValue = target[key];
          target[key] = value;
        }
        if (isUndefined(target[key])) {
          target[key] = keys[i + 1] && !isNaN(Number(keys[i + 1])) ? [] : {}
        }
        target = target[key];
      }
    } else {
      const stack = new Stack();
      const explain = (origin: any) => {
        for (const key in origin) {
          stack.pushStack(key);
          if (isObject(origin[key]) && !isFunction(origin[key])) {
            explain(origin[key]);
          } else {
            this.set(
              stack.memory.join(Configuration.SplitMark),
              origin[key],
              true
            );
          }
          stack.popStack();
        }
      };
      explain(keyword);
    }

    // 数据记录
    if (!norecord && this.history) {
      this.history.pushStack({
        type: 'set',
        snapshot: this.getSnapshot(),
      });
    }

    // 数据回调
    if (isString(keyword) && !unobser && this.observer) {
      this.observer.notify(keyword, value, oldValue, 'set', this.content);
    }
  }

  /**
   * 获取相关参数
   * @param keyword 关键字
   * @returns 数值
   */
  get(keyword: string) {
    const keys = keyword.trim().split(Configuration.SplitMark);
    let target: any = this.content;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      target = target[key];
      if (!target) break;
    }
    return target;
  }

  /**
   * 关键字删除
   * @param keyword 关键字
   * @returns 删除是否成功
   */
  del(keyword: string, norecord = false, unobser = false) {
    const keys = keyword.trim().split(Configuration.SplitMark);
    // 记录是否有删除操作
    let deleted = false;
    let oldValue;

    // 数据遍历
    let target: any = this.content;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (i === keys.length - 1 && target[key] !== undefined) {
        oldValue = target[key];
        delete target[key];
        deleted = true;
      } else {
        target = target[key];

        // 如果target不是对象，说明数据遍历到底了，没有对接上key值粒度。
        if (!isObject(target) || isFunction(target)) {
          // development: 不存在相关参数
          if (process.env.NODE_ENV) {
            console.error(
              `NoExistError:There has no content imply to ${keyword} - data.del`
            );
          }
          break;
        }
      }
    }

    // 数据删除记录
    if (deleted && !norecord && this.history) {
      this.history.pushStack({
        type: 'delete',
        snapshot: this.getSnapshot(),
      });
    }

    // 数据变更回调
    if (deleted && !unobser && this.observer) {
      this.observer.notify(
        keyword,
        undefined,
        oldValue,
        'delete',
        this.content
      );
    }

    return deleted;
  }

  /**
   * 数据监测添加
   * @param keyword 监测
   * @param notify 回调函数
   */
  watch(keyword: string, notify: Notification): void;
  watch(keyword: string, notify: Notification[]): void;
  watch(keyword: object, notify?: undefined): void;
  watch(
    keyword: string | object,
    notify?: Notification | Notification[]
  ): void {
    if (this.observer) {
      if (isString(keyword)) {
        this.observer.set(keyword, <any>notify);
      } else {
        for (const key in keyword) {
          const value: Notification[] = <Notification[]>(
            toArray((keyword as any)[key])
          );
          this.observer.set(key, <any>value);
        }
      }
    }
  }

  /**
   * 数据监测解绑
   * @param keyword 关键字(支持数组)
   */
  unwatch(keyword: string): void;
  unwatch(keyword: string[]): void;
  unwatch(keyword: string | string[]): void {
    if (this.observer) {
      const willRelease = <string[]>toArray(keyword);
      for (const key of willRelease) {
        this.observer.del(key);
      }
    }
  }

  /**
   * 重绘
   * @param step 步数
   */
  forword(step = 1) {
    if (this.history) {
      const item = this.history.forword(step);
      // 有回调的重新设置当前数值内容
      this.set(item.snapshot, undefined, true, false);
    }
  }

  /**
   * 撤销
   * @param step 步数
   */
  backword(step = 1) {
    if (this.history) {
      const item = this.history.backword(step);
      // 有回调的重新设置当前数值内容
      this.set(item.snapshot, undefined, true, false);
    }
  }

  /**
   * 数据释放
   */
  release() {
    this.history?.release();
    this.observer?.clear();
    this.history = undefined;
    this.observer = undefined;
    this.content = <C>{};
  }
}
