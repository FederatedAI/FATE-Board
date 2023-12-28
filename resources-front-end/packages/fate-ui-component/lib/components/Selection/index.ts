import './Selection.scss';
import FSelection from './Selection.vue';
import FSelectionChart from './SelectionChart.vue';

const SelectionInstall = (app: any) => {
  app.component('FSelection', FSelection)
  app.component('FSelectionChart', FSelectionChart)
}

export default SelectionInstall