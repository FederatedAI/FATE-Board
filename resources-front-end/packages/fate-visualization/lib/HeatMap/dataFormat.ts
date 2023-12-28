export default function dataFormat (x: any, y: any, data: any[], balance = true) {
  if (balance) {
    if (Array.isArray(data[0])) {
      const length = data[0].length
      const cols = [[...data[0]]]
      for (let i = 1; i < data.length; i++) {
        const row = [...data[i]]
        for (let j = 0; j < length; j++) {
          if (row.length >= length) break
          else row.splice(j, 0, cols[j][i])
        }
        cols.push(row)
      }
      data = cols
    } else if (data.length < x.length * y.length){
      const reverse = data.reverse()
      reverse.shift()
      data.push(...reverse)
    }
  }

  const seriesData = []
  let min: any, max: any
  if (Array.isArray(data[0])) {
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        const d = data[i][j]
        if (!min) min = d
        if (!max) max = d
        if (d < min) min = d
        if (d > max) max =d
        seriesData.push([i, j, d])
      }
    }
  } else {
    let c = 0
    for (let i = 0; i < x.length; i++) {
      for (let j = 0; j < y.length; i++) {
        const d = data[i][j]
        if (d) {
          if (!min) min = d
          if (!max) max = d
          if (d < min) min = d
          if (d > max) max = d
        }
        seriesData.push([i, j, d || undefined])
        c++
      }
    }
  }
  return { data: seriesData, max, min }
}