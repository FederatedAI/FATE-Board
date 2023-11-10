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
  return {
    id: 'ComponentDetailContainer',
    tag: 'article',
    prop: {
      class: 'f-detail-component',
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
      if (children.length === 0) [
        children.push('No Data')
      ]
      return children
    })()
  }
}