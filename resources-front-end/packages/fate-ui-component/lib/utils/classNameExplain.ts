import { isFunction, isString, isUndefined } from "lodash"

type ClassNameExplaining = (props: unknown) => string | string[] | object

const explaining = (origin: string | string[] | object): object => {
  const result: any = {}
  if (isString(origin)) {
    result[origin] = true
  } else if (Array.isArray(origin)) {
    for (const each of origin) {
      result[each] = true
    }
  } else {
    return origin
  }
  return result
}

export default function classNameExplain (
  className: ClassNameExplaining | string | string[] | object | undefined,
  props: unknown,
  attrs?: unknown
) {
  let customerClassName: string | string[] | object
  if (isFunction(className)) {
    customerClassName = className(props)
  } else if (!isUndefined(className)){
    customerClassName = className
  } else {
    customerClassName = {}
  }
  customerClassName = explaining(customerClassName)
  if (attrs) {
    const extClass = (attrs as any).class
    Object.assign(customerClassName, explaining(extClass))
  }
  return customerClassName
}
