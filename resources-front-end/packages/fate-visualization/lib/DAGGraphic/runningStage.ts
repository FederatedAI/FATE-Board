enum CompStage {
  PREDICE = 'PREDICT',
  TRAIN = 'TRAIN',
}

export default function runningStage(stage: string = '') {
  if (stage.match(new RegExp(`(${CompStage.PREDICE})`, 'i'))) {
    return 'predict';
  } else if (stage.match(new RegExp(`(${CompStage.TRAIN})`, 'i'))) {
    return 'train';
  } else {
    return 'default';
  }
}
