import toGroup from "../tools/toGroup"
import loss from './loss'

const needToCount = ['data_split']

export default function metricsExplain (
  metrics: any,
  ...parameters: any[]
) {
  if (metrics && Array.isArray(metrics) && metrics.length > 0) {
    const children: any = []

    const lossData = <any>[]
    const dataType = <any>{}

    for (const metric_data of metrics) {
      try {
        if (metric_data.type && metric_data.type.match(/loss/i)) {
          lossData.push(...metric_data.data)
        } else if (metric_data.type && needToCount.findIndex(each => each === metric_data.type) >= 0) {
          if (!dataType[metric_data.type]) dataType[metric_data.type] = []
          dataType[metric_data.type].push(metric_data)
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

    try {
      for (const key in dataType) {
        const explain = require(`./${key}.ts`)
        const config = explain.default(dataType[key], ...parameters)
        if (config) children.push(config)
      }
    } catch(err) {
      if (process.env.NODE_ENV === 'development') {
        console.log(err)
      }
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