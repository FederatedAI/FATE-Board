import { debounce } from 'lodash';

const WindowAdapter = () => {
  const _ResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback: any) {
      super(debounce(callback, 50));
    }
  };
};

WindowAdapter()