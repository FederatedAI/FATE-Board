import fixed from "../tools/fixed"

export default function EvaKS (
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const thresholdMapping = new Map()

  const basicChartConfiguration = {
    xAxis: {
      type: 'category'
    },
    yAxis: {
      name: 'tpr, fpr',
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
              parameter.ths = fixed(threshold[componentName][each.dataIndex])
            }
            parameter[parameterName] = each.data[1]
            if (parameter.tpr && parameter.fpr) {
              parameter.ks = fixed(Math.abs(parseFloat(parameter.tpr) - parseFloat(parameter.fpr)))
            }
            parameters.set(componentName, parameter)
          }
          let display = ''
          parameters.forEach((item, componentName) => {
            if (display) display += '<br />'
            display += `Threshold(${componentName}): ${item.ths} <br />
            tpr: ${item.tpr} <br />
            fpr: ${item.fpr} <br />
            KS: ${item.ks}`
          })
          return display
        }
      }
    }
  }

  const lineExplain = ({ cuts, fpr, tpr, threshold }: any, namespace: string, component: string) => {

    const thrs = thresholdMapping.get(namespace) || {}
      thrs[component] = threshold
    thresholdMapping.set(namespace, thrs)

    // 基础fpr tpr 曲线
    const SeriesData: any = [{
      type: 'line',
      name: `${component}_fpr`,
      data: (() => {
        const list = []
        for (let i = 0 ; i < fpr.length; i++ ) {
          list.push([cuts[i], fixed(fpr[i])])
        }
        return list
      })()
    }, {
      type: 'line',
      name: `${component}_tpr`,
      data:  (() => {
        const list = []
        for (let i = 0 ; i < tpr.length; i++ ) {
          list.push([cuts[i], fixed(tpr[i])])
        }
        return list
      })()
    }]

    // 间隔比照
    let max: any
    let MDfpr: any
    let MDtpr: any
    let position: any
    for (let i = 0 ; i < cuts.length; i++) {
      const bet = Math.abs(fpr[i] - tpr[i])
      if (!max || max < bet) {
        position = cuts[i]
        MDfpr = fixed(fpr[i])
        MDtpr = fixed(tpr[i])
        max = bet
      }
    }
    SeriesData.push({
      name: `${component}_ks`,
      type: 'line',
      data: [[position, MDfpr], [position, MDtpr]]
    })

    if (!series[namespace]) series[namespace] = []
    series[namespace].push(...SeriesData)
  }

  const lineChart = (namespace?: string) => {
    if (namespace && series[namespace] && series[namespace].length > 0) {
      return {
        configuration: Object.assign({}, basicChartConfiguration, { series: series[namespace] }, tooltip(namespace)),
        legend: 3
      }
    } else if (!namespace) {
      const config = <any>{}
      for (const key in series) {
        if (series[key] && series[key].length > 0) {
          config[key] = {
            configuration: Object.assign({}, basicChartConfiguration, { series: series[key] }, tooltip(key)),
            legend: 3
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