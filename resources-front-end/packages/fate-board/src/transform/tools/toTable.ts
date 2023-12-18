import { FTable } from 'fate-ui-component';

let tableTotal = 0;
export default function toTable(header: any, data: any, ext?: any) {
  return {
    id: `LRModelTable${tableTotal++}`,
    tag: FTable,
    prop: Object.assign({
      class: 'f-d-table',
      maxHeight: '450px',
      header,
      data,
      size: 10,
      total: true
    }, ext || {}),
  };
}

export function toColumn (
  label: string,
  prop: string,
  ext?: any
) {
  return Object.assign({
    label, prop
  }, ext || {})
}