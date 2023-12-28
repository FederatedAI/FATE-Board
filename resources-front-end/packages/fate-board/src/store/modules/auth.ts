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
        state.username = '';
      } else {
        setLocal('ingridient', Object.values(authOption).join('AND'));
        state.username = authOption.username
      }
    }
  },

  actions: {
    async signIn(
      { commit, dispatch }: any,
      ingridient: { username: string; password: string }
    ) {
      // 数据加密
      const publicKey: string = await (API as any).getPublicKey();
      const paramter = {
        username: ingridient.username,
        password: encrypt(publicKey, ingridient.password)
      };
      const responseData = await (API as any).signIn(paramter);
      if (responseData === true) {
        commit('SET_AUTH', ingridient);
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
      let result = false
      if (ingridient) {
        const [ username, password ] = ingridient.split('AND');
        if (username && password) {
          result = await dispatch('signIn', {
            username, password
          });
        }
      }
      if (!result) {
        setLocal('ingridient', '')
      }
      return result
    },
  },
};
