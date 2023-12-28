/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction, isString } from 'lodash';

// 默认标识计数
let UUIDTree = 0;

/**
 * 树节点初始化配置参数
 */
export interface TNodeConfiguration {
  id?: string; // 唯一标识
  parentNode?: TNode; // 父节点
  children?: TNode[]; // 子节点
}

/**
 * 树状图节点
 */
export default class TNode {
  static Root: <T extends TNode>(node: T) => T;
  static DepthFirstErgodic: <T extends TNode>(
    tnode: T,
    limitations?: TNodeLimitation,
    reverse?: boolean
  ) => Generator<T, any, unknown>;
  static BreadthFirstErgodic: <T extends TNode>(
    tnode: T,
    limitations?: TNodeLimitation,
    reverse?: boolean
  ) => Generator<T, any, undefined>;
  static Filter: <T extends TNode>(
    scoped: T,
    limitations: TNodeLimitation | string
  ) => T[];
  static FindById: <T extends TNode>(scoped: T, ID: string) => T | undefined;
  static Explain: <C extends TNodeConfigurationForExplain<T>, T extends TNode>(
    configuration: C,
    factory: TNodeFactory<C, T>
  ) => T | undefined;

  id: string;
  level = 0;
  parentNode: TNode | undefined;
  children = new Map<string, TNode | string>(); // TNode ID作为标识

  constructor({ id, parentNode, children }: TNodeConfiguration) {
    this.id = id || `TNode_${UUIDTree++}`;
    parentNode && this.setParentNode(parentNode);
    children && this.addChildren(children);
  }

  /***** 父节点操作 *****/
  /**
   * 设置当前节点的父节点
   * @param parent 带设置父节点 (TNode | undefined)
   * @returns 设置是否成功
   */
  setParentNode(parent?: TNode): boolean {
    // 无父节点或者原父节点与新父节点不同。
    if (parent && this.parentNode && parent.id === this.parentNode.id) {
      return false;
    }

    // 删除原父节点
    if (this.parentNode && parent?.id !== this.parentNode.id) {
      this.parentNode.children.delete(this.id); // 原有父节点删除当前子节点
      this.parentNode = undefined;
    }

    // 设置新父节点
    if (parent) {
      this.parentNode = parent;
      parent.children.set(this.id, this);
    }

    // 改变节点关联后，计算节点层级
    this.setLevel(this.parentNode ? this.parentNode.level + 1 : 0);

    return true;
  }

  /***** 子节点操作 *****/
  /**
   * 删除当前子节点
   * @param child 待删除节点对象或者标识
   * @return 删除的节点实例 或者空数据
   */
  deleteChild(child: TNode | string): TNode | string | undefined {
    const ID = child instanceof TNode ? child.id : child;
    const node = this.children.get(ID);
    if (node) {
      // 删除当前节点
      this.children.delete(ID);
      // 设置原子节点的父节点关联为空
      if (!isString(node)) {
        node.setParentNode();
      }
    }
    return node;
  }

  /**
   * 同时删除多个节点
   * @param children 节点或者标识数组
   * @return 删除的节点实例
   */
  deleteChildren(children: Array<TNode | string>): TNode[] {
    const instanceList: TNode[] = [];
    children.forEach((child: TNode | string) => {
      const node: any = this.deleteChild(child);
      if (node) instanceList.push(node);
    });
    return instanceList;
  }

  /**
   * 添加单个子节点
   * @param child 待添加节点
   * @return 返回当前节点，以便链式操作执行
   */
  addChild(child: TNode | string, index: number): TNode {
    if (isString(child)) {
      this.children.set(`String_${index}`, child)
    } else if (!this.children.has(child.id)) {
      // 添加新子节点
      this.children.set(child.id, child);
      // 子节点设置新父节点
      child.setParentNode(this);
    }
    return this;
  }

  /**
   * 添加多个子节点
   * @param children 待添加子节点对象数组
   * @return 当前节点对象
   */
  addChildren(children: (TNode|string)[]): TNode {
    children.forEach((child: TNode | string, index: number) => {
      this.addChild(child, index);
    });
    return this;
  }

  /***** 层级设置 *****/
  /**
   * 设置当前节点及其所有子节点的层级信息
   * @param 带设置层级
   */
  protected setLevel(level: number) {
    this.level = level;
    this.children.forEach((child: TNode | string) => {
      if (!isString(child)) {
        child.setLevel(level + 1);
      }
    });
  }

  /** 获取当前树节点的根节点 **/
  root(): TNode {
    return TNode.Root(this);
  }

  /** 深度优先遍历 */
  depthFisrtErgodic(limitations?: TNodeLimitation, reverse = false) {
    return TNode.DepthFirstErgodic(this, limitations, reverse);
  }

  /** 广度优先遍历 */
  breadthFirstErgodic(limitations?: TNodeLimitation, reverse = false) {
    return TNode.BreadthFirstErgodic(this, limitations, reverse);
  }

  /** 节点过滤 */
  filter(limitations: TNodeLimitation | string) {
    return TNode.Filter(this, limitations);
  }

  /** 节点查找（通过ID） */
  findById(ID: string) {
    return TNode.FindById(this, ID);
  }

  /** 节点释放 */
  release() {
    this.children.forEach((value) => {
      if (!isString(value)) {
        value.release()
      }
    })
    this.children.clear()
    this.setParentNode()
  }
}

/***** 公用方法 *****/
interface TNodeLimitation {
  (node: string | TNode): boolean;
}

/**
 * 获取某节点的根节点实例
 * @param node 待判定节点
 * @returns 根节点实例
 */
TNode.Root = function Root<T extends TNode>(node: T): T {
  if (node.parentNode) {
    return TNode.Root(<T>node.parentNode);
  } else if (!node.parentNode && node.level !== 0) {
    throw new (Error as any)('LogicError: 当前树节点层级关系与父节点信息冲突。', {
      cause: { source: 'TNode.Root', meta: { node } },
    });
  } else {
    return node;
  }
};

/**
 * 树的深度优先遍历
 * @param tnode 待遍历节点
 * @param reverse 顺序或者倒叙
 */
TNode.DepthFirstErgodic = function* DepthFirstErgodic<T extends TNode>(
  tnode: T,
  limitations?: TNodeLimitation,
  reverse = false
): Generator<T, any, unknown> {
  const shouldBeErgodic = !limitations || limitations(tnode);
  // 倒叙遍历，优先上层节点
  if (reverse && shouldBeErgodic) yield tnode;
  if (tnode.children.size > 0) {
    for (const each of tnode.children) {
      yield* DepthFirstErgodic(<T>each[1], limitations, reverse);
    }
  }
  // 顺序遍历，优先下层节点
  if (!reverse && shouldBeErgodic) yield tnode;
};

/**
 * 广度优先遍历
 * @param tnode 代编里节点
 * @param reverse 顺序或者倒叙
 */
TNode.BreadthFirstErgodic = function* BreadthFirstErgodic<T extends TNode>(
  tnode: T,
  limitations?: TNodeLimitation,
  reverse = false
): Generator<T, any, undefined> {
  const tnodeList: T[] = [tnode];
  const result: T[] = [];

  if (!limitations || limitations(tnode)) result.push(tnode);

  const iterator = (node: T) => {
    if (node.children.size > 0) {
      for (const each of node.children) {
        tnodeList.push(<T>each[1]);
        if (!limitations || limitations(each[1])) result.push(<T>each[1]);
      }
    }
  };
  let cursor = 0;
  while (cursor < tnodeList.length) {
    iterator(tnodeList[cursor]);
    cursor++;
  }
  if (reverse) {
    tnodeList.reverse();
    result.reverse();
  }
  yield* result;
};

/**
 * 查找符合条件的子节点
 * @param scoped 搜查范围根节点
 * @param limitations 查询条件
 * @return TNode | TNode[]
 */
TNode.Filter = function filter<T extends TNode>(
  scoped: T,
  limitations: TNodeLimitation | string
): T[] {
  return <T[]>[
    ...scoped.breadthFirstErgodic(
      isFunction(limitations)
        ? limitations
        : (node: TNode | string) => !isString(node) && node.id === limitations
    ),
  ];
};

/**
 * 通过ID查找树节点
 * @param scoped 搜索范围
 * @param ID 比对ID
 * @returns 节点实例
 */
TNode.FindById = function findById<T extends TNode>(
  scoped: T,
  ID: string
): T | undefined {
  for (const node of scoped.breadthFirstErgodic()) {
    if (node.id === ID) {
      return node;
    }
  }
};

/** 可解析的 树配置数据结构 **/
export interface TNodeConfigurationForExplain<T extends TNode> {
  id?: string;
  children?: (TNodeConfigurationForExplain<T> | T)[];
}

/** 树节点实例解析工厂 */
export interface TNodeFactory<
  C extends TNodeConfigurationForExplain<T>,
  T extends TNode,
> {
  (configuration: C): T;
}

/**
 * 解析配置获取树状图
 * @param configuration 待解析配置
 * @param factory 工厂方法
 * @returns 树图根节点 | undefined
 */
TNode.Explain = function explainTNode<
  C extends TNodeConfigurationForExplain<T>,
  T extends TNode,
>(configuration: C, factory: TNodeFactory<C, T>): T | undefined {
  try {
    const children: T[] = [];
    // 转义子节点
    if (configuration.children && Array.isArray(configuration.children)) {
      for (const child of configuration.children) {
        let childNode;
        if (child instanceof TNode) {
          childNode = child;
        }
        childNode = explainTNode(<C>child, factory);
        if (childNode) children.push(childNode);
      }
    }
    // 工厂方法创建实例对象
    return factory(Object.assign(configuration, { children }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      throw new (Error as any)('ParseError: 配置文件解析错误', {
        cause: { source: 'TNode.Explain', meta: { error } },
      });
    } else {
      return undefined;
    }
  }
};
