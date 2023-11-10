/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction, isObject } from 'lodash';
import Configuration from '../configuration';
import Stack from '../utils/Stack';
import toArray from '../utils/toArray';
import Data from './data';
import ASTNode from './node';

/**
 * 监测参数对象判定
 * @param origin 原对象
 * @returns 判定结果
 */
let Imply: object | undefined;
function isWatcher(origin: unknown) {
  return (
    isObject(origin) &&
    (<any>origin).request &&
    isFunction((<any>origin).request)
  );
}

/**
 * 观测解析
 * @param watcher 监测待定
 */
const SELF = '_self_';
function explainWatcher(origin: object) {
  const imply: any = {};
  const stack = new Stack();
  const toImply = (container: any, key?: string) => {
    imply[stack.memory.join(Configuration.SplitMark) || SELF] = key
      ? container[key]
      : container;
    if (key) {
      container[key] = {};
    } else {
      container = {};
    }
    return container;
  };
  const explain = (obj: any) => {
    if (isWatcher(obj)) {
      obj = toImply(obj);
    } else {
      for (const key in obj) {
        stack.pushStack(key);
        if (isWatcher(obj[key])) {
          obj = toImply(obj, key);
        } else if (isObject(obj[key]) && !isFunction(obj[key])) {
          obj[key] = explain(obj[key]);
        }
        stack.popStack()
      }
    }
    return obj;
  };
  origin = explain(origin);
  Imply = Object.keys(imply).length > 0 ? imply : undefined;
  return origin;
}

// 数据更新前回调
export interface BeforeInjectUpdate {
  (
    node: ASTNode<any>,
    keyword: string,
    newParameter: unknown,
    oldParameter: unknown,
    operation?: string
  ): boolean;
}

// 数据更新后回调
export interface AfterInjectUpdate {
  (node: ASTNode<any>, keyword: string, newValue: unknown): void;
}

/**
 * 异步数据信息
 */
export default class DataAsync<C extends object> extends Data<C> {
  context: ASTNode<C>;
  async?: any;

  beforeInject: Array<BeforeInjectUpdate> = [];
  afterInject: Array<AfterInjectUpdate> = [];

  protected inited = false;

  constructor(
    defaultValue: C,
    context: ASTNode<C>,
    history: boolean | number = false,
    observable = false
  ) {
    super(
      (() => {
        const content = explainWatcher(defaultValue);
        return <C>content;
      })(),
      history,
      observable
    );

    // 上下文设置
    this.context = context;

    // 异步关系对照
    if (Imply && isObject(Imply)) {
      this.async = Imply;
      Imply = undefined;
    }
  }

  /**
   * 作用域内节点查找
   * @param id 标识
   * @returns 节点对象
   */
  protected FindNodeInScoped(id: string) {
    return <ASTNode<C>>this.context.root().findById(id);
  }

  protected GetAsyncData(request: any, parameter: unknown[]) {
    return request(...parameter);
  }

  /**
   * 数据注入初始化
   */
  async initInject() {
    if (!this.inited) {
      this.inited = true;

      if (this.async) {
        for (const imply in this.async) {
          // 数据请求项
          const requestion = this.async[imply];
          const parameter: unknown[] = [];

          // 数据请求更新，如果是更新则进行注入回调
          const setDataByRequest = (isUpdate = false) => {
            const update = (result: any) => {
              if (imply === SELF) {
                // 数据整体对象更新
                this.context.set(result);
              } else {
                // 关键字更新特定数据
                this.context.set(imply, result);
              }
              // 更新回调
              if (isUpdate) {
                for (const callback of this.afterInject) {
                  callback(this.context, imply, result);
                }
              }
            };
            // 数据请求
            const calculate = this.GetAsyncData(requestion.request, parameter);
            // 判定异步还是同步数据
            if (calculate instanceof Promise) {
              calculate.then(update);
            } else {
              update(calculate);
            }
          };

          // 异步请求需要参数信息
          if (requestion.parameter) {
            // 参数信息关联以及
            for (let i = 0; i < requestion.parameter.length; i++) {
              const keys = requestion.parameter[i]
                .trim()
                .split(Configuration.SplitMark);

              const nodeId = keys.shift();
              if (nodeId) {
                // 节点定位
                const node = this.FindNodeInScoped(nodeId);
                if (node) {
                  // 数据注入初始化
                  if (!node.prop.inited) {
                    await node.prop.initInject();
                  }
                  // 获取数据
                  const keyword = keys.join(Configuration.SplitMark);
                  const data = node.prop.get(keyword);

                  // 添加关联关系
                  node.prop.watch(
                    keyword,
                    (newParameter, oldParameter, operationType) => {
                      parameter[i] = newParameter;
                      for (const callback of this.beforeInject) {
                        if (
                          callback(
                            node,
                            keyword,
                            newParameter,
                            oldParameter,
                            operationType
                          ) === false
                        ) {
                          if (process.env.NODE_ENV) {
                            console.log(
                              `InterruptException: 数据更新注入操作种植 - `
                            );
                          }
                          return;
                        }
                      }
                      setDataByRequest(true);
                    }
                  );

                  // 初始化信息结果
                  parameter[i] = data;
                }
              }
            }
          }
          // 首次数据请求
          setDataByRequest();
        }
      }
    }
  }

  before(cb: BeforeInjectUpdate): void;
  before(cb: BeforeInjectUpdate[]): void;
  before(cb: BeforeInjectUpdate | BeforeInjectUpdate[]): void {
    this.beforeInject.push(...(<BeforeInjectUpdate[]>toArray(cb)));
  }

  after(cb: AfterInjectUpdate): void;
  after(cb: AfterInjectUpdate[]): void;
  after(cb: AfterInjectUpdate | AfterInjectUpdate[]): void {
    this.afterInject.push(...(<AfterInjectUpdate[]>toArray(cb)));
  }
}
