import toGroup from "../tools/toGroup";
import toText from "../tools/toText";

export default function upload (
  metric_data: any,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const { data, groups } = metric_data;

  const group = toGroup()

  const testList = []
  for (const key in data) {
    testList.push(
      toText(
        data[key],
        key
      )
    )
  }
  group.children.push(...testList)
  return group
}