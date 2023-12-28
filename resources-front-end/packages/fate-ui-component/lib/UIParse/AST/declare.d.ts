/**
 * 节点配置信息
 */
export interface DOMEvent {
  (event: unknown, node: ASTNode<any, any>): void;
}

export interface DOMEventImply {
  [name: string]: DOMEvent;
}

export interface ASTNodeConfiguration<P extends object> {
  id: string; // 节点标识
  tag: string; // 组件名称

  prop?: P; // 节点参数

  event?: DOMEventImply; // 事件对象
}

export interface AsyncDataConfiguration {
  request: (...parameter: unknown[]) => unknown;
  parameter?: string[];
}
