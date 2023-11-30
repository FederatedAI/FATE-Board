import { create } from 'd3';
import { isBoolean, isFunction, isString, isUndefined, throttle } from 'lodash';

type TagCreator = (d: object) => string | Selection;
type TextCreator = (d: object) => string;

interface TagParameter<
  P extends object,
  A extends object,
  S extends object,
  E extends object,
> {
  id: string;
  tag: string | Selection | TagCreator; // string 或者文件信息
  append?: boolean;
  prop?: P;
  attr?: A;
  style?: S;
  event?: E;
  text?: string | TextCreator;

  parent?: Plot<object, object, object, object> | Selection;
  children?: TagParameter<object, object, object, object>[];
}

export type PlotCommon = Plot<any, any, any, any>;

export type EventCallback = (event: any, tag: PlotCommon) => void;

let PlotUUID = 0;
export default class Plot<
  P extends object,
  A extends object,
  S extends object,
  E extends object,
> {
  id = `Plot_${PlotUUID++}`;
  tag: string | Selection | TagCreator | undefined = undefined;
  prop: P;
  attr: A;
  style: S;
  event: E = <E>{};
  text?: string | TextCreator;
  append: boolean;

  parent?: Plot<object, object, object, object> | Selection;
  children: Map<string, Plot<object, object, object, object>> = new Map();

  dom: any;

  protected updateOperation = <any>[]
  protected updating = (
    operation: (selection: any) => unknown,
    duration = 400,
    end?: (event: any) => void,
    interrupt?: (event: any) => void
  ) => {
    this.updateOperation.push({
      operation, duration, end, interrupt
    })
    this.updateThrottle()
  }
  protected updateThrottle = throttle(
    () => {
      for (const each of this.updateOperation) {
        const { operation, duration, end, interrupt } = each
        const selection = this.dom.transition().duration(duration);
        operation(selection);
        end && selection.on('end', end);
        interrupt && selection.on('interrupt', interrupt);
      }
      this.updateOperation.length = 0
    },
    200
  );

  constructor({
    id,
    tag,
    prop,
    attr,
    style,
    event,
    text,
    append,
    parent,
    children,
  }: TagParameter<P, A, S, E>) {
    this.id = id || this.id;
    this.tag = tag;
    this.append = isBoolean(append) ? append : true;
    this.prop = prop || <P>{};
    this.attr = attr || <A>{};
    this.style = style || <S>{};
    this.text = text;

    if (parent instanceof Plot) {
      this.setParent(<PlotCommon>parent);
    } else {
      this.parent = parent;
      this.propRender();
    }
    this.setChildren(<any>children || []);
    this.setEvents(event || <E>{});
  }

  setTag(
    tag: string | Selection | TagCreator,
    duration: number | undefined = undefined,
    end?: (event: any, plot: PlotCommon) => void,
    interrupt?: (event: any, plot: PlotCommon) => void
  ) {
    if (this.tag !== tag) {
      this.tag = tag;
      this.tagRender();
      this.txRender();
      if (!isUndefined(duration)) {
        this.updating(
          (selection: any) => this.propRender(selection),
          duration,
          end ? (eve: any) => end(eve, this) : undefined,
          interrupt ? (eve: any) => interrupt(eve, this) : undefined
        );
      }
    }
  }

  protected tagRender() {
    const domCreator = () => {
      let tag: any = this.tag;
      if (isFunction(tag)) {
        tag = tag(this.prop);
      }
      return isString(tag) ? tag : () => tag.cloneNode(true);
    };
    try {
      if (this.parent && this.parent instanceof Plot) {
        this.dom = this.append
          ? this.parent?.dom.append(domCreator())
          : this.parent?.dom.insert(domCreator(), 'svg');
      } else if (this.parent) {
        this.dom = this.append
          ? (this.parent as any).append(domCreator())
          : (this.parent as any).insert(domCreator(), 'svg');
      } else if (isString(this.tag)) {
        this.dom = create(this.tag);
      } else {
        this.dom = create('svg');
      }
      this.dom.datum(this.prop);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error(err);
      }
      throw err;
    }
  }

  setProp(
    key: string,
    value: unknown,
    duration: number | undefined = undefined,
    end?: (event: any, plot: PlotCommon) => void,
    interrupt?: (event: any, plot: PlotCommon) => void
  ) {
    const operation = (seletion: any) => {
      const update = { [key]: value };
      Object.assign(this.prop, update);
      for (const [, child] of this.children) {
        child.setProp(key, value);
      }
      this.propRender(seletion);
    };
    if (!isUndefined(duration)) {
      this.updating(
        operation,
        duration,
        end ? (eve: any) => end(eve, this) : undefined,
        interrupt ? (eve: any) => interrupt(eve, this) : undefined
      );
    } else {
      operation(this.dom);
    }
  }

  setProps(
    update: object,
    duration: number | undefined = undefined,
    end?: (event: any, plot: PlotCommon) => void,
    interrupt?: (event: any, plot: PlotCommon) => void
  ) {
    const operation = (selection: any) => {
      Object.assign(this.prop, update);
      for (const [, child] of this.children) {
        child.setProps(update);
      }
      this.propRender(selection);
    };
    if (!isUndefined(duration)) {
      this.updating(
        operation,
        duration,
        end ? (eve: any) => end(eve, this) : undefined,
        interrupt ? (eve: any) => interrupt(eve, this) : undefined
      );
    } else {
      operation(this.dom);
    }
  }

  protected propRender(selection?: any) {
    try {
      let newDom = false;
      if (isFunction(this.tag) || !this.dom) {
        if (this.dom) this.remove();
        this.tagRender();
        newDom = true;
      }
      selection = newDom ? this.dom : selection || this.dom;
      this.attrRender(selection, this.attr);
      this.styleRender(selection, this.style);
      if (isFunction(this.text) || newDom) {
        this.txRender();
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error: Prop Render');
      }
    }
  }

  setAttr(
    key: string,
    value: unknown,
    duration: number | undefined = undefined,
    end?: (event: any, plot: PlotCommon) => void,
    interrupt?: (event: any, plot: PlotCommon) => void
  ) {
    const operation = (selection: any) => {
      const update = { [key]: value };
      Object.assign(this.attr, update);
      this.attrRender(selection, update);
    };
    if (!isUndefined(duration)) {
      this.updating(
        operation,
        duration,
        end ? (eve: any) => end(eve, this) : undefined,
        interrupt ? (eve: any) => interrupt(eve, this) : undefined
      );
    } else {
      operation(this.dom);
    }
  }

  setAttrs(
    update: object,
    duration: number | undefined = undefined,
    end?: (event: any, plot: PlotCommon) => void,
    interrupt?: (event: any, plot: PlotCommon) => void
  ) {
    const operation = (selection: any) => {
      Object.assign(this.attr, update);
      this.attrRender(selection, update);
    };
    if (!isUndefined(duration)) {
      this.updating(
        operation,
        duration,
        end ? (eve: any) => end(eve, this) : undefined,
        interrupt ? (eve: any) => interrupt(eve, this) : undefined
      );
    } else {
      operation(this.dom);
    }
  }

  protected attrRender(selection: any, attr: object) {
    for (const key in attr) {
      const value = (attr as any)[key];
      selection.attr(key, value);
    }
  }

  setStyle(
    key: string,
    value: unknown,
    duration: number | undefined = undefined,
    end?: (event: any, plot: PlotCommon) => void,
    interrupt?: (event: any, plot: PlotCommon) => void
  ) {
    const operation = (selection: any) => {
      const update = { [key]: value };
      Object.assign(this.style, update);
      this.styleRender(selection, update);
    };
    if (!isUndefined(duration)) {
      this.updating(
        operation,
        duration,
        end ? (eve: any) => end(eve, this) : undefined,
        interrupt ? (eve: any) => interrupt(eve, this) : undefined
      );
    } else {
      operation(this.dom);
    }
  }

  setStyles(
    update: object,
    duration: number | undefined = undefined,
    end?: (event: any, plot: PlotCommon) => void,
    interrupt?: (event: any, plot: PlotCommon) => void
  ) {
    const operation = (selection: any) => {
      Object.assign(this.style, update);
      this.styleRender(selection, update);
    };
    if (!isUndefined(duration)) {
      this.updating(
        operation,
        duration,
        end ? (eve: any) => end(eve, this) : undefined,
        interrupt ? (eve: any) => interrupt(eve, this) : undefined
      );
    } else {
      operation(this.dom);
    }
  }

  protected styleRender(selection: any, styles: object) {
    for (const key in styles) {
      const value = (styles as any)[key];
      selection.style(key, value);
    }
  }

  setText(text: string | TextCreator) {
    this.text = text;
    this.txRender();
  }

  protected txRender() {
    if (!isUndefined(this.text)) {
      let tx = this.text;
      if (isFunction(this.text)) {
        tx = this.text(this.prop);
      }
      this.dom.text(tx);
    }
  }

  setEvent(trigger: string, event: EventCallback) {
    (this.event as any)[trigger] = event;
    this.dom.on(trigger, (eve: any) => event(eve, this));
  }

  setEvents(triggers: object) {
    for (const key in triggers) {
      this.setEvent(key, (triggers as any)[key]);
    }
  }

  dispatch(trigger: string, detail?: any, end?: EventCallback) {
    if ((this.event as any)[trigger]) {
      const dispatchInstance = this.dom.dispatch(trigger, {
        detail,
        cancelable: true,
        bubbles: true,
      });
      if (end)
        dispatchInstance.on(`${trigger}.end`, (eve: any) => end(eve, this));
    }
  }

  dispatchDeep(trigger: string, detail?: any, end?: EventCallback) {
    for (const [, child] of this.children) {
      child.dispatchDeep(trigger, detail);
    }
    this.dispatch(trigger, detail, end);
  }

  protected eventRender(event: object) {
    for (const name in event) {
      this.setEvent(name, (event as any)[name]);
    }
  }

  remove() {
    if (this.dom) {
      this.dom.remove();
      for (const [, child] of this.children) {
        child.remove();
      }
      this.dom = undefined;
    }
  }

  setParent(parent?: PlotCommon) {
    if (this.parent) {
      if (
        this.parent === parent ||
        ((this.parent as any).id &&
          parent?.id &&
          (this.parent as any).id === parent?.id)
      )
        return void 0;
      if (this.parent instanceof Plot) {
        (this.parent as any).removeChild(this);
      } else {
        this.dom.remove();
      }
      this.parent = undefined;
    }
    this.remove();
    if (parent) {
      this.parent = parent;
      this.propRender();
      parent.setChild(this);
    }
  }

  setChild(child: TagParameter<any, any, any, any> | PlotCommon) {
    if (child.id && !this.children.has(child.id)) {
      let newChild: any = child;
      if (child instanceof Plot) {
        child.setParent(this);
      } else {
        newChild = new Plot(Object.assign({ parent: this }, child));
      }
      this.children.set(newChild.id, newChild);
    }
  }

  setChildren(children: Array<TagParameter<any, any, any, any> | PlotCommon>) {
    for (const child of children) {
      this.setChild(child);
    }
  }

  removeChild(key: string | PlotCommon) {
    const uuid = isString(key) ? key : key.id;
    this.children.delete(uuid);
  }

  find(id: string | ((comp: any) => boolean)) {
    if (
      (isString(id) &&
      (this.id.match(new RegExp(id, 'i')) ||
      id.match(new RegExp(this.id, 'i')))) ||
      (isFunction(id) && 
      id(this.prop)) 
    ) {
      return this;
    } else {
      for (const [, plot] of this.children) {
        const instance: any = plot.find(id);
        if (instance) {
          return instance;
        }
      }
      return undefined;
    }
  }

  findAll(id: string  | ((comp: any) => boolean)) {
    const nodes: any[] = []
    if (
      (isString(id) &&
      (this.id.match(new RegExp(id, 'i')) ||
      id.match(new RegExp(this.id, 'i')))) ||
      (isFunction(id) && 
      id(this.prop)) 
    ) {
      nodes.push(this);
    }
    if (this.children) {
      for (const [, plot] of this.children) {
        const instance: any = plot.findAll(id);
        if (instance) {
          nodes.push(instance)
        }
      }
    }
    return nodes.flat(Infinity)
  }

  root(): any {
    if (this.parent) {
      return this.parent instanceof Plot ? this.parent.root() : this.parent;
    } else {
      return this;
    }
  }

  rootPlot(): PlotCommon {
    if (this.parent instanceof Plot) {
      return this.parent.rootPlot();
    } else {
      return this;
    }
  }

  release() {
    this.setParent();
    this.remove();
    this.tag = <any>undefined;
    this.prop = <any>undefined;
    this.attr = <any>undefined;
    this.style = <any>undefined;
    this.event = <any>undefined;
    this.text = <any>undefined;
  }
}
