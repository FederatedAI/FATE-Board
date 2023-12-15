enum CompStage {
  PREDICE = 'PREDICT',
  TRAIN = 'TRAIN',
  CROSS_VALIDATION = 'CROSS_VALIDATION'
}

export default function runningStage(stage: string = '') {
  if (stage.match(new RegExp(`(${CompStage.PREDICE})`, 'i'))) {
    return 'predict';
  } else if (stage.match(new RegExp(`(${CompStage.TRAIN})`, 'i'))) {
    return 'train';
  } else if (stage.match(new RegExp(`(${CompStage.CROSS_VALIDATION})`, 'i'))) {
    return 'cross_validation';
  } else {
    return 'default'
  }
}
