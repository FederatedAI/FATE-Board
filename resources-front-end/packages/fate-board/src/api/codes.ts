import store from '@/store/store';
import { setSession } from 'fate-tools';

export default {
  100: function warning(data: any, _reqConfig: any, _service: any) {
    return data
  },

  10004: {
    time: 0
  },

  10015: {
    operation: async function loginFailed(_data: any, _reqConfig: any, _service: any) {
      setSession('hasSignIn', '')
      store.commit('SET_RESIGNIN', true)
      return await store.dispatch('signInForMultPage')
    },
    time: 2
  },

  error: function error(data: any, _reqConfig: any, _service: any) {
    return data
  }
};
