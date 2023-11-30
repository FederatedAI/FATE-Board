import toGroup from "../tools/toGroup"
import loss from './loss'

export default function metricsExplain (
  metrics: any,
  ...parameters: any[]
) {
  if (metrics && Array.isArray(metrics) && metrics.length > 0) {
    const children: any = []

    const lossData = <any>[]
    for (const metric_data of metrics) {
      try {
        if (metric_data.type && metric_data.type.match(/loss/i)) {
          lossData.push(...metric_data.data)
        } else {
          const explain = require(`./${metric_data.name}.ts`)
          const config = explain.default(metric_data, ...parameters)
          if (config) children.push(config)
        }
      } catch(err) {
        if (process.env.NODE_ENV === 'development') {
          console.log(err)
        }
      }
    }
    if (lossData.length > 0) {
      const lossChart = loss(lossData)
      children.push(lossChart)
    }
    if (children.length > 0) {
      const group = toGroup()
      group.children = children
      return group
    } else {
      return undefined
    }
  }
  return undefined
}