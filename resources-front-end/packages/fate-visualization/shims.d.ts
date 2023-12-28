/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module 'd3';
declare module 'encryptlong';
declare module 'file-saver';
declare module 'lodash-es';
