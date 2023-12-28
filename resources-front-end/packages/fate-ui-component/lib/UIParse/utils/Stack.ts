import { isFunction } from 'lodash';

/**
 * 数据栈结构
 */
export default class Stack<C> {
  cursor = -1;
  memory: C[] = [];

  /**
   * 判断当前数组是否超栈
   * @returns 超栈判定
   */
  protected overflow(): C[] | undefined {
    // 游标不在最上层位置
    if (this.cursor < this.memory.length - 1) {
      return this.memory.splice(this.cursor + 1);
    }
    return undefined;
  }

  /**
   * 游标移动到顶端
   */
  protected toTop(): void {
    this.cursor = this.memory.length - 1;
  }

  /**
   * 入栈
   * @param content 存储内容
   */
  pushStack(content: C): void {
    // 删除超出部分的内容
    this.overflow();
    this.memory.push(content);
    this.toTop();
  }

  /**
   * 数据出栈
   */
  popStack(): C | undefined {
    const toPop = this.memory.pop();
    this.toTop();
    return toPop;
  }

  /**
   * 当前游标指向除外的存储量大小获取
   * @returns 存储大小
   */
  size() {
    return this.memory.length;
  }

  /**
   * 获取当前数据
   * @returns 当前数据
   */
  current(): C | undefined {
    return this.memory[this.cursor];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  find(predicate: any) {
    return this.memory.find(predicate);
  }

  /**
   * 数据是否入栈
   * @param forCheck 判定方法或者对象本身
   * @returns 判定结果
   */
  has(forCheck: C | ((content: C) => boolean)) {
    return (
      this.memory.findIndex((value: C) =>
        isFunction(forCheck) ? forCheck(value) : forCheck === value
      ) >= 0
    );
  }

  release() {
    this.memory.length = 0;
    this.cursor = -1;
  }
}
