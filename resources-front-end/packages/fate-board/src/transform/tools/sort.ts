export default function sort (dataList: any[], key?: string, cb?: any) {
  const list = dataList.sort((a: any, b: any) => {
    const aKey = String(key ? a[key] : a)
    const bKey = String(key ? b[key] : b)
    const cbResult = cb ? cb(a, b) : 0

    if (cbResult === 0) {
      let an = '', bn = '', hasEqual = false
      const len = Math.max(aKey.length, bKey.length)
      for (let i = 0; i < len; i ++) {
        const ac = aKey[i] || ''
        const bc = bKey[i] || ''
        const aIsN = ac.match(/[0-9]/)
        const bIsN = bc.match(/[0-9]/)
        if (aIsN) {
          an += ac
        }
        if (bIsN) {
          bn += bc
        }
        if (!aIsN || !bIsN) {
          if (an && bn) {
            const anum = parseFloat(an)
            const bnum = parseFloat(bn)
            if (anum > bnum) return 1
            else if (anum < bnum) return -1
          } else if (ac === bc) {
            an = ''
            bn = ''
          } else {
            return ac > bc ? 1 : -1
          }
        } else {
          // 最后一项
          if (i === len - 1) {
            return parseFloat(an) > parseFloat(bn) ? 1 : -1
          }
        }
      }
      return 0
    }
    return cbResult
  })
  return list
}