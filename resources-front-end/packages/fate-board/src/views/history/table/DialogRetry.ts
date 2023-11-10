import API from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';

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
      API.retryJob(Object.assign({
        component_name: 'pipeline'
      }, parameter)).then((responseData: any) => {
        if (responseData) {
          ElMessage({
            type: 'success',
            message: `Job is retrying`,
          });
          after()
        } else {
          ElMessage({
            type: 'error',
            message: `Job retry failed`,
          });
        }
      })
    })
    .catch(() => {});
}
