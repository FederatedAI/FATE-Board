import API from '@/api';
import { encrypt, getLocal, getSession, setLocal, setSession } from 'fate-tools';

export default {
  state: {
    username: '',
    resignIn: false,
  },

  mutations: {
    SET_USERNAME: (state: any, username: string) => {
      state.username = username;
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
      { commit, dispatch }: any,
      ingridient: { username: string; password: string; security: boolean }
    ) {
      // 数据加密
      const publicKey: string = await dispatch('getPublicKey')
      const paramter = {
        username: ingridient.username,
        password: !ingridient.security
          ? encrypt(publicKey, ingridient.password)
          : ingridient.password,
      };
      const responseData = await (API as any).signIn(paramter);
      if (responseData === true) {
        commit('SET_RESIGNIN', false);
        commit('SET_USERNAME', ingridient.username);
        setLocal('ingridient', JSON.stringify(ingridient));
        setSession('hasSignIn', 'true')
      } else {
        setLocal('ingridient', '')
        setSession('hasSignIn', '')
      }
      return responseData;
    },

    async signOut({ commit }: any) {
      commit('SET_RESIGNIN', true);
      setLocal('ingridient', '')
      setSession('hasSignIn', '')
      return await (API as any).signOut();
    },

    async signInForMultPage({ state, commit, dispatch }: any) {
      let ingridient: any = getLocal('ingridient') || '';
      const hasSignIn = getSession('hasSignIn')
      if (ingridient) {
        ingridient = JSON.parse(ingridient);
        if (state.resignIn && !hasSignIn) {
          return await dispatch('signIn', Object.assign({ security: true }, ingridient));
        } else {
          commit('SET_USERNAME', ingridient.username);
          dispatch('toRunning');
          return true;
        }
      }
      return false;
    },
  },
};
