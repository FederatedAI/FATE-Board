/* eslint-disable @typescript-eslint/no-explicit-any */
import { isString, merge } from 'lodash';
import { defineComponent, h, reactive } from 'vue';
import ASTNode from './AST/node';

export default class ASTNodeVue<P extends object> extends ASTNode<P> {
  protected VueCache?: any;
  protected StateSet?: any;

  set(keyOrObj: string | object, value?: unknown) {
    super.set(keyOrObj, value);
    if (this.StateSet) {
      merge(this.StateSet, this.prop.content);
    }
  }

  del(keyOrObj: string) {
    super.del(keyOrObj);
    if (this.StateSet) {
      merge(this.StateSet, this.prop.content);
    }
  }

  setEvent(keyOrObj: string | object, value?: unknown): void {
    super.setEvent(keyOrObj, value);
    if (this.StateSet) {
      merge(this.StateSet, { event: this.event.content });
    }
  }

  delEvent(keyword: string): void {
    super.delEvent(keyword);
    if (this.StateSet) {
      merge(this.StateSet, { event: this.event.content });
    }
  }

  toVue(translateTag?: any) {
    if (this.VueCache) return this.VueCache;

    this.VueCache = undefined;
    const VueTag = translateTag ? translateTag(this.tag) : this.tag;

    const props = this.prop.content;
    const event = this.event.content;

    const children: any[] = [];
    this.children.forEach((node) => {
      if (isString(node)) {
        children.push(node)
      } else {
        children.push(h((node as ASTNodeVue<object>).toVue(translateTag)));
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that: any = this;
    this.VueCache = defineComponent({
      setup() {
        const state = reactive(Object.assign({}, event, props));
        that.StateSet = state;
        return () => h(VueTag, state, children);
      },
    });
    return this.VueCache;
  }
}
