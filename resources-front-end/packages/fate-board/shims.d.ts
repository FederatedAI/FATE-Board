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

declare module 'vuex';
declare module 'vue-router';
declare module '@element-plus/icon';
declare module 'encryptlong';
declare module 'file-saver';
declare module 'lodash-es';
declare module 'fate-tools';
declare module 'fate-ui-component';
declare module 'fate-visualization';

