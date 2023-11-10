import { isString } from "@vue/shared";

export default function toFixed (num: number | string, digit = 6):number {
  if (isString(num)) {
    num = parseFloat(num)
    if (isNaN(num)) return num
  }
  return Number(num.toFixed(digit))
}