import metricsExplain from "./metric";
import modelExplain from "./model";
import './style.scss';

export default function explain (
  modelData: any,
  metricsData: any,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  let isNoData = false
  const configuration =  {
    id: 'ComponentDetailContainer',
    tag: 'article',
    prop: {
      class: 'f-detail-component f-d-seperator',
    },
    children: (() => {
      const children: any = []
      const model = modelExplain(modelData, role, partyId, component, comp_type, id)
      if (model) {
        children.push(model)
      }
      const metrics = metricsExplain(metricsData, role, partyId, component, comp_type, id)
      if (metrics) {
        children.push(metrics)
      }
      if (children.length === 0) {
        isNoData = true
        children.push({
          id: 'empty',
          tag: 'section',
          prop: {
            class: 'f-empty'
          },
          children: ['NO DATA']
        })
      }
      return children
    })()
  }
  configuration.prop.class += ' f-detail-component-group'
  return configuration
}