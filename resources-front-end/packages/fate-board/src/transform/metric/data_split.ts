import toGroup from "../tools/toGroup"
import toTable from "../tools/toTable"

export default function dataSplit (
  metrics: any,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const tHeader = <any[]>[{
    label: 'index',
    prop: 'index',
    width: 80
  }]
  const tData = <any[]>[]
  
  for (let i = 0; i < metrics.length; i++) {
    const each = metrics[i]
    const { data } = each
    const row = <any>{
      index: i
    }

    for (const key in data) {
      const value = data[key]
      if (!tHeader.some(item => item.prop === key)) {
        tHeader.push({
          label: key,
          prop: key
        })
      }
      row[key] = value
    }
    tData.push(row)
  }

  tData[tData.length - 1].index = 'total'

  const group = toGroup()
  group.children.push(
    toTable(
      tHeader,
      tData,
    )
  )
  return group
}