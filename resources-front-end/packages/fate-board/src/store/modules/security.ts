import API from '@/api';

export default {
  state: {
    publicKey: '',
  },

  mutations: {
    setPublicKey(state: any, key: string) {
      state.publicKey = key;
    },
  },

  actions: {
    async getPublicKey({ commit, state }: any) {
      if (!state.publicKey) {
        const publicKey = await (API as any).getPublicKey();
        commit('setPublicKey', publicKey)
      }
      return state.publicKey
    },
  },
};
