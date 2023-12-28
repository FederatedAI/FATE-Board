<template>
  <FTable
    ref="histryList"
    :header="currentHeader"
    :data="dataForTable"
    :current="currentPage"
    :size="pageSize"
    :index="true"
    :row-class-name="rowClassName"
    :range="range"
    :column="true"
    position="right"
    @sizeChange="sizeChange"
    @currentChange="currentChange"
    class="table-container"
  />
</template>

<script lang="ts" setup>
import { toDate, toTime } from 'fate-tools';
import { computed, onBeforeMount, reactive, ref } from 'vue';

function rowClassName ({ row }: any) {
  if (row.status.value.match(/success/i)) {
    return 'success-row'
  } else {
    return ''
  }
}

const range = ref(3)
const currentHeader = ref<any>(undefined)
const header = [
  {
    type: 'link',
    prop: 'jobId',
    label: 'ID',
    width: 250,
    showOverflowTooltip: true,
    onClick: (scope: any) => {
      console.log('link', scope)
    }
  },
  {
    prop: 'role',
    label: 'Role',
    width: 100,
    showOverflowTooltip: true,
  },
  {
    prop: 'v1',
    label: 'v1',
  },
  {
    prop: 'v2',
    label: 'v2',
  },
  {
    prop: 'v3',
    label: 'v3',
  },
  {
    prop: 'v4',
    label: 'v4',
  },
  {
    prop: 'start_time',
    label: 'start_time'
  },
  {
    label: 'Status',
    children: [{
      type: 'progress',
      prop: 'status',
      label: 'runningStatus',
      width: 200,
    }, {
      prop: 'stage',
      label: 'JobStage',
      width: 200
    }]
  },
  {
    type: 'edit',
    prop: 'notes',
    label: 'Notes',
    minWidth: 170,
    onEdit: (content: string, scope: any) => {
      console.log('edit:',content, scope)
    }
  },
  {
    type: 'action',
    label: 'Action',
    width: 300,
    fixed: 'right',
    operations: ({ row }: any) => {
      if (row.status.value.match(/(fail|cancel)/i)) {
        return [{
          label: 'retry',
          onclick: ({ row }: any) => {
            console.log('retry', row.jobId)
          }
        }, {
          label: 'log',
          onclick: ({ row }: any) => {
            console.log('log', row.jobId)
          }
        }]
      } else {
        return []
      }
    }
  },
];

/**
 * filter: {
 *  jobId: string,
 *  role: string,
 *  partyId: string,
 *  partner: string,
 *  status: string,
 *  note: string
 * }
 */
const props = defineProps(['filter']);
const histryList = ref();

const currentPage = ref(1);
const pageSize = ref(2);
const total = ref(0);
const column = ref(true)

// page size change
const sizeChange = (size: number) => {
  pageSize.value = size;
};

// current page change
const currentChange = (current: number) => {
  currentPage.value = current;
};

// data origin list
const dataRequested = reactive<any[]>([]);
// table data and total requesting
const dataForRequest = () => {
  const response = {
    list: <any>[
      {
        fJobId: 'job1',
        fRole: 'gueguestguestguestguestguestguestguestguestguestguestst',
        fPartyId: 9999,
        partner: '',
        fStartTime: 1234123412,
        fEndTime: 1234124303,
        fElapsed: 70031,
        fStatus: 'success',
        fDescription: 'job1 to display fro test'
      },
      {
        fJobId: 'job2',
        fRole: 'host',
        fPartyId: 10000,
        partner: '',
        fStartTime: 1234123412,
        fEndTime: 1234124904,
        fElapsed: 2000,
        fStatus: 'fail',
        fDescription: ''

      },
      {
        fJobId: 'job3',
        fRole: 'arbiter',
        fPartyId: 9999,
        partner: '',
        fStartTime: 1234123412,
        fEndTime: '',
        fElapsed: 10000,
        fProgress: 60,
        fStatus: 'running',
        fDescription: ''
      },
      {
        fJobId: 'job3',
        fRole: 'arbiter',
        fPartyId: 9999,
        partner: '',
        fStartTime: 1234123412,
        fEndTime: '',
        fElapsed: 10000,
        fProgress: 0,
        fStatus: 'waiting',
        fDescription: ''
      }
    ],
    totalRecord: 4
  }
  total.value = response.totalRecord;
  dataRequested.push(
    ...response.list.map((job: any) => {
      return {
        jobId: job.fJobId || '',
        role: job.fRole || '',
        partyId: job.fPartyId || '',
        start_time: (range: any) => {
          return `startTIme: ${job.fStartTime}, range: ${range}`
        },
        end_time: job.fEndTime ? toDate(job.fEndTime) : '',
        duration: {
          value: job.fElapsed ? toTime(job.fElapsed) : '',
          class: ['duration-test']
        },
        status: {
          value: job.fStatus || '',
          percentage: job.fProgress || undefined,
          className:  (status: any) => {
            if (status === 'running') {
              return 'tx-red'
            }
          }
        },
        stage: 'default',
        notes: job.fDescription || '',
      }
    })
  );
};

// display data for table
const dataForTable = computed(() => {
  if (!column.value) {
    return dataRequested.slice(
      (currentPage.value - 1) * pageSize.value,
      currentPage.value * pageSize.value
    );
  } else {
    return dataRequested
  }
});

onBeforeMount(() => {
  dataForRequest()
  setTimeout(() => {
    currentHeader.value = header
  }, 1000)
  setInterval(() => {
    range.value  += 1
  }, 2000)
})
</script>

<style lang="scss">
.table-container {
  min-width: 1200px;
  min-height: 400px;
}

.tx-red {
  color: red;
}
</style>
