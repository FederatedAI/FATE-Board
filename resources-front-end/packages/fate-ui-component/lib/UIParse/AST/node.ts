/* eslint-disable @typescript-eslint/no-explicit-any */
import { capitalize, isString } from 'lodash';
import Configuration from '../configuration';
import Tree from '../utils/Tree';
import { AfterInjectUpdate, BeforeInjectUpdate } from './dataAsync';
import DataEvent from './dataEvent';
import DataProp from './dataProp';
import { ASTNodeConfiguration } from './declare';

let ASTNodeUUID = 0;
export default class ASTNode<P extends object> extends Tree {
  tag: string;
  prop: DataProp<P>;
  event: DataEvent;

  constructor(configuration: ASTNodeConfiguration<P>) {
    super({ id: configuration.id || `ASTNode_${ASTNodeUUID++}` });
    this.tag = configuration.tag;
    this.prop = new (<any>(
      (Configuration as any)[`${capitalize(Configuration.Basic)}Prop`]
    ))(<P>(configuration.prop || {}), this);
    this.event = new (<any>(
      (Configuration as any)[`${capitalize(Configuration.Basic)}Event`]
    ))(configuration.event || {}, this);
  }

  async init() {
    await this.prop.initInject();
    if (this.children.size > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [_key, child] of this.children) {
        if (!isString(child)) {
          await (<ASTNode<object>>child).init();
        }
      }
    }
  }

  set(keyOrObj: string | object, value?: unknown) {
    this.prop.set(<string>keyOrObj, value);
  }

  get(keyword: string) {
    return this.prop.get(keyword);
  }

  del(keyword: string) {
    this.prop.del(keyword);
  }

  setEvent(keyOrObj: string | object, value?: unknown) {
    this.event.set(<string>keyOrObj, value);
  }

  delEvent(keyword: string) {
    this.event.del(keyword);
  }

  dispathEvent(name: string) {
    const event = <any>this.event.get(name);
    return event(this);
  }

  before(cb: BeforeInjectUpdate): void;
  before(cb: BeforeInjectUpdate[]): void;
  before(cb: BeforeInjectUpdate | BeforeInjectUpdate[]): void {
    this.prop.before(<any>cb);
  }
  after(cb: AfterInjectUpdate): void;
  after(cb: AfterInjectUpdate[]): void;
  after(cb: AfterInjectUpdate | AfterInjectUpdate[]): void {
    this.prop.after(<any>cb);
  }
}
