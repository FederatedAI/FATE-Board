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
    async getPublicKey({ state }: any) {
      if (!state.publicKey) {
        const publicKey = await (API as any).getPublicKey();
        state.publicKey = publicKey;
      }
      return state.publicKey;
    },
  },
};
