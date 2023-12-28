import { FRow } from 'fate-ui-component';

let TextTotal = 0;
export default function toText(content: any, label?: any) {
  return {
    id: `LRModelText${TextTotal++}`,
    tag: FRow,
    prop: {
      class: 'f-d-text',
      content,
      label,
      labelClassName: 'f-d-text-label',
      contentClassName: 'f-d-text-content'
    },
  };
}
