import { FLine } from '@/components/LineChart';
import fixed from '../tools/fixed';

export default function Loss (
  data: Array<any> | Array<any>[]
) {

  const configuration = {
    xAxis: {
      type: 'value',
      name: 'epoch',
      minInterval: 1
    },
    yAxis: {
      type: 'value',
      name: 'loss'
    },
    series: (() => {
      let cursor = 0
      const result = []
      const pointers = <any>[]
      for (const each of data) {
        if (each.step === 0 && pointers.length > 0) {
          result.push({
            type: 'line',
            name: `loss_${cursor ++}`,
            data: [...pointers]
          })
          pointers.length = 0
        }
        pointers.push([each.step, fixed(each.metric)])
      }
      if (pointers.length > 0) {
        result.push({
          type: 'line',
          name: `loss_${cursor}`,
          data: [...pointers]
        })
        pointers.length = 0
      }
      return result
    })(),
    tooltip: {
      formatter: (parameters: any) => {
        return `Epoch: ${parameters[0].axisValue} <br />
        Loss: ${parameters[0].data[1]}`
      }
    }
  }

  return {
    id: 'LOSS',
    tag: FLine,
    prop: {
      title: 'Loss',
      data: configuration,
      legend: 1
    }
  }
}