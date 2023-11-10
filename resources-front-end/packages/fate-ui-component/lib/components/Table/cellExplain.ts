import { isFunction, isObject, isUndefined } from "lodash"

export const contentExplain = ({ row, column }: any) => {
  let content = ''
  const configuration = row[column.property]
  if (isObject(configuration) && !Array.isArray(configuration)) {
    content = (configuration as any).value
  } else {
    content = Array.isArray(configuration) ? configuration.join(',') : configuration
  }
  if (isUndefined(content) || content === ' ' || content === '') {
    content = '-'
  }
  return content
}

export const classExplain = ({ row, column }: any) => {
  const result: any[] = []
  if (column) {
    const configuration = row[column.property]
    if (isObject(configuration) && !Array.isArray(configuration)) {
      if ((configuration as any).filter) {
        result.push('fb-table-cell--filter')
      }
      if ((configuration as any).className) {
        if (isFunction((configuration as any).className)) {
          result.push(
            (configuration as any).className(
              (configuration as any).value))
        } else {
          result.push((configuration as any).className)
        }
      }
    }
  } else {
    if (row['_filter']) {
      result.push('fb-table-row--filter')
    }
    if (row['_class']) {
      result.push(isFunction(row['_class']) ? row['_class'](row) : row['_class'])
    }
  }
  return (result).flat(Infinity)
}