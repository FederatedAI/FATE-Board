import toGroup from "../tools/toGroup"

export default function metricsExplain (
  metrics: any,
  ...parameters: any[]
) {
  if (metrics && Array.isArray(metrics) && metrics.length > 0) {
    const children: any = []
    for (const metric_data of metrics) {
      try {
        const explain = require(`./${metric_data.name}.ts`)
        const config = explain.default(metric_data, ...parameters)
        if (config) children.push(config)
      } catch(err) {
        if (process.env.NODE_ENV === 'development') {
          console.log(err)
        }
      }
    }
    const group = toGroup()
    group.children = children
    return group
  }
  return undefined
}