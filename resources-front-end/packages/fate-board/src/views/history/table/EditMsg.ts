import API from '@/api';
import { ElMessage } from 'element-plus';
import { Ref } from 'vue';

export default async function editMsg (
  content: Ref<String> | any,
  scope: any,
  after: any
) {
  const { row } = scope
  const responseData = await API.noteUpdate({
    job_id: row.jobId,
    party_id: row.partyId,
    role: row.role,
    notes: content.value || content
  })
  if (responseData) {
    after(content, scope)
  } else {
    ElMessage({
      showClose: true,
      message: `Notes updating failed`,
      center: true,
      type: 'warning'
    })
  }
}