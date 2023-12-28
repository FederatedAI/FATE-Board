
let groupTotal = 0
export default function toGroup () {
  return {
    id: `Group${groupTotal++}`,
    tag: 'section',
    prop: { class: 'f-d-group f-d-margin' },
    children: <any[]>[]
  }
}