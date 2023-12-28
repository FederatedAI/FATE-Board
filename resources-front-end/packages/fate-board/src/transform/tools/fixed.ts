import { isNumber } from "lodash";

export default function fixed (num: number | string, digit = 6) {
  return Number((isNumber(num) ? num : parseFloat(num)).toFixed(digit))
}