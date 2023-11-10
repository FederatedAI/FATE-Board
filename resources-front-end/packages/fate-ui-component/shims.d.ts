/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module '@element-plus/icon';
declare module 'encryptlong';
declare module 'file-saver';
declare module 'lodash-es';
