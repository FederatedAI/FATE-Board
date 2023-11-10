import API from '@/api';
import { encrypt, getLocal, setLocal } from 'fate-tools';

export default {
  state: {
    username: '',
    publicKey: '',
    resignIn: false,
  },

  mutations: {
    SET_USERNAME: (state: any, username: string) => {
      state.username = username;
    },

    SET_PUBLICKEY: (state: any, publicKey: string) => {
      state.publicKey = publicKey;
    },

    SET_RESIGNIN: (state: any, resignIn: boolean) => {
      state.resignIn = resignIn;
      if (resignIn) {
        state.username = '';
      }
    },
  },

  actions: {
    async signIn(
      { commit, dispatch, state }: any,
      ingridient: { username: string; password: string; security: boolean }
    ) {
      // 数据加密
      if (!state.publicKey && ingridient.security !== false) {
        commit('SET_PUBLICKEY', await dispatch('getPublicKey'));
      }
      const paramter = {
        username: ingridient.username,
        password: state.publicKey
          ? encrypt(state.publicKey, ingridient.password)
          : ingridient.password,
      };
      const responseData = await (API as any).signIn(paramter);
      if (responseData === true) {
        commit('SET_RESIGNIN', false);
        commit('SET_USERNAME', ingridient.username);
        setLocal(
          'ingridient',
          JSON.stringify(ingridient),
          parseFloat(process.env.LOGIN_LIMITATION || '0')
        );
      }
      return responseData;
    },

    async signOut({ commit }: any) {
      commit('SET_RESIGNIN', true);
      setLocal('ingridient', '')
      return await (API as any).signOut();
    },

    signInForMultPage({ state, commit, dispatch }: any) {
      let ingridient: any = getLocal('ingridient') || '';
      if (ingridient) {
        ingridient = JSON.parse(ingridient);
        if (state.resignIn) {
          return dispatch('signIn', Object.assign({ security: true }, ingridient));
        } else {
          commit('SET_USERNAME', ingridient.username);
          dispatch('toRunning');
          return true;
        }
      }
      return null;
    },
  },
};
