import API from '@/api';
import { encrypt, getLocal, setLocal } from 'fate-tools';

export default {
  state: {
    username: '',
  },

  mutations: {
    SET_USERNAME: (state: any, username: string) => {
      state.username = username;
    },

    SET_AUTH: (state: any, authOption?: any) => {
      if (!authOption) {
        setLocal('hasSignIn', '')
        state.username = '';
      } else {
        setLocal('hasSignIn', 'true')
        setLocal('ingridient', JSON.stringify(authOption));
        state.username = authOption.username
      }
    }
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
        commit('SET_AUTH', paramter);
      } else {
        commit('SET_AUTH');
      }
      return responseData;
    },

    async signOut({ commit }: any) {
      commit('SET_AUTH');
      setLocal('ingridient', '')
      return await (API as any).signOut();
    },

    async signInForMultPage({ commit, dispatch }: any) {
      let ingridient: any = getLocal('ingridient') || '';
      const hasSignIn = getLocal('hasSignIn')
      let result = false
      if (ingridient) {
        ingridient = JSON.parse(ingridient);
        if (!hasSignIn) {
          result = await dispatch('signIn', Object.assign({ security: true }, ingridient));
        } else {
          commit('SET_USERNAME', ingridient.username);
          result = true;
        }
      }
      if (!result) {
        setLocal('ingridient', '')
      }
      return result
    },
  },
};
