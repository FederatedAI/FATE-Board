import FLineOrBar from './LineOrBar.vue';

const install = (app: any) => {
  app.component('FLOBChart', FLineOrBar);
}

export default install
