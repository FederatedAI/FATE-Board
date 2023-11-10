import DataEvent from './AST/dataEvent';
import DataProp from './AST/dataProp';
import ASTNode from './AST/node';
// import DataEventReact from "./toReact/dataEventReact"
// import DataPropReact from "./toReact/dataPropReact"
// import ASTNodeReact from "./toReact/nodeReact"
import DataEventVue from './dataEventVue';
import ASTNodeVue from './nodeVue';

const Configuration = {
  Node: ASTNode,
  Prop: DataProp,
  Event: DataEvent,

  // ReactNode: ASTNodeReact,
  // ReactProp: DataPropReact,
  // ReactEvent: DataEventReact,

  VueNode: ASTNodeVue,
  VueProp: DataProp,
  VueEvent: DataEventVue,

  Basic: '',

  SplitMark: '.',
  StackMax: 20,
};

export default Configuration;
