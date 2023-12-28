import API from '@/api';
import portConfigurationExplain from '@/utils/portCongifurationExplain';
import { ElMessage } from 'element-plus';
import { getLocal, setLocal } from 'fate-tools';
import { isObject } from 'lodash';

const KEY = 'PORT_CONFIGURAIONT';

export default {
  state: {
    status: undefined,
    role: undefined,
    ports: {}
  },

  mutations: {
    SET_STATUS(state: any, status: string[]) {
      state.status = status;
    },

    SET_ROLE(state: any, role: string[]) {
      state.role = role;
    },

    SET_PORT(state: any, port: object) {
      Object.assign(state.ports, port)
    },
    GET_PORT(state: any, name: string) {
      return state.ports[name]
    }
  },

  actions: {
    async GET_JOB_FIELDS({ commit, state }: any) {
      if (!state.role || !state.status) {
        const { role, status } = await (API as any).queryFileds();
        commit('SET_STATUS', status);
        commit('SET_ROLE', role);
      }
    },

    async portConfig({ commit }: any, name: string) {
      let configuration = commit('GET_PORT', name)
      let cache: any
      if (!configuration) {
        cache = getLocal(KEY)
        if (cache) {
          cache = JSON.parse(cache)
          if (cache && cache[name]) {
            commit('SET_PORT', cache)
            configuration = cache[name]
          }
        }
      }
      if (!configuration) {
        const responseData = await API.portConfig({
          componentName: name
        })
        if (isObject(responseData)) {
          configuration = portConfigurationExplain(responseData)
          if (!cache) cache = {}
          Object.assign(cache, { [name]: configuration })
          setLocal(KEY, JSON.stringify(cache))
        } else {
          ElMessage({
            showClose: true,
            message: `There has no configuration yaml for component ${name}`,
            center: true,
            type: 'error'
          })
          throw new Error('Explain failed')
        }
      }
      return configuration
    }
  },
};
