// 更新通知
export interface Notification {
  (
    newValue: unknown,
    oldValue: unknown,
    operationType?: string,
    receiver?: object
  ): unknown;
}

// 观察者模式
export default class Observer {
  connection: Map<string, Notification[]> = new Map();

  set(key: string, notification: Notification): void;
  set(key: string, notification: Notification[]): void;
  set(key: string, notification: Notification | Notification[]): void {
    const list: Notification[] = this.connection.get(key) || [];
    list.push(...([notification].flat(Infinity) as Notification[]));
    this.connection.set(key, list);
  }

  get(key: string) {
    return this.connection.get(key);
  }

  del(key: string) {
    return this.connection.delete(key);
  }

  notify(
    key: string,
    newValue: unknown,
    oldValue: unknown,
    type?: string,
    receiver?: object
  ) {
    const list = this.connection.get(key);
    if (list) {
      for (const callable of list) {
        callable(newValue, oldValue, type, receiver);
      }
    }
  }

  clear() {
    this.connection.clear();
  }
}
