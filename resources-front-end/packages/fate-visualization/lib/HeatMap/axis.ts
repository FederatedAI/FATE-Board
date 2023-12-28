const configuration = {
  max_item_in_line: 12,
}

export default function getAxis ({ x, y }: any) {
  return {
    xAxis: {
      type: 'category',
      data: x,
      splitArea: {
        show: true
      },
      axisLabel: {
        rotate:
          x.some((item: any) => item.toString().length >= configuration.max_item_in_line)
            ? 45
            : 0,
      }
    },
    yAxis: {
      type: 'category',
      data: y,
      splitArea: {
        show: true
      },
      axisLabel: {
        rotate:
          y.some((item: any) => item.toString().length >= configuration.max_item_in_line)
            ? 45
            : 0,
      }
    }
  }
}