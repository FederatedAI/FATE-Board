import Stack from '../utils/Stack';
import Configuration from '../configuration';

/**
 * 可操作历史列表项
 */
interface HistoryRecord {
  type: string; // 操作类型  [set | get | del | release]
  snapshot: object;
}

export default class HistoryList extends Stack<HistoryRecord> {
  max: number;

  constructor(max = Configuration.StackMax) {
    super();
    this.max = max;
  }

  /**
   * 历史项入栈
   * @param content 历史项
   */
  pushStack(content: HistoryRecord): void {
    // 删除超前历史项(因为历史项数据变化了)
    if (this.cursor !== this.memory.length - 1) {
      this.memory.splice(this.cursor + 1);
    }
    if (this.memory.length === this.max) {
      this.memory.shift();
    }
    super.pushStack(content);
  }

  /**
   * 历史项出栈
   * @returns 历史项
   */
  popStack() {
    return super.popStack();
  }

  /**
   * 历史回退
   * @param steps 步数
   * @returns 回退项
   */
  backword(steps = 1) {
    // 定位取值范围
    let limitation = this.cursor - steps;
    if (limitation < 0) limitation = 0;
    // 游标定位
    this.cursor = limitation;
    // 快照记录
    return this.memory[this.cursor];
  }

  /**
   * 数据重绘
   * @param steps 重绘步数
   * @returns 数据快照
   */
  forword(steps = 1) {
    // 取值范围
    let limitation = this.cursor - steps;
    if (limitation >= this.memory.length) limitation = this.memory.length - 1;
    // 游标定位
    this.cursor = limitation;
    return this.memory[this.cursor];
  }
}
