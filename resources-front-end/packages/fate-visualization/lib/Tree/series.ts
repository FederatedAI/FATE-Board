import configuration from "@/configuration"
import { merge } from "lodash"

export default function TreeSeries (data: any) {
  return merge({
    series: {
      type: 'tree',
      data: [data].flat(Infinity),
      initialTreeDepth: -1,
      roam: true,
      left: '5%',
      right: '5%',
      top: '12%',
      bottom: '12%',

      symbol: 'emptyCircle',
      symbolSize: 100,
      orient: 'vertical',
      expandAndCollapse: true,
      label: {
        borderWidth: 2,
        rotate: 0,
        verticalAlign: 'middle',
        align: 'center',
        fontSize: 10,
        lineHeight: 12
      }
    }
  }, configuration)
}