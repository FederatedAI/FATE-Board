import { FSelection } from "fate-ui-component";

export default function toSelect (
  id: string,
  options: any,
  ext?: object
) {
  return {
    id,
    tag: FSelection,
    prop: Object.assign({
      options,
      name: id,
      class: 'f-d-selection',
      modelValue: options[0].value,
      labelClassName: 'f-d-title'
    }, ext || {}),
    event: {
      change(value: any, ast: any) {
        ast.set('modelValue', value)
      }
    }
  }
}