export default function gaugeSeries () {
  return {
    series: {
      type: 'gauge',
      center: ['50%', '60%'],
      startAngle: 190,
      endAngle: -10,
      min: 0,
      max: 100,
      splitNumber: 10,
      itemStyle: {
        color: '#95d475',
      },
      progress: {
        show: true,
        width: 12
      },
      axisLine: {
        lineStyle: {
          width: 18
        }
      },
      axisTick: {
        distance: -25,
        splitNumber: 10,
        lineStyle: {
          width: 1,
          color: '#909399'
        }
      },
      splitLine: {
        distance: -30,
        length: 12,
        lineStyle: {
          width: 3,
          color: '#909399'
        }
      },
      axisLabel: {
        distance: -15,
        color: '#909399',
        fontSize: 14
      },
      pointer: {
        show: false
      },
      anchor: {
        show: false
      },
      title: {
        show: false
      },
      detail: {
        valueAnimation: true,
        width: '50%',
        lineHeight: 40,
        fontSize: 40,
        offsetCenter: [0, '-15%'],
        fontWeight: 'bold',
        formatter: `{value} %`,
        color: 'inherit'
      }
    }
  }
}