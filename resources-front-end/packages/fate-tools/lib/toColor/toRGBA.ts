export default function toRGBA(color: string, opacity = 1): string {
  let sColor = color.toLowerCase()
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = '#'
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
      }
      sColor = sColorNew
    }
    const sColorChange = []
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
    }
    return 'rgba(' + sColorChange.join(',') + ',' + (opacity !== undefined ? opacity : 1) + ')'
  } else {
    const colors = color.replace(/rgba?/, '').replace(/[\(\)]/, '').split(',')
    if (colors[3]) {
      colors[3] = '' + (opacity !== undefined ? opacity : 1) 
    } else {
      colors.push('' + (opacity !== undefined ? opacity : 1) )
    }
    return 'rgba(' + colors.join(',') + ')'
  }
}