import API from '@/api';
import { ElMessage, ElMessageBox } from 'element-plus';

export default function open(parameter: any, after: any) {
  ElMessageBox.confirm(
    `Are you sure you want to cancel this job? You can't undo this action，it may take few seconds to  update job status.`,
    `Cancel`,
    {
      confirmButtonText: 'Sure',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => {
      API.killJob(parameter).then((responseData: any) => {
        if (responseData) {
          ElMessage({
            type: 'success',
            message: `Job is canceling`,
          });
          after()
        } else {
          ElMessage({
            type: 'error',
            message: `Job-canceling failed`,
          });
        }
      })
      
    })
    .catch(() => {});
}
