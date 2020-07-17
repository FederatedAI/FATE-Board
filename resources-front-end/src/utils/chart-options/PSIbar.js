export default {
  backgroundColor: '#fff',
  title: {
    text: ''
  },

  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'line',
      lineStyle: {
        type: 'dotted',
        color: '#ff9e1f'
      }
    }
  },

  legend: {
    show: true,
    right: '5%',
    top: '3%',
    orient: 'horizontal'
  },

  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },

  yAxis: [{
    type: 'value',
    splitArea: {
      show: true,
      areaStyle: {
        color: '#ffffff'
      }
    },
    nameGap: 8,
    axisLabel: {},
    splitNumber: 5
  }, {
    type: 'value',
    nameGap: 8,
    splitArea: {
      show: true,
      areaStyle: {
        color: '#ffffff'
      }
    },
    axisLabel: {},
    splitNumber: 5
  }],
  xAxis: {
    type: 'category',
    data: [],
    axisLine: {
      lineStyle: {
        color: '#A9A9A9'
      }
    },
    axisLabel: {
      rotate: 30,
      fontSize: 12,
      color: '#999ba3'
    },
    nameGap: 5
  },
  series: []
}
