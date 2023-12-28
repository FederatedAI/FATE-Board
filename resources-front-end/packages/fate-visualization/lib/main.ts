import dagGraphic from './DAGGraphic';
import gauge from './Gauge';
import HeatMap from './HeatMap';
import lineOrBar from './LineOrBar';
import tree from './Tree';

const install = (app: any) => {
  dagGraphic(app);
  lineOrBar(app);
  HeatMap(app);
  tree(app);
  gauge(app)
};

const version = '1.0.0';

export { default as FDag } from './DAGGraphic/DAG.vue';
export { default as FGauge } from './Gauge/Gauge.vue';
export { default as FHeatMap } from './HeatMap/HeatMap.vue';
export { default as FLOBChart } from './LineOrBar/LineOrBar.vue';
export { default as FTree } from './Tree/Tree.vue';
export {
  install,
  version
};

