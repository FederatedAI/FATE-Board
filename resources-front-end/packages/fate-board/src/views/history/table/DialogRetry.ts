import store from '@/store/store';
import { ElMessageBox } from 'element-plus';

export default function open(parameter: any, after: any) {
  ElMessageBox.confirm(
    `The job will continue from where it end, it may take few seconds to  update job status.`,
    `Retry`,
    {
      confirmButtonText: 'Sure',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => {
      return store.dispatch('retryJob', parameter)
    })
    .catch(() => {});
}
