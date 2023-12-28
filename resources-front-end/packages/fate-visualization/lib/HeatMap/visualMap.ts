const configuration = {
  FROM_COLOR: '#c6e2ff',
  END_COLOR: '#409EFF'
}

export default function visualMap({ min, max }: any) {
  return {
    visualMap: {
      min,
      max,
      calculable: true,
      orient: 'vertical',
      right: '2%',
      top: 'center',
      inRange: {
        color: [configuration.FROM_COLOR, configuration.END_COLOR]
      },
      textStyle: {
        color: '#aaa',
        fontWeight: 'bold',
      },
      padding: 3,
      handleSize: '105%'
    },
  };
}
