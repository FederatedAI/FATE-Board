import Router from '@/router/router';

export interface RouterRecord {
  name: string,
  path: string,
  [key: string]: keyof any
}

export default {
  state: {
    crumbs: []
  },

  mutations: {
    PUSH_CRUMB (state: any, crumb: RouterRecord) {
      if (!state.crumbs.some((item: RouterRecord) => item.name === crumb.name)) {
        state.crumbs.push(crumb)
      }
    },

    POP_CRUMB (state: any) {
      if (state.crumbs.length > 1) {
        return state.crumbs.pop()
      }
    },

    POP_TO_ONE (state: any) {
      if (state.crumbs.length > 1) {
        return state.crumbs.splice(1)
      }
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
  }
};
