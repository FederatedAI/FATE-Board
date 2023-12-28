import configuration from "@/configuration"
import { merge } from "lodash"

export default function TreeSeries (data: any) {
  return merge({
    series: {
      type: 'tree',
      data: [data].flat(Infinity),
      initialTreeDepth: -1,
      roam: true,
      left: '2%',
      right: '2%',
      top: '7%',
      bottom: '7%',
      symbol: 'rect',
      symbolSize: [95, 55],
      layout: 'center',
      orient: 'vertical',
      lineStyle: {
        color: '#e8e8ef',
        width: 2
      },
      itemStyle: {
        normal: {
          color: 'transparent',
          borderColor: 'transparent'
        }
      },
      expandAndCollapse: false,

      label: {
        position: 'inside',
        color: '#fff',
        distance: 0,
        rotate: 0,
        verticalAlign: 'middle',
        borderRadius: 5,
        align: 'center',
        fontSize: 9,
        borderWidth: 1,
        padding: [3, 1],
        width: 105,
        height: 60,
        lineHeight: 16,
        rich: {}
      },

      leaves: {
        label: {
          position: 'inside',
          color: '#fff',
          distance: 0,
          rotate: 0,
          verticalAlign: 'middle',
          borderRadius: 5,
          fontSize: 9,
          align: 'center',
          borderWidth: 1,
          width: 105,
          height: 60,
          lineHeight: 16,
          rich: {}
        }
      },
    }
  }, configuration)
}