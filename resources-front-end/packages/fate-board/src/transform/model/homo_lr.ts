import getModelData from "../tools/getModelData";

export default function HomoLr (
  modelData: object,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  const modelInstance = getModelData(modelData);

  const { param, meta } = modelInstance.train_output_model;
  const { ovr, max_iter } = meta
  const { state_dict, label_num, feature_num } = param.model
  const isGuest = role.match(/guest/i)
  const isHost = role.match(/host/i)

  if (ovr) {}
}