import { isFunction, isObject, isUndefined } from "lodash"

type StyleSheetExplaining = (props: unknown) => string | string[] | object

const explaining = (origin: string | string[] | object) => {
  const strExplain = (str: string) => {
    const [key, value] = str.split(':')
    return { [key]: value.replace(';', '') }
  }
  if (!isObject(origin) || Array.isArray(origin)) {
    const result = {}
    for (const each of [origin].flat(Infinity)) {
      Object.assign(result, strExplain(<string>each))
    }
    return result
  } else {
    return origin
  }
}

export default function styleSheetExplain (
  styleSheet: string | string[] | object | StyleSheetExplaining | undefined,
  props: unknown,
  attrs?: unknown
) {
  let customerStyleSheet: string | string[] | object
  if (isFunction(styleSheet)) {
    customerStyleSheet = styleSheet(props)
  } else if (!isUndefined(styleSheet)) {
    customerStyleSheet = styleSheet
  } else {
    customerStyleSheet = {}
  }
  customerStyleSheet = explaining(customerStyleSheet)
  if (attrs) {
    const extClass = (attrs as any).class
    Object.assign(customerStyleSheet, explaining(extClass))
  }
  return customerStyleSheet
}
