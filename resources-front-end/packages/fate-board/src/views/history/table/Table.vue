<template>
  <FTable
    ref="ftable"
    v-loading="requesting"
    :header="header"
    :data="data"
    :current="parameter.pageNum"
    :size="parameter.pageSize"
    :total="total"
    :layout="'total, sizes, prev, pager, next'"
    :needToRefresh="false"
    position="center"
    class="f-history-table"
    @sizeChange="sizeChange"
    @currentChange="currentChange"
    @sortChange="sortChange"
  />
</template>

<script lang="ts" setup>
import API from '@/api';
import { toDate, toTime } from 'fate-tools';
import { debounce } from 'lodash';
import { computed, nextTick, onBeforeMount, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useStore } from 'vuex';
import cols from './ColHeader';

const store = useStore()
const ftable = ref();
const requesting = ref(true)

// table header confgiuration
const header = computed(() => {
  return cols(
    (content: string, { $index }: any) => {
      data[$index].notes = content
    },
    () => dataRequest(),
    () => dataRequest())
});

const parameter = reactive({
  pageNum: store.state.job.currentPage || 1,
  pageSize: store.state.job.pageSize || 20,
  orderRule: 'desc',
  orderField: 'f_job_id',
  job_id: '',
  role: [],
  party_id: '',
  partner: '',
  status: [],
  note: '',
})
const total = ref(0);

// page size change
const sizeChange = (size: number) => { 
  parameter.pageSize = size;
  store.commit('SET_PAGESIZE', size)
};
// current page change
const currentChange = (current: number) => {
  parameter.pageNum = current;
  store.commit('SET_CURRENTPAGE', current)
};
// sort change
const sortChange = ({col, order}: any) => {
  const Implying: any = {
    start_time: 'f_start_time',
    end_time: 'f_end_time',
    duration: 'f_elapsed'
  }
  parameter.orderRule = order === 'descending' ? 'desc' : 'asc'
  parameter. orderField = Implying[col]
}

// data origin list
const data = reactive<any[]>([]);
// table data and total requesting
const dataRequest = debounce(async () => {
  const response = await API.queryJobs(parameter);

  total.value = response.totalRecord;
  data.length = 0
  data.push(
    ...response.list.map(({ job }: any) => {
      return {
        jobId: job.fJobId || '',
        role: job.fRole || '',
        partyId: job.fPartyId || '',
        start_time: job.fStartTime ? toDate(job.fStartTime) : '',
        end_time: job.fEndTime ? toDate(job.fEndTime) : '',
        duration: !(job.fStatus || 'waiting').match(/waiting|running/i) ? (job.fElapsed ? toTime(job.fElapsed) : '') : '',
        partner: job.partners.join(', '),
        status: {
          value: job.fStatus || 'waiting',
          percentage: job.fStatus.match(/running/i) ? job.fProgress || 0 : undefined,
          className: (status: string) => {
            if (status.match(/success/i)) {
              return 'f-status-success'
            } else if (status.match(/fail/)) {
              return 'f-status-fail'
            } else {
              return ''
            }
          }
        },
        notes: job.fDescription || '',
      }
    })
  );
  nextTick(() => {
    requesting.value = false
  })
}, 500)

watch(() => parameter, () => {
  dataRequest();
}, { deep: true })

const filtering = (newfilters: object) => {
  Object.assign(parameter, newfilters)
  parameter.pageNum = 1;
  ftable.value.pageChange(parameter.pageNum);
}

let interval: any
// Before mount request
onBeforeMount(() => {
  requesting.value = true
  dataRequest();
  interval = setInterval(() => {
    dataRequest();
  }, 15000)
});

onMounted(() => {
  setTimeout(() => {
    requesting.value = false
  }, 4000)
})

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval)
  }
})

defineExpose({ search: filtering })
</script>

<style lang="scss">

.f-history-table {
  .f-status-success {
    color: var(--el-color-success);
  }
  .f-status-fail {
    color: var(--el-color-danger);
  }
}
</style>