import toFixed from "@/utils/toFixed";
import { isNull, isNumber, isUndefined } from "lodash";

export default function toData (data: any) {
  if (isNumber(data)) {
    return toFixed(data)
  } 
  if (isNull(data)) {
    return 'Null'
  }
  if (isUndefined(data) || data === ' ') {
    return '-'
  }
  return data
}