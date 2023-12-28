import Router from '@/router/router';
import { isUndefined } from 'lodash';

export interface RouterRecord {
  name: string,
  path: string,
  [key: string]: keyof any
}

export default {
  state: {
    crumbs: [],

    record: undefined
  },

  mutations: {
    PUSH_CRUMB (state: any, crumb: RouterRecord) {
      if (!state.crumbs.some((item: RouterRecord) => item.name === crumb.name)) {
        state.crumbs.push(crumb)
      }
    },

    POP_CRUMB (state: any, stop?: string) {
      if (state.crumbs.length > 1 && (!stop || state.crumbs[state.crumbs.length - 1].name !== stop)) {
        return state.crumbs.pop()
      }
    },

    POP_TO_ONE (state: any) {
      if (state.crumbs.length > 1) {
        return state.crumbs.splice(1)
      }
    },

    SET_RECORD (state: any, route?: any) {
      state.record = route
    }
  },

  actions: {
    toSignIn () {
      Router.push({ name: 'signIn', path: '/signIn' })
    },
    toRunning () {
      Router.push({ name: 'running', path: '/running' })
    },
    toHistory () {
      Router.push({ name: 'history', path: '/history' })
    },
    async toDetail ({ commit, dispatch }: any, information: any) {
      if (information) {
        commit('SET_JOBID', information.jobId)
        commit('SET_JOB_ROLE', information.role)
        commit('SET_PARTYID', information.partyId)
      } else {
        information = {
          jobId: await dispatch('GET_JOBID'),
          role: await dispatch('GET_JOB_ROLE'),
          partyId: await dispatch('GET_PARTYID')
        }
      }
      Router.push({ name: 'detail', path: '/detail', params: information })
    },
    async toDashboard ({ commit, dispatch }: any, information: any) {
      if (information) {
        commit('SET_JOBID', information.jobId)
        commit('SET_JOB_ROLE', information.role)
        commit('SET_PARTYID', information.partyId)
      } else {
        information = {
          jobId: await dispatch('GET_JOBID'),
          role: await dispatch('GET_JOB_ROLE'),
          partyId: await dispatch('GET_PARTYID')
        }
      }
      Router.push({ name: 'dashboard', path: '/dashboard', params: information })
    },

    setRouteRecord({ state, commit }: any, route: any) {
      if (isUndefined(state.record)) {
        commit('SET_RECORD', route)
      }
    },

    toRecord({ state, commit, dispatch }: any) {
      if (state.record) {
        Router.push(state.record)
        commit('SET_RECORD')
      } else {
        dispatch('toRunning')
      }
    }
  }
};
