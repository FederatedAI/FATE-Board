export default {
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove',
    formatter: params => {
      const strArr = params.data.name.split('\n')
      let str = ''
      strArr.forEach((item, index, arr) => {
        str += item
        if (index < arr.length - 1) {
          str += '<br>'
        }
      })
      return str
    }
  },
  series: {
    type: 'tree',
    // roam: true,
    // data: [{
    //   name: 'test',
    //   children: [
    //     {
    //       name: 'test2'
    //       //   lineStyle: {
    //       //     width: 5
    //       //   }
    //     },
    //     {
    //       name: 'test3',
    //       children: [{
    //         name: 'test4\nchange'
    //       }, {
    //         name: 'test5'
    //       }]
    //     }
    //   ]
    // }],
    data: [],
    left: '2%',
    right: '2%',
    top: '8%',
    bottom: '20%',
    symbol: 'rect',
    symbolSize: [110, 50],
    orient: 'vertical',
    lineStyle: {
      color: '#e8e8ef',
      width: 2
    },
    itemStyle: {
      normal: {
        color: 'transparent',
        borderColor: 'transparent'
      }
    },
    expandAndCollapse: false,

    label: {
      position: 'inside',
      backgroundColor: 'rgb(73,78,206)',
      color: '#fff',
      distance: 0,
      rotate: 0,
      verticalAlign: 'middle',
      // borderColor: '#494ece',
      borderRadius: 5,
      align: 'center',
      fontSize: 12,
      borderWidth: 1,
      padding: [3, 1],
      width: 110,
      height: 70,
      lineHeight: 16,
      rich: {}
    },

    leaves: {
      label: {
        position: 'inside',
        backgroundColor: 'rgb(146,149,226)',
        color: '#fff',
        distance: 0,
        rotate: 0,
        verticalAlign: 'middle',
        // borderColor: '#9194e1',
        borderRadius: 5,
        align: 'center',
        borderWidth: 1,
        lineHeight: 22,
        rich: {}
      }
    },

    animationDurationUpdate: 750
  }
}
