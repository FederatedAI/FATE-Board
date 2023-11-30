import store from '@/store/store';

export default {
  100: function warning(data: any, _reqConfig: any, _service: any) {
    return data
  },

  10004: {
    time: 0
  },

  10015: {
    operation: async function loginFailed(_data: any, _reqConfig: any, _service: any) {
      store.commit('SET_AUTH')
      const result = await store.dispatch('signInForMultPage')
      if (!result) {
        store.dispatch('toSignIn')
        return false
      }
      return true
    },
    time: 2
  },

  error: function error(data: any, _reqConfig: any, _service: any) {
    return data
  }
};
