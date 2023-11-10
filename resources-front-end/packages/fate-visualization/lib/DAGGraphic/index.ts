import FDag from './DAG.vue';

const install = (app: any) => {
  app.component('FDag', FDag);
};

export default install