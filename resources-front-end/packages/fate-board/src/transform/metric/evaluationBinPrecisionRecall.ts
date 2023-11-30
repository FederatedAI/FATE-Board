import fixed from "../tools/fixed"

export default function ExpPR (
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const thresholdMapping = new Map()

  const basicChartConfiguration = {
    xAxis: {
      type: 'value',
      name: 'recall'
    },
    yAxis: {
      type: 'value',
      name: 'precision'
    }
  }

  const series = <any>{}

  const tooltip = (namespace: string) => {
    return {
      tooltip: {
        formatter: (params: any) => {
          const parameters = new Map()
          for (const each of [params].flat(Infinity)) {
            const componentName = each.seriesName
            const parameter = parameters.get(componentName) || {}
            if (!parameter.ths) {
              const threshold = thresholdMapping.get(namespace)
              parameter.ths = fixed(threshold[componentName][each.dataIndex])
            }
            parameter['precision'] = each.data
            parameter['recall'] = ''
            parameters.set(componentName, parameter)
          }
          let display = ''
          parameters.forEach((item, componentName) => {
            if (display) display += '<br />'
            display += `Threshold(${componentName}): ${item.ths} <br />
              Precision(${componentName}): ${item.precision}<br />
              Recall(${componentName}): ${item.recall}`
          })
          return display
        }
      }
    }
  }
  
  const lineExplain = ({ p:precision, r:recall, threshold }: any, namespace: string, component: string) => {
    const thrs = thresholdMapping.get(namespace) || {}
      thrs[component] = threshold
    thresholdMapping.set(namespace, thrs)
    // 基础pr曲线
    const SeriesData: any = (() => {
      const data = []
      for (let i = 0 ; i < recall.length; i++) {
        data.push([fixed(recall[i]), fixed(precision[i])])
      }
      return {
        type: 'line',
        name: `${component}`,
        data
      }
    })()
    if (!series[namespace]) series[namespace] = []
    series[namespace].push(SeriesData)
  }

  const lineChart = (namespace?: string) => {
    if (namespace && series[namespace] && series[namespace].length > 0) {
      return {
        configuration: Object.assign({}, basicChartConfiguration, { series: series[namespace] }, tooltip(namespace)),
        legend: 1
      }
    } else if (!namespace) {
      const config = <any>{}
      for (const key in series) {
        if (series[key] && series[key].length > 0) {
          config[key] = {
            configuration: Object.assign({}, basicChartConfiguration, { series: series[key] }, tooltip(key)),
            legend: 1
          }
        }
      }
      return config
    }
  }

  return {
    lineChart,
    lineExplain
  }
}