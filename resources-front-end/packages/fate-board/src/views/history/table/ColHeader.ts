import routes from '@/router/router';
import store from '@/store/store';
import DialogCancel from './DialogCancel';
import DialogRetry from './DialogRetry';
import editMsg from './EditMsg';

const newPage = true
const header = (
  edit: any,
  cancel: any,
  retry: any) => [
  {
    type: 'link',
    prop: 'jobId',
    label: 'ID',
    width: 250,
    showOverflowTooltip: true,
    onClick: ({ row }: any) => {
      store.commit('SET_JOBID', row.jobId)
      store.commit('SET_JOB_ROLE', row.role)
      store.commit('SET_PARTYID', row.partyId)
      if (window && newPage) {
        const url = routes.resolve({
          name: 'detail',
          path: '/detail',
          params: {
            jobId: row.jobId,
            role: row.role,
            partyId: row.partyId
          }
        })
        window.open(url.href, '_blank')
      } else {
        store.dispatch('toDetail', row)
      }
    }
  },
  {
    prop: 'role',
    label: 'Role',
    width: 100,
    showOverflowTooltip: true,
  },
  {
    prop: 'partyId',
    label: 'Party ID',
    width: 100,
    showOverflowTooltip: true,
  },
  {
    prop: 'partner',
    label: 'Partner',
    width: 100,
    showOverflowTooltip: true,
  },
  {
    prop: 'start_time',
    label: 'Start Time',
    width: 200,
    sortable: 'custom',
    showOverflowTooltip: true,
  },
  {
    prop: 'end_time',
    label: 'End Time',
    width: 200,
    sortable: 'custom',
    showOverflowTooltip: true,
  },
  {
    prop: 'duration',
    label: 'Duration',
    width: 130,
    sortable: 'custom',
    showOverflowTooltip: true,
  },
  {
    type: 'progress',
    prop: 'status',
    label: 'Status',
    width: 150,
    showOverflowTooltip: true,
  },
  {
    type: 'edit',
    prop: 'notes',
    label: 'Notes',
    minWidth: 170,
    onEdit: (content: string, scope: any) => {
      editMsg(content, scope, edit)
    }
  },
  {
    type: 'action',
    prop: 'action',
    label: 'Action',
    width: 100,
    fixed: 'right',
    operations: (scope: any) => {
      if (scope.row) {
        if (scope.row.status.value.match(/(fail|cancel)/i)) {
          return [
            {
              label: 'retry',
              onClick: ({ row }: any) => {
                DialogRetry({ job_id: row.jobId }, () => retry(scope));
              },
            },
          ];
        } else if (scope.row.status.value.match(/running/i)) {
          return [
            {
              label: 'cancel',
              onClick: ({ row }: any) => {
                DialogCancel({ job_id: row.jobId }, () => cancel(scope));
              },
            },
          ];
        }
      } else {
        return void 0
      }
    },
  },
];

export default header