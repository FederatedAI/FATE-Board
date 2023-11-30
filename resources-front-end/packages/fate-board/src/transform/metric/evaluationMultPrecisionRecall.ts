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
      type: 'category',
    },
    yAxis: {
      type: 'value',
      name: 'precision, recall'
    }
  }

  const series = <any>{}

  const tooltip = (namespace: string) => {
    return {
      tooltip: {
        formatter: (params: any) => {
          const parameters = new Map()
          for (const each of [params].flat(Infinity)) {
            const nameSplit = each.seriesName.split('_')
            const componentName = nameSplit.splice(0, nameSplit.length - 1).join('_')
            const parameterName = nameSplit[0]
            const parameter = parameters.get(componentName) || {}
            if (!parameter.ths) {
              const threshold = thresholdMapping.get(namespace)
              parameter.ths = fixed(threshold[componentName][each.dataIndex])
            }
            parameter[parameterName] = each.data
            parameters.set(componentName, parameter)
          }
          let display = ''
          parameters.forEach((item, componentName) => {
            if (display) display += '<br />'
            display += `Threshold(${componentName}): ${item.ths} <br />
              Precision: ${item.precision}<br />
              Recall: ${item.recall}`
          })
          return display
        }
      }
    }
  }
  
  const lineExplain = ({ p: precision, r: recall, cuts, threshold }: any, namespace: string, component: string) => {
    const thrs = thresholdMapping.get(namespace) || {}
      thrs[component] = threshold
    thresholdMapping.set(namespace, thrs)

    // 基础p, r曲线
    const SeriesData: any = (() => {
      const data1 = [], data2 = []
      for (let i = 0 ; i < recall.length; i++) {
        data1.push([cuts[i], fixed(precision[i])])
        data2.push([cuts[i], fixed(recall[i])])
      }
      return [{
        type: 'line',
        name: `${component}_precision`,
        data: data1
      }, {
        type: 'line',
        name: `${component}_recall`,
        data: data2
      }]
    })()
    if (!series[namespace]) series[namespace] = []
    series[namespace].push(...SeriesData)
  }

  const lineChart = (namespace?: string) => {
    if (namespace && series[namespace] && series[namespace].length > 0) {
      return {
        configuration: Object.assign({}, basicChartConfiguration, { series: series[namespace] }, tooltip(namespace)),
        legend: 2
      }
    } else if (!namespace) {
      const config = <any>{}
      for (const key in series) {
        if (series[key] && series[key].length > 0) {
          config[key] = {
            configuration: Object.assign({}, basicChartConfiguration, { series: series[key] }, tooltip(key)),
            legend: 2
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