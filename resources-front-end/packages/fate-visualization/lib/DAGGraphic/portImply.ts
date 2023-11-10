export type PortInfo = {
  name: string;
  tooltip: string;
  type: string;
  mult?: boolean;
};

function is(compType: string, matches: string[]) {
  return compType.match(new RegExp('(' + matches.join('|') + ')', 'i'));
}

/**
 * 解析组件类型
 * @param compType 组件类型
 * @returns 返回端口信息配置
 */
export default function explainPort(compType: string) {
  compType = compType.toLowerCase();
  const dataInput = getDataInput(compType);
  const dataOutput = getDataOutput(compType);
  const modelInput = getModelInput(compType);
  const modelOutput = getModelOutput(compType);
  const input: PortInfo[] = [...dataInput, ...modelInput];
  const output: PortInfo[] = [...dataOutput, ...modelOutput];
  return {
    dataInput: getDataInput(compType),
    dataOutpu: getDataOutput(compType),
    modelInput: getModelInput(compType),
    modelOutput: getModelOutput(compType),
    input,
    output,
  };
}

/**
 * 获取组件数据端口
 * @param compType 组件类型
 * @returns 组件数据端口
 */
function getDataInput(compType: string) {
  const TRAIN_DATA_INPUT = {
    name: 'train_dataInput',
    tooltip: 'Train Data Input',
    type: 'data',
    direction: 'input',
  };
  const VALID_DATA_INPUT = {
    name: 'validate_dataInput',
    tooltip: 'Validation Data Input',
    type: 'data',
    direction: 'input',
  };
  const DATA_INPUT = {
    name: 'dataInput',
    tooltip: 'Data Input',
    type: 'data',
    direction: 'input',
  };
  const CACHE_INPUT = {
    name: 'cacheInput',
    tooltip: 'Cache Input',
    type: 'cache',
    direction: 'input',
  };

  const input: PortInfo[] = [];

  // 多数据入口 validate_data train_data
  const towDataInput = [
    'secureboost',
    'linr',
    'lr',
    'poisson',
    'heteronn',
    'homonn',
    'localbaseline',
    'fm',
    'mf',
    'svd',
    'scdpp',
    'gmf',
    'ftl',
    'psi',
    'kmeans',
  ];
  if (is(compType, towDataInput)) {
    input.push(TRAIN_DATA_INPUT, VALID_DATA_INPUT);
  }

  // 单数据入口
  const noDataInput = ['reader', 'modelloader', 'cacheloader'];
  if (!is(compType, noDataInput) && input.length === 0) {
    input.push(DATA_INPUT);
  }

  // 首个数据入口是复合入口
  const multDataInput = ['evaluation', 'union'];
  if (is(compType, multDataInput)) {
    input[0].mult = true;
  }

  // cache类型入口添加
  const cacheDataInput = ['intersection'];
  if (is(compType, cacheDataInput)) {
    input.push(CACHE_INPUT);
  }

  return input;
}

/**
 * 数据输出端口
 * @param compType 组件类型
 */
function getDataOutput(compType: string) {
  const DATA_OUTPUT = {
    name: 'dataOutput',
    tooltip: 'Data Output',
    type: 'data',
    direction: 'output',
  };
  const DATA_FIRST_OUTPUT = {
    name: 'data0Output',
    tooltip: 'Data Output_0',
    type: 'data',
    direction: 'output',
  };
  const DATA_SECOND_OUTPUT = {
    name: 'data1Output',
    tooltip: 'Data Output_1',
    type: 'data',
    direction: 'output',
  };
  const TRAIN_DATA_OUTPUT = {
    name: 'data0Output',
    tooltip: 'Train Data Output',
    type: 'data',
    direction: 'output',
  };
  const VALID_DATA_OUTPUT = {
    name: 'data1Output',
    tooltip: 'Validation Data Output',
    type: 'data',
    direction: 'output',
  };
  const TEST_DATA_OUTPUT = {
    name: 'data2Output',
    tooltip: 'Test Data Output',
    type: 'data',
    direction: 'output',
  };
  const CACHE_OUTPUT = {
    name: 'cache0Output',
    tooltip: 'Cache Output',
    type: 'cache',
    direction: 'output',
  };

  const output: PortInfo[] = [];

  // 单个数据输出口
  const noDataOutput = [
    'evaluation',
    'upload',
    'download',
    'pearson',
    'datasplit',
    'psi',
    'kmeans',
    'modelloader',
    'cacheloader',
    'shap',
    'statistics',
    'writer',
  ];
  if (!is(compType, noDataOutput)) {
    output.push(DATA_OUTPUT);
  }

  // 多数据输出口
  const twoOutput = ['kmeans'];
  if (is(compType, twoOutput)) {
    output.push(DATA_FIRST_OUTPUT, DATA_SECOND_OUTPUT);
  }

  // datasplit 数据输出端口
  const threeOutput = ['datasplit'];
  if (is(compType, threeOutput)) {
    output.push(TRAIN_DATA_OUTPUT, VALID_DATA_OUTPUT, TEST_DATA_OUTPUT);
  }

  // cache data output
  const cacheDataOutput = ['intersection', 'cacheloader'];
  if (is(compType, cacheDataOutput)) {
    output.push(CACHE_OUTPUT);
  }

  return output;
}

// model 无关组件
const noModel = [
  'intersection',
  'evaluation',
  'upload',
  'download',
  'rsa',
  'datasplit',
  '^reader',
  'union',
  'scorecard',
  'cacheloader',
  'writer',
  'sample',
  'positiveunlabeled',
];

/**
 * 获取模型输入端口
 * @param compType 组件类型
 * @returns 模型输入
 */
function getModelInput(compType: string) {
  const MODEL_INPUT = {
    name: 'modelInput',
    tooltip: 'Model Input',
    type: 'model',
    direction: 'input',
  };

  const input: PortInfo[] = [];

  if (!is(compType, noModel)) {
    // 模型输入端口
    const noModelInput = ['statistics', 'pearson', 'psi', 'modelloader'];
    if (!is(compType, noModelInput)) {
      input.push(MODEL_INPUT);
    }

    const multModelInput = ['selection'];
    if (is(compType, multModelInput)) {
      input[0].mult = true;
    }
  }

  return input;
}

/**
 * 获取模型输出端口
 * @param compType 组件类型
 * @returns 模型输出端口
 */
function getModelOutput(compType: string) {
  const MODEL_OUTPUT = {
    name: 'modelOutput',
    tooltip: 'Model Output',
    type: 'model',
    direction: 'output',
  };

  const output: PortInfo[] = [];

  if (!is(compType, noModel)) {
    const noModelOutput = ['shap'];
    if (!is(compType, noModelOutput)) {
      output.push(MODEL_OUTPUT);
    }
  }

  return output;
}
