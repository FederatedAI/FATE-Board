import { formatFloat } from '../index'

export default function(data) {
  if (!data || Object.keys(data).length === 0) {
    return
  }
  const guestHeader = [{
    prop: 'variable',
    label: 'variable'
  }]

  const hostHeader = []
  const guestBody = []
  const hostBody = []
  const { colNames: guestColNames, hostColNames, results } = data
  guestColNames.forEach(variable => {
    guestBody.push({ variable })
  })
  // hostColNames.forEach(variable => {
  //   const middle = []
  //   variable.colNames.forEach(item => {
  //     middle.push({ variable })
  //   })
  //   hostBody.push(middle)
  // })
  hostColNames.forEach(item => {
    const final = []
    const finalHeader = [{ prop: 'variable', label: 'variable' }]
    item.colNames.forEach(variable => {
      final.push({ variable })
    })
    hostBody.push(final)
    hostHeader.push(finalHeader)
  })
  results.forEach(item => {
    const featureValues = item.featureValues
    const hostFeatureValues = item.hostFeatureValues
    const filterName = item.filterName.toLowerCase()
    const leftCols = item.leftCols.leftCols
    const hostLeftCols = item.hostLeftCols
    guestHeader.push({
      prop: filterName,
      label: filterName
    })
    guestColNames.forEach(variable => {
      const index = guestBody.findIndex(guestItem => variable === guestItem.variable)
      if (index >= 0) {
        guestBody[index][filterName] = featureValues[variable] === undefined ? '-' : formatFloat(featureValues[variable])
      }
      if (!leftCols[variable]) {
        guestBody[index][filterName + '_disable'] = true
      }
      for (let i = 0; i < data.header.length; i++) {
        if (data.header[i] === variable) {
          guestBody[index].binding = i
          break
        }
      }
    })

    if (hostFeatureValues && hostFeatureValues.length > 0) {
      for (let i = 0; i < hostFeatureValues.length; i++) {
        if (hostFeatureValues[i].featureValues) {
          hostHeader[i].push({ prop: filterName, label: filterName })
          const mid = hostBody[i]
          const fe = hostFeatureValues[i].featureValues
          for (const val of mid) {
            val[filterName] = fe[val.variable] || '-'
          }
        }
      }

      for (let i = 0; i < hostLeftCols.length; i++) {
        if (hostLeftCols[i].leftCols) {
          const mid = hostBody[i]
          mid.forEach(item => {
            item[filterName + '_disable'] = !hostLeftCols[i].leftCols[item.variable]
          })
        }
      }
    }
  })
  return { guestHeader, hostHeader, guestBody, hostBody }
}
