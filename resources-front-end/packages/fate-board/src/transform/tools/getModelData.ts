import { isUndefined } from "lodash"

export default function getModelData (model: any) {
  let modelData: any = model
  while (modelData.data && isUndefined(modelData.code)) {
    modelData = modelData.data
  }
  return modelData
}