import fixed from "../tools/fixed";
import getModelData from "../tools/getModelData";
import toGroup from "../tools/toGroup";
import toTable from "../tools/toTable";

export default function statistics (
  modelData: object,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const output_data = getModelData(modelData)
  const { data } = output_data.output_model
  const { inner_metric_names, metrics_summary } = data

  const theader: any = [{
    label: 'variable',
    prop: 'variable'
  }, ...inner_metric_names.map((metric: string) => {
    return {
      label: metric,
      prop: metric
    }
  })]
  const tdata: any = []

  for (const key in metrics_summary) {
    const row: any = { variable: key }
    for (const label in metrics_summary[key]) {
      row[label] = fixed(metrics_summary[key][label])
    }
    tdata.push(row)
  }

  const group = toGroup()
  group.children.push(toTable(
    theader,
    tdata
  ))
  return group
}