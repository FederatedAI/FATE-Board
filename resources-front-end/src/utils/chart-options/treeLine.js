export default {
  color: 'transparent',
  tooltip: {
    trigger: 'axis',
    position(pos, params, el, rect, size) {
      const toolTipWidth = el.offsetWidth
      const toolTipHeight = el.offsetHeight
      const left = pos[0] - toolTipWidth / 2
      const top = pos[1] - toolTipHeight / 2
      return { left, top }
    },
    formatter(params) {
      const treeId = params[0].data[0]
      const treeSize = params[0].data[1]
      return `Tree ID: ${treeId}<br>Tree Size: ${treeSize}`
    },
    backgroundColor: '#fff',
    textStyle: {
      color: 'rgb(73,78,206)',
      fontSize: 12,
      fontFamily: '"Lato", "proxima-nova", "Helvetica Neue", "Arial", "sans-serif"'
    },
    axisPointer: {
      type: 'line',
      lineStyle: {
        color: '#FF9A4D',
        width: 2
      }
    }
  },
  backgroundColor: 'transparent',
  grid: {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    containLabel: true
  },
  xAxis: {
    type: 'value',
    // data: ['1', '2', '3'],
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    },
    axisLabel: {
      show: false
    },
    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    },
    axisLabel: {
      show: false
    },
    splitLine: {
      show: false
    }
  },
  series: {
    type: 'line',
    symbol: 'none',
    data: [],
    // data: [[0, 1], [1, 3], [2, 2]]
    markLine: {
      lineStyle: {
        width: 2,
        color: '#FF9A4D',
        type: 'solid'
      },
      animation: false,
      symbol: 'none',
      data: [
        [
          {
            coord: [0, 0]
          },
          {
            coord: [0, 0]
          }
        ]
      ]
    }
  }
}
