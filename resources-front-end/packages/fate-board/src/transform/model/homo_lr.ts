import fixed from "../tools/fixed";
import getModelData from "../tools/getModelData";
import toSelect from "../tools/toSelect";
import toTable from "../tools/toTable";
import toText from "../tools/toText";

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
  const { state_dict, label_num, feature_num, model_name } = param.model
  const isGuest = role.match(/guest/i)
  const isHost = role.match(/host/i)

  const options = <any>[]
  const theader = [{
    label: 'variable',
    prop: 'variable'
  }, {
    prop: 'weight',
    label: 'weight',
    sortable: true,
  }]
  const tBias = <any>{}
  const tData = <any>{}
  
  for (const key in state_dict) {
    const [ _model, modelLabel, parameter ] = key.split('.')
    const optionIndex = options.findIndex((item: any) => item.value === modelLabel)
    if (optionIndex < 0) {
      options.push({
        label: `model_${modelLabel}`,
        value: modelLabel
      })
    }
    if (parameter.match(/bias/i)) {
      tBias[modelLabel] = fixed(state_dict[key][0])
    } else if (parameter.match(/weight/i)) {
      const tDataForModel = []
      for (let i = 0 ; i < state_dict[key][0].length; i++) {
        tDataForModel.push({
          variable: model_name?.[i] || `x${i}`,
          weight: fixed(state_dict[key][0][i])
        })
      }
      tData[modelLabel] = tDataForModel
    }
  }

  const homo_lr = {
    id: 'LRModelContainer',
    tag: 'section',
    prop: { class: 'f-d-container f-d-margin' },
    children: <any[]>[],
  };
  const hasSelection = options && options.length > 1;

  if (hasSelection) {
    homo_lr.children.push(
      toSelect('LROVRSelection', options, {
        placeholder: '',
        label: 'one_vs_rest model',
      }),
      toText(
        {
          request: (value: any) => {
            const index =  options.findIndex((item: any) => item.value === value)
            return options[index].label
          },
          parameter: ['LROVRSelection.modelValue'],
        },
        'Model Label'
      )
    );
  }

  homo_lr.children.push(
    toText(
      hasSelection ? {
        request: (value: any) => {
          return tBias[value];
        },
        parameter: ['LROVRSelection.modelValue'],
      } : tBias[options[0].value],
      'Bias'
    )
  )

  homo_lr.children.push(
    toTable(
      theader,
      hasSelection ? {
        request: (value: any) => {
          return tData[value]
        },
        parameter: ['LROVRSelection.modelValue'],
      } : tData[options[0].value],
      {
        index: true
      }
    )
  )

  return homo_lr
}