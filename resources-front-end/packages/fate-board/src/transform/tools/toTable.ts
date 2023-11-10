import { FTable } from 'fate-ui-component';

let tableTotal = 0;
export default function toTable(header: any, data: any) {
  return {
    id: `LRModelTable${tableTotal++}`,
    tag: FTable,
    prop: {
      class: 'f-d-table',
      maxHeight: '400px',
      header,
      data,
    },
  };
}
