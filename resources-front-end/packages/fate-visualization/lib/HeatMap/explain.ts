import configuration from "@/configuration";
import { merge } from "lodash";
import axis from "./axis";
import dataZoom from "./dataZoom";
import tooltip from "./tooltip";
import visualMap from "./visualMap";

interface Parameters {
  x: any[],
  y: any[],
  data: any[][],
  min: number,
  max: number
}

export default function explain (parameters: Parameters, ext?: object) {
  const { data } = parameters

  const config = merge({}, tooltip(), dataZoom(), axis(parameters), visualMap(parameters), {
    grid: {
      right: 100,

      top: '10%',
      bottom: '14%',
    },
    series: {
      type: 'heatmap',
      data,
      label: {
        show: false,
        fontSize: 10,
        overflow: 'truncate'
      }
    }
  }, configuration, ext || {})

  return config
}