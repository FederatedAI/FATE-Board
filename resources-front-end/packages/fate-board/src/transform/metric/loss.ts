import { FLine } from '@/components/LineChart';
import fixed from '../tools/fixed';

export default function Loss (
  data: Array<any> | Array<any>[]
) {

  const configuration = {
    xAxis: {
      type: 'category',
    },
    yAxis: {
      type: 'value',
      name: 'loss'
    },
    series:[{
      type: 'line',
      name: 'loss',
      data: (() => {
        const list = []
        for (const each of data) {
          list.push(fixed(each.metric))
        }
        return list
      })()
    }]
  }

  return {
    id: 'LOSS',
    tag: FLine,
    prop: {
      title: 'Loss',
      data: configuration
    }
  }
}