import fixed from "../tools/fixed"

export default function EvaGain (
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
    },
    yAxis: {
      type: 'value',
      name: 'gain'
    },
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
              parameter.ths = fixed(threshold?.[componentName][each.dataIndex] || 0)
            }
            parameter[parameterName] = each.data[1]
            parameters.set(componentName, parameter)
          }
          let display = ''
          parameters.forEach((item, componentName) => {
            if (display) display += '<br />'
            display += `Threshold(${componentName}): ${item.ths} <br />
              Gain: ${item.gain}`
          })
          return display
        }
      }
    }
  }

  const lineExplain = ({ gainx, gainy, threshold }: any, namespace: string, component: string) => {
    const thrs = thresholdMapping.get(namespace) || {}
      thrs[component] = threshold
    thresholdMapping.set(namespace, thrs)
    // 基础gain曲线
    const SeriesData: any = (() => {
      const data = []
      for (let i = 0 ; i < gainx.length; i++) {
        data.push([fixed(gainx[i][1]), fixed(gainy[i][1])])
      }
      return {
        type: 'line',
        name: `${component}_gain`,
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