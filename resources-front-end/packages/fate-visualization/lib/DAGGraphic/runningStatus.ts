export enum CompStatus {
  UNRUN = 'UNRUN|WAITING|PASS',
  RUNNING = 'RUNNING',
  FAIL = 'FAIL|ERROR|CANCELED|TIMEOUT',
  SUCCESS = 'SUCCESS|COMPLETE',
}

export default function runningStatus(status: string) {
  if (status.match(new RegExp(`(${CompStatus.UNRUN})`, 'i'))) return 'unrun';
  if (status.match(new RegExp(`(${CompStatus.RUNNING})`, 'i')))
    return 'running';
  if (status.match(new RegExp(`(${CompStatus.FAIL})`, 'i'))) return 'fail';
  if (status.match(new RegExp(`(${CompStatus.SUCCESS})`, 'i')))
    return 'success';
}
