import './Table.scss';
import Table from './Table.vue';

const TableInstall = (app: any) => {
  app.component('FTable', Table);
};

export default TableInstall