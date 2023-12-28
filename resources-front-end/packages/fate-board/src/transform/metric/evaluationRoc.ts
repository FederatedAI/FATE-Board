import fixed from "../tools/fixed"

export default function EvaRoc (
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const thresholdMapping = new Map()

  const basicChartConfiguration = {
    yAxis: {
      name: 'tpr',
    },
    xAxis: {
      name: 'fpr'
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
            parameter['tpr'] = each.value[1]
            parameter['fpr'] = each.value[0]
            if (parameter.tpr && parameter.fpr) {
              parameter.ks = Math.abs(parameter.tpr - parameter.fpr)
            }
            parameters.set(componentName, parameter)
          }
          let display = ''
          parameters.forEach((item, componentName) => {
            if (display) display += '<br />'
            display += `Threshold(${componentName}): ${item.ths} <br />
            tpr: ${item.tpr} <br />
            fpr: ${item.fpr}`
          })
          return display
        }
      }
    }
  }

  const lineExplain = ({ fpr, tpr, threshold }: any, namespace: string, component: string) => {

    const thrs = thresholdMapping.get(namespace) || {}
      thrs[component] = threshold
    thresholdMapping.set(namespace, thrs)

    // 基础 roc 曲线
    const SeriesData: any = [{
      type: 'line',
      name: `${component}`,
      areaStyle: true,
      data: (() => {
        const list = []
        for (let i = 0 ; i < fpr.length; i++ ) {
          list.push([fixed(fpr[i]), fixed(tpr[i])])
        }
        return list
      })()
    }]

    if (!series[namespace]) series[namespace] = []
    series[namespace].push(...SeriesData)
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