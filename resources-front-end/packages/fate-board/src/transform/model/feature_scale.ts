import { isNumber, isObject } from "lodash";
import fixed from "../tools/fixed";
import getModelData from "../tools/getModelData";
import toGroup from "../tools/toGroup";
import toTable from "../tools/toTable";
import toText from "../tools/toText";

export default function feature_scale (
  modelData: object,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const mData= getModelData(modelData)
  const { data, meta } = mData.output_model
  const { method } = meta
  const { scaler_info } = data

  const tableHeader = [{
    label: 'variable',
    prop: 'variable'
  }]
  const tableData = <any>[]
  const { select_col } = scaler_info
  for (const item of select_col) {
    tableData.push({
      variable: item
    })
  }
  for (const key in scaler_info) {
    const value: any = scaler_info[key]
    if (key !== 'select_col' && isObject(value)) {
      tableHeader.push({
        label: key,
        prop: key
      })
      for (const imply in value) {
        const cursor = tableData.findIndex((item: any) => item.variable === imply)
        if (cursor >= 0) {
          tableData[cursor][key] = isNumber((<any>value)[imply]) ? fixed((<any>value)[imply]) : (<any>value)[imply]
        }
      }
    }
  }

  const group = toGroup() 
  group.children.push(toText(method, 'Method'))
  group.children.push(toTable(
    tableHeader,
    tableData,
    {
      index: true
    }
  ))

  return group
}