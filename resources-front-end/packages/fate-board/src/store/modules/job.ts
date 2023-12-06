import API from '@/api';
import dagExplaination from '@/utils/dagExplaination';
import { ElMessage } from 'element-plus';
import { WSConnect } from 'fate-tools';
import { merge } from 'lodash';

export default {
  state: {
    jobId: '',
    role: '',
    partyId: '',

    details: {},
    dataset: {},
    dag: {},
    _ws_: undefined,
    _rerun_: false,

    _blank_: true
  },

  mutations: {
    SET_JOBID(state: any, jobId: string) {
      state.jobId = jobId;
    },
    SET_JOB_ROLE(state: any, role: string) {
      state.role = role;
    },
    SET_PARTYID(state: any, partyId: string) {
      state.partyId = partyId;
    },
    SET_DAG(state: any, dag: object) {
      state.dag = merge(state.dag, dag);
    },
    SET_DETAILS(state: any, details: object) {
      state.details = merge(state.details, details);
    },
    SET_DATASET(state: any, dataset: object) {
      state.dataset = merge(state.dataset, dataset);
    },
    SET_WS(state: any, ws: any) {
      state._ws_ = ws;
    },
  },

  actions: {
    async JOB_INFORMATION({ state, commit }: any) {
      if (state._ws_) return true;
      const handler = (data: any) => {
        dagExplaination(data.dependency_data, (res: any) => {
          if (Object.keys(state.dag).length > 0) {

          } else {
            commit('SET_DAG', res)
          }
        })
        commit('SET_DATASET', data.summary_date.dataset);
        commit('SET_DETAILS', data.summary_date.job);
        if (data.status && !data.status.match(/running|waiting/)) {
          if (!state._rerun_) {
            state._ws_.close()
            commit('SET_WS', undefined)
          }
        } else if (data.status.match(/running|waiting/)) {
          if (state._rerun_) state._rerun_ = false
        }
      };
      if (!state.role || !state.jobId || !state.partyId) {
        return false;
      } else {
        const ws: any = new WSConnect(
          `/websocket/progress/${state.jobId}/${state.role}/${state.partyId}`
        );
        ws.addEventListener('message', (event: any) => {
          let data;
          try {
            data = JSON.parse(event.data);
            handler(data);
          } catch (error) {
            state._ws_.close();
            data = null;
            ElMessage({
              showClose: true,
              message: `This job socket has error`,
              center: true,
              type: 'error'
            });
          }
        });
        commit('SET_WS', ws);
        return true;
      }
    },

    async retryJob({ state }: any, info: any) {
      if (info?.job_id || state.jobId) {
        const responseData = await API.retryJob(Object.assign({
          job_id: info?.job_id || state.jobId,
          component_name: 'pipeline',
        }, info));
        if (responseData) {
          ElMessage({
            showClose: true,
            message: `Job: ${state.jobId} is retrying`,
            center: true,
          });
        } else {
          ElMessage({
            type: 'error',
            showClose: true,
            message: `Job: ${state.jobId} has retried failly`,
            center: true,
          });
        }
        return responseData;
      }
      return false;
    },

    async killJob({ state }: any, info: any) {
      if (info?.job_id || state.jobId) {
        const responseData = await API.killJob(Object.assign({
          job_id: info?.job_id || state.jobId,
          component_name: 'pipeline',
        }, info));
        if (responseData) {
          ElMessage({
            showClose: true,
            message: `Job: ${state.jobId} is canceling`,
            center: true,
          });
        } else {
          ElMessage({
            type: 'error',
            showClose: true,
            message: `Job: ${state.jobId} has canceled failly`,
            center: true,
          });
        }
        return responseData;
      }
      return false;
    },

    SET_BASIC({ state, commit, dispatch }: any, INFO: any) {
      let changed = false
      if (INFO?.jobId && state.jobId !== INFO?.jobId) {
        commit('SET_JOBID', INFO.jobId)
        changed = true
      }
      if (INFO?.role && state.role !== INFO?.role) {
        commit('SET_JOB_ROLE', INFO.role)
        changed = true
      }
      if (INFO?.partyId && state.partyId !== INFO?.partyId) {
        commit('SET_PARTYID', INFO.partyId)
        changed = true
      }
      if (INFO?.rerun) {
        state._rerun_ = !!INFO?.rerun
      }
      if (changed || !state._ws_) {
        if (state._ws_)  {
          state._ws_.close()
          state._ws_ = undefined
        }
        state.dag = {}
        dispatch('JOB_INFORMATION')
      }
    },
    GET_JOBID({ state }: any) {
      return state.jobId;
    },
    GET_JOB_ROLE({ state }: any) {
      return state.role;
    },
    GET_PARTYID({ state }: any) {
      return state.partyId;
    },
  },
};
